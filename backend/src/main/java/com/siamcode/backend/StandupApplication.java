package com.siamcode.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

/**
 * Main Spring Boot application class for StandUpStrip.
 * Handles environment variable loading with DB_STATUS switching
 * for local/cloud database configuration.
 */
@SpringBootApplication
@org.springframework.scheduling.annotation.EnableAsync
public class StandupApplication {

    public static void main(String[] args) {
        loadEnvironmentVariables();
        SpringApplication.run(StandupApplication.class, args);
    }

    /**
     * Load environment variables from .env file for local development,
     * or from system environment for Docker/Cloud deployment.
     */
    private static void loadEnvironmentVariables() {
        File envFile = new File(".env");

        if (!envFile.exists()) {
            // Docker/Cloud mode - use system environment variables
            System.out.println("==> Running in Docker/Cloud mode (no .env file)");
            System.out.println("==> Using environment variables from container");

            copyEnvToProperty("DATABASE_URL");
            copyEnvToProperty("DATABASE_USERNAME");
            copyEnvToProperty("DATABASE_PASSWORD");
            copyEnvToProperty("JWT_SECRET");
            copyEnvToProperty("JWT_EXPIRATION");
            copyEnvToProperty("GEMINI_API_KEY");
            copyEnvToProperty("GEMINI_API_URL");
            copyEnvToProperty("GEMINI_MODEL");
            copyEnvToProperty("RESEND_API_KEY");
            copyEnvToProperty("RESEND_FROM_EMAIL");
            copyEnvToProperty("FRONTEND_URL");

            System.out.println("==> Environment configured for cloud deployment\n");
            return;
        }

        // Local development - load from .env file
        System.out.println("==> Loading .env file for local development...");

        try {
            Map<String, String> envVars = new HashMap<>();

            try (Scanner scanner = new Scanner(envFile)) {
                while (scanner.hasNextLine()) {
                    String line = scanner.nextLine().trim();
                    if (!line.isEmpty() && !line.startsWith("#") && line.contains("=")) {
                        String[] parts = line.split("=", 2);
                        String key = parts[0].trim();
                        String value = parts.length > 1 ? parts[1].trim() : "";

                        // Remove surrounding quotes if present
                        if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                            value = value.substring(1, value.length() - 1);
                        }

                        envVars.put(key, value);
                        System.setProperty(key, value);
                    }
                }
            }

            // Handle DB_STATUS switching
            String dbStatus = envVars.get("DB_STATUS");

            if ("cloud".equalsIgnoreCase(dbStatus)) {
                System.out.println("    Database: Neon DB (Cloud)");
                setDbProperties(envVars, "CLOUD_DATABASE_URL", "CLOUD_DATABASE_USERNAME", "CLOUD_DATABASE_PASSWORD");
            } else if ("local".equalsIgnoreCase(dbStatus)) {
                System.out.println("    Database: PostgreSQL (Local)");
                setDbProperties(envVars, "LOCAL_DATABASE_URL", "LOCAL_DATABASE_USERNAME", "LOCAL_DATABASE_PASSWORD");
            } else {
                System.out.println("    WARNING: DB_STATUS not set, using DATABASE_URL from .env");
            }

            // Debug output for email configuration
            String resendKey = envVars.get("RESEND_API_KEY");
            System.out.println(
                    "    Resend API: " + (resendKey != null && !resendKey.isEmpty() ? "CONFIGURED" : "NOT SET"));

            System.out.println("==> Environment variables loaded successfully\n");

        } catch (Exception e) {
            System.err.println("ERROR: Failed to load .env file: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void setDbProperties(Map<String, String> envVars, String urlKey, String userKey, String passKey) {
        String url = envVars.get(urlKey);
        String user = envVars.get(userKey);
        String pass = envVars.get(passKey);

        if (url != null)
            System.setProperty("DATABASE_URL", url);
        if (user != null)
            System.setProperty("DATABASE_USERNAME", user);
        if (pass != null)
            System.setProperty("DATABASE_PASSWORD", pass);
    }

    private static void copyEnvToProperty(String key) {
        String value = System.getenv(key);
        if (value != null && !value.isEmpty()) {
            System.setProperty(key, value);
        }
    }
}
