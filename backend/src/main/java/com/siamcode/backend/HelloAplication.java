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
        // Load .env file and handle DB_STATUS switching
        loadEnvironmentVariables();

        SpringApplication.run(HelloAplication.class, args);
    }

    private static void loadEnvironmentVariables() {
        File envFile = new File(".env");

        if (!envFile.exists()) {
            System.out.println("WARNING: No .env file found. Using application.properties defaults.");
            return;
        }

        try {
            Map<String, String> envVars = new HashMap<>();

            // First pass: Load all variables
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

            // Second pass: Handle DB_STATUS switching
            String dbStatus = envVars.get("DB_STATUS");

            if ("cloud".equalsIgnoreCase(dbStatus)) {
                System.out.println("\n==> Using CLOUD database (Neon DB)");

                String cloudUrl = envVars.get("CLOUD_DATABASE_URL");
                String cloudUser = envVars.get("CLOUD_DATABASE_USERNAME");
                String cloudPass = envVars.get("CLOUD_DATABASE_PASSWORD");

                if (cloudUrl != null)
                    System.setProperty("DATABASE_URL", cloudUrl);
                if (cloudUser != null)
                    System.setProperty("DATABASE_USERNAME", cloudUser);
                if (cloudPass != null)
                    System.setProperty("DATABASE_PASSWORD", cloudPass);

                System.out.println("    Database: Neon DB (Cloud)");

            } else if ("local".equalsIgnoreCase(dbStatus)) {
                System.out.println("\n==> Using LOCAL database");

                String localUrl = envVars.get("LOCAL_DATABASE_URL");
                String localUser = envVars.get("LOCAL_DATABASE_USERNAME");
                String localPass = envVars.get("LOCAL_DATABASE_PASSWORD");

                if (localUrl != null)
                    System.setProperty("DATABASE_URL", localUrl);
                if (localUser != null)
                    System.setProperty("DATABASE_USERNAME", localUser);
                if (localPass != null)
                    System.setProperty("DATABASE_PASSWORD", localPass);

                System.out.println("    Database: PostgreSQL (Local)");

            } else {
                System.out.println("\nWARNING: DB_STATUS not set or invalid. Using DATABASE_URL from .env");
            }

            System.out.println("==> Environment variables loaded from .env\n");

        } catch (Exception e) {
            System.err.println("ERROR: Failed to load .env file: " + e.getMessage());
            e.printStackTrace();
        }
    }

}
