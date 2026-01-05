package com.siamcode.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

@SpringBootApplication
@RestController
public class HelloAplication {

    public static void main(String[] args) {
        // Load environment variables (from .env file or system environment)
        loadEnvironmentVariables();

        SpringApplication.run(HelloAplication.class, args);
    }

    private static void loadEnvironmentVariables() {
        File envFile = new File(".env");

        // Check if running in Docker/Cloud (no .env file, use system env vars)
        if (!envFile.exists()) {
            System.out.println("==> Running in Docker/Cloud mode (no .env file)");
            System.out.println("==> Using environment variables from container");

            // In Docker/Render, env vars are already set in system environment
            // Just log what we're using
            String dbStatus = System.getenv("DB_STATUS");
            String databaseUrl = System.getenv("DATABASE_URL");

            if (databaseUrl != null) {
                System.out.println("    DATABASE_URL is set");
                // Set as system property for Spring to pick up
                System.setProperty("DATABASE_URL", databaseUrl);
            }

            String dbUsername = System.getenv("DATABASE_USERNAME");
            if (dbUsername != null) {
                System.setProperty("DATABASE_USERNAME", dbUsername);
            }

            String dbPassword = System.getenv("DATABASE_PASSWORD");
            if (dbPassword != null) {
                System.setProperty("DATABASE_PASSWORD", dbPassword);
            }

            // Copy all other important env vars to system properties
            copyEnvToProperty("JWT_SECRET");
            copyEnvToProperty("JWT_EXPIRATION");
            copyEnvToProperty("GEMINI_API_KEY");
            copyEnvToProperty("GEMINI_API_URL");
            copyEnvToProperty("GEMINI_MODEL");
            copyEnvToProperty("MAIL_USERNAME");
            copyEnvToProperty("MAIL_PASSWORD");
            copyEnvToProperty("FRONTEND_URL");

            System.out.println("==> Environment configured for cloud deployment\n");
            return;
        }

        // Local development - load from .env file
        System.out.println("==> Running in local development mode (.env file found)");

        try {
            Map<String, String> envVars = new HashMap<>();

            // Load all variables from .env file
            try (Scanner scanner = new Scanner(envFile)) {
                while (scanner.hasNextLine()) {
                    String line = scanner.nextLine().trim();
                    if (!line.isEmpty() && !line.startsWith("#") && line.contains("=")) {
                        String[] parts = line.split("=", 2);
                        String key = parts[0].trim();
                        String value = parts.length > 1 ? parts[1].trim() : "";
                        envVars.put(key, value);
                        System.setProperty(key, value);
                    }
                }
            }

            // Handle DB_STATUS switching for local development
            String dbStatus = envVars.get("DB_STATUS");

            if ("cloud".equalsIgnoreCase(dbStatus)) {
                System.out.println("    Using CLOUD database (Neon DB)");

                String cloudUrl = envVars.get("CLOUD_DATABASE_URL");
                String cloudUser = envVars.get("CLOUD_DATABASE_USERNAME");
                String cloudPass = envVars.get("CLOUD_DATABASE_PASSWORD");

                if (cloudUrl != null)
                    System.setProperty("DATABASE_URL", cloudUrl);
                if (cloudUser != null)
                    System.setProperty("DATABASE_USERNAME", cloudUser);
                if (cloudPass != null)
                    System.setProperty("DATABASE_PASSWORD", cloudPass);

            } else if ("local".equalsIgnoreCase(dbStatus)) {
                System.out.println("    Using LOCAL database");

                String localUrl = envVars.get("LOCAL_DATABASE_URL");
                String localUser = envVars.get("LOCAL_DATABASE_USERNAME");
                String localPass = envVars.get("LOCAL_DATABASE_PASSWORD");

                if (localUrl != null)
                    System.setProperty("DATABASE_URL", localUrl);
                if (localUser != null)
                    System.setProperty("DATABASE_USERNAME", localUser);
                if (localPass != null)
                    System.setProperty("DATABASE_PASSWORD", localPass);

            } else {
                System.out.println("    WARNING: DB_STATUS not set, using DATABASE_URL from .env");
            }

            System.out.println("==> Environment variables loaded from .env\n");

        } catch (Exception e) {
            System.err.println("ERROR: Failed to load .env file: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void copyEnvToProperty(String key) {
        String value = System.getenv(key);
        if (value != null && !value.isEmpty()) {
            System.setProperty(key, value);
        }
    }

}
