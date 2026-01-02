package com.siamcode.backend.service;

import com.siamcode.backend.config.AIConfig;
import com.siamcode.backend.entity.Standup;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AIService {

    private final AIConfig aiConfig;
    private final RestTemplate restTemplate;

    public AIService(AIConfig aiConfig) {
        this.aiConfig = aiConfig;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Generate a standup summary using Google Gemini AI.
     * Falls back to template-based summary if Gemini is not configured.
     */
    public String generateStandupSummary(List<Standup> standups) {
        if (standups == null || standups.isEmpty()) {
            return "No standups submitted for this date.";
        }

        log.info("Generating summary for {} standups", standups.size());

        // Check if Gemini is configured
        if (!aiConfig.isConfigured()) {
            log.warn("Gemini API key not configured. Using fallback template-based summary.");
            return generateFallbackSummary(standups);
        }

        try {
            return generateGeminiSummary(standups);
        } catch (Exception e) {
            log.error("Error calling Gemini API: {}. Falling back to template-based summary.", e.getMessage());
            return generateFallbackSummary(standups);
        }
    }

    /**
     * Call Gemini API to generate AI summary
     */
    @SuppressWarnings("unchecked")
    private String generateGeminiSummary(List<Standup> standups) {
        String prompt = buildPrompt(standups);

        log.info("Calling Gemini API with model: {}", aiConfig.getModel());

        // Build the request body for Gemini API
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)))),
                "generationConfig", Map.of(
                        "temperature", 0.7,
                        "topK", 40,
                        "topP", 0.95,
                        "maxOutputTokens", 2048));

        // Build the URL
        String url = String.format("%s/models/%s:generateContent?key=%s",
                aiConfig.getApiUrl(), aiConfig.getModel(), aiConfig.getApiKey());

        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String extractedText = extractTextFromGeminiResponse(response.getBody());
                if (extractedText != null) {
                    return extractedText;
                }
            }
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage());
            throw e;
        }

        return generateFallbackSummary(standups);
    }

    /**
     * Extract the generated text from Gemini API response
     */
    @SuppressWarnings("unchecked")
    private String extractTextFromGeminiResponse(Map<?, ?> response) {
        try {
            List<?> candidates = (List<?>) response.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
                Map<?, ?> content = (Map<?, ?>) candidate.get("content");
                if (content != null) {
                    List<?> parts = (List<?>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        Map<?, ?> part = (Map<?, ?>) parts.get(0);
                        String text = (String) part.get("text");
                        if (text != null) {
                            return text;
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error parsing Gemini response: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Build the prompt for Gemini
     */
    private String buildPrompt(List<Standup> standups) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a helpful assistant that summarizes daily standup meetings. ");
        prompt.append("Please analyze the following team standup updates and provide a concise, ");
        prompt.append("actionable summary. Format the output in a clear, readable way with emojis.\n\n");
        prompt.append("=== TEAM STANDUP ENTRIES ===\n\n");

        for (int i = 0; i < standups.size(); i++) {
            Standup standup = standups.get(i);
            prompt.append(String.format("Team Member %d:\n", i + 1));
            prompt.append(String.format("  Yesterday: %s\n",
                    standup.getYesterdayText() != null ? standup.getYesterdayText() : "Not provided"));
            prompt.append(String.format("  Today: %s\n",
                    standup.getTodayText() != null ? standup.getTodayText() : "Not provided"));
            prompt.append(String.format("  Blockers: %s\n\n",
                    standup.getBlockersText() != null ? standup.getBlockersText() : "None"));
        }

        prompt.append("Please provide:\n");
        prompt.append("1. 📊 A brief overview (1-2 sentences)\n");
        prompt.append("2. ✅ Key accomplishments from yesterday (bullet points)\n");
        prompt.append("3. 🎯 Today's focus areas (bullet points)\n");
        prompt.append("4. 🚧 Blockers that need attention (if any)\n");
        prompt.append("5. 💡 Key insights or recommendations\n");
        prompt.append("\nKeep the summary concise but comprehensive.");

        return prompt.toString();
    }

    /**
     * Fallback: Generate a template-based summary when Gemini is not available
     */
    private String generateFallbackSummary(List<Standup> standups) {
        StringBuilder summary = new StringBuilder();
        summary.append("=== TEAM STANDUP SUMMARY ===\n\n");

        // Overview
        summary.append("📊 **Overview**\n");
        summary.append(String.format("- Total participants: %d\n", standups.size()));
        summary.append(String.format("- Date: %s\n\n", standups.get(0).getDate()));

        // Yesterday's accomplishments
        summary.append("✅ **Yesterday's Accomplishments**\n");
        standups.forEach(standup -> {
            if (standup.getYesterdayText() != null && !standup.getYesterdayText().trim().isEmpty()) {
                summary.append(String.format("- %s\n", standup.getYesterdayText()));
            }
        });
        summary.append("\n");

        // Today's plans
        summary.append("🎯 **Today's Plans**\n");
        standups.forEach(standup -> {
            if (standup.getTodayText() != null && !standup.getTodayText().trim().isEmpty()) {
                summary.append(String.format("- %s\n", standup.getTodayText()));
            }
        });
        summary.append("\n");

        // Blockers
        List<String> blockers = standups.stream()
                .filter(s -> s.getBlockersText() != null && !s.getBlockersText().trim().isEmpty())
                .map(Standup::getBlockersText)
                .collect(Collectors.toList());

        if (!blockers.isEmpty()) {
            summary.append("🚧 **Blockers & Impediments**\n");
            blockers.forEach(blocker -> summary.append(String.format("- %s\n", blocker)));
            summary.append("\n");
        } else {
            summary.append("✨ **No blockers reported!**\n\n");
        }

        // Key insights
        summary.append("💡 **Key Insights**\n");
        summary.append(String.format("- Team is %s\n", blockers.isEmpty() ? "running smoothly with no blockers"
                : "facing " + blockers.size() + " blocker(s)"));
        summary.append(String.format("- %d team members actively working\n", standups.size()));
        summary.append(
                "\n⚠️ *Note: This is a template-based summary. Configure GEMINI_API_KEY for AI-powered summaries.*");

        return summary.toString();
    }
}
