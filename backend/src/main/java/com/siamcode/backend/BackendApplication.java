package com.siamcode.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication

@RestController
public class BackendApplication {

	public static void main(String[] args) {
		// Manually load .env file from backend directory or current directory
		java.io.File envFile = new java.io.File("backend/.env");
		if (!envFile.exists()) {
			envFile = new java.io.File(".env");
		}

		if (envFile.exists()) {
			try (java.util.Scanner scanner = new java.util.Scanner(envFile)) {
				while (scanner.hasNextLine()) {
					String line = scanner.nextLine().trim();
					if (!line.isEmpty() && !line.startsWith("#") && line.contains("=")) {
						String[] parts = line.split("=", 2);
						String key = parts[0].trim();
						String value = parts[1].trim();
						System.setProperty(key, value);
						// Also set in environment for Spring if possible, but System.setProperty works
						// for Spring @Value
					}
				}
				System.out.println("Loaded .env file successfully");
			} catch (Exception e) {
				System.err.println("Failed to load .env file: " + e.getMessage());
			}
		} else {
			System.out.println(".env file not found in current directory: " + envFile.getAbsolutePath());
		}

		SpringApplication.run(BackendApplication.class, args);
	}

}
