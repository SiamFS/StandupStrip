package com.siamcode.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class BackendController {

    @Value("${spring.application.name:StandUpStrip API}")
    private String appName;

    @GetMapping("/")
    public Map<String, Object> welcome() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("application", "StandUpStrip API");
        response.put("version", "1.0.0");
        response.put("status", "running");
        response.put("message", "Welcome to the StandUpStrip Backend API!");
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        Map<String, String> endpoints = new LinkedHashMap<>();
        endpoints.put("auth", "/api/auth/login, /api/auth/register");
        endpoints.put("users", "/api/users");
        endpoints.put("teams", "/api/teams");
        endpoints.put("standups", "/api/standups");
        endpoints.put("summaries", "/api/standup-summaries");
        endpoints.put("health", "/hello");
        response.put("endpoints", endpoints);

        Map<String, String> documentation = new LinkedHashMap<>();
        documentation.put("postman", "See StandUpStrip_Postman_Collection.json");
        documentation.put("readme", "See README.md for setup instructions");
        response.put("documentation", documentation);

        return response;
    }

    @GetMapping("/hello")
    public Map<String, String> hello() {
        Map<String, String> response = new LinkedHashMap<>();
        response.put("status", "healthy");
        response.put("message", "Hello from StandUpStrip API! 👋");
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return response;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("service", "standupmeet-backend");
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return response;
    }

    @org.springframework.beans.factory.annotation.Autowired
    private com.siamcode.backend.service.EmailService emailService;

    @GetMapping("/test-email")
    public Map<String, Object> testEmail(@org.springframework.web.bind.annotation.RequestParam String to) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("to", to);
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        try {
            response.put("configured", emailService.isConfigured());

            if (!emailService.isConfigured()) {
                response.put("status", "ERROR");
                response.put("message", "Email service not configured");
                return response;
            }

            // Send a test email synchronously to see the error
            emailService.sendHtmlEmail(to, "Test Email from StandUpStrip",
                    "<h1>Test Email</h1><p>This is a test email from StandUpStrip to verify email sending works.</p>");

            response.put("status", "QUEUED");
            response.put("message", "Email queued for sending. Check server logs for result.");
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("message", e.getMessage());
            response.put("error", e.getClass().getName());
        }

        return response;
    }
}
