import { API_BASE_URL } from "./endpoints";

interface RequestOptions extends RequestInit {
    headers?: Record<string, string>;
}

class ApiClient {
    private static getToken(): string | null {
        if (typeof window !== "undefined") {
            return localStorage.getItem("token");
        }
        return null;
    }

    private static async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = this.getToken();
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            ...options.headers,
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        // Add timeout of 30 seconds
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                cache: "no-store", // Disable Next.js fetch caching
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 401) {
                    if (typeof window !== "undefined") {
                        // Unauthorized access handling
                    }
                }
                const errorText = await response.text();
                let errorMessage = errorText || `API Request Failed: ${response.statusText}`;

                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.message) {
                        errorMessage = errorJson.message;
                    }
                } catch (e) {
                    // Use default message if JSON parsing fails
                }

                throw new Error(errorMessage);
            }

            // Handle 204 No Content or empty response body
            if (response.status === 204) {
                return {} as T;
            }

            // Check if response body is empty before parsing
            const text = await response.text();
            if (!text || text.trim() === '') {
                return {} as T;
            }

            // Try to parse as JSON, fallback to returning text as-is for plain text responses
            try {
                return JSON.parse(text) as T;
            } catch {
                return text as T;
            }
        } catch (error) {
            clearTimeout(timeoutId);

            // Handle timeout specifically
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Request timeout - the server took too long to respond. Please try again.');
            }

            throw error;
        }
    }

    static get<T>(url: string): Promise<T> {
        return this.request<T>(url, { method: "GET" });
    }

    static post<T>(url: string, body: any): Promise<T> {
        return this.request<T>(url, {
            method: "POST",
            body: JSON.stringify(body),
        });
    }

    static put<T>(url: string, body: any): Promise<T> {
        return this.request<T>(url, {
            method: "PUT",
            body: JSON.stringify(body),
        });
    }

    static delete<T>(url: string): Promise<T> {
        return this.request<T>(url, { method: "DELETE" });
    }
}

export default ApiClient;
