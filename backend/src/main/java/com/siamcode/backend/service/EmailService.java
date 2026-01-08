package com.siamcode.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * Email service using Resend API (HTTP-based, works on Render free tier)
 * Fallback to Gmail SMTP if Resend is not configured
 */
@Service
@Slf4j
public class EmailService {

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${resend.from.email:onboarding@resend.dev}")
    private String resendFromEmail;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    // Auto-scaling thread pool for email sending - won't block HTTP threads
    private final Executor emailExecutor = Executors.newCachedThreadPool();

    // HTTP client with connection timeout to prevent hanging
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(java.time.Duration.ofSeconds(30))
            .build();

    @jakarta.annotation.PostConstruct
    public void init() {
        log.info("==> Email Service Configuration:");
        log.info("    Provider: {}", isConfigured() ? "RESEND (HTTP API)" : "DISABLED");
        log.info("    API Key: {}", resendApiKey.isEmpty() ? "NOT SET"
                : "***" + resendApiKey.substring(Math.max(0, resendApiKey.length() - 4)));
        log.info("    From Email: {}", resendFromEmail);
        log.info("    Frontend URL: {}", frontendUrl);
        log.info("    Status: {}", isConfigured() ? "READY" : "DISABLED");
    }

    /**
     * Check if email service is configured
     */
    public boolean isConfigured() {
        return !resendApiKey.isEmpty();
    }

    /**
     * Send email using Resend API (async)
     */
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        if (!isConfigured()) {
            log.warn("Email service not configured. Skipping email to: {}", to);
            return;
        }

        log.info("Queuing email to: {} via Resend (async)", to);
        CompletableFuture.runAsync(() -> doSendEmail(to, subject, htmlContent), emailExecutor)
                .exceptionally(ex -> {
                    log.error("Async email failed to {}: {}", to, ex.getMessage(), ex);
                    return null;
                });
    }

    /**
     * Actually send the email via Resend API
     */
    private void doSendEmail(String to, String subject, String htmlContent) {
        try {
            String jsonBody = """
                    {
                        "from": "%s",
                        "to": ["%s"],
                        "subject": "%s",
                        "html": %s
                    }
                    """.formatted(
                    resendFromEmail,
                    to,
                    subject.replace("\"", "\\\""),
                    escapeJson(htmlContent));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Email sent successfully to: {} via Resend", to);
            } else {
                log.error("Failed to send email to {}: Status={}, Response={}", to, response.statusCode(),
                        response.body());
            }
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
        }
    }

    /**
     * Escape string for JSON
     */
    private String escapeJson(String text) {
        if (text == null)
            return "null";
        return "\"" + text
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t")
                + "\"";
    }

    /**
     * Send a welcome email to new users (async)
     */
    public void sendWelcomeEmail(String to, String userName) {
        String subject = "Welcome to StandUpStrip!";
        String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #14b8a6;">Welcome to StandUpStrip!</h1>
                    <p>Hi %s,</p>
                    <p>Thank you for joining StandUpStrip! We're excited to help you and your team stay connected through daily standups.</p>
                    <p>Get started by:</p>
                    <ul>
                        <li>Creating or joining a team</li>
                        <li>Submitting your daily standup</li>
                        <li>Tracking your team's progress</li>
                    </ul>
                    <p>If you have any questions, feel free to reach out!</p>
                    <p>Best regards,<br/>The StandUpStrip Team</p>
                </div>
                """
                .formatted(userName);

        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send email verification link (async)
     */
    public void sendVerificationEmail(String to, String userName, String token) {
        String subject = "Verify your StandUpStrip email";
        String verificationUrl = frontendUrl + "/verify?token=" + token;

        String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background: #14b8a6; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">StandUpStrip</h1>
                    </div>
                    <div style="padding: 30px; background: white;">
                        <h2>Hi %s,</h2>
                        <p>Welcome to StandUpStrip! Please verify your email address to get started.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" style="background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
                        </div>
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="color: #64748b; font-size: 14px;">%s</p>
                        <p>This link will expire in 24 hours.</p>
                    </div>
                </div>
                """
                .formatted(userName, verificationUrl, verificationUrl);

        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send password reset link (async)
     */
    public void sendPasswordResetEmail(String to, String userName, String token) {
        String subject = "Reset your StandUpStrip password";
        String resetUrl = frontendUrl + "/reset-password?token=" + token;

        String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background: #ef4444; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">StandUpStrip</h1>
                    </div>
                    <div style="padding: 30px; background: white;">
                        <h2>Hi %s,</h2>
                        <p>We received a request to reset your password. Click the button below to choose a new password.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
                        </div>
                        <p>If you didn't request a password reset, you can safely ignore this email.</p>
                        <p>This link will expire in 1 hour.</p>
                    </div>
                </div>
                """
                .formatted(userName, resetUrl);

        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send team invitation email (async)
     */
    public void sendTeamInvitationEmail(String to, String teamName, String inviteCode, String ownerName) {
        String subject = "You've been invited to join " + teamName + " on StandUpStrip";
        String joinUrl = frontendUrl + "/join/" + inviteCode;

        String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background: #14b8a6; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">StandUpStrip</h1>
                    </div>
                    <div style="padding: 30px; background: white;">
                        <h2>Great news!</h2>
                        <p><strong>%s</strong> has invited you to join the team <strong>%s</strong> on StandUpStrip.</p>
                        <p>StandUpStrip helps teams stay aligned with asynchronous daily standups and AI-powered summaries.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" style="background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Join Team</a>
                        </div>
                        <p>Or use the invite code: <strong style="font-size: 18px; color: #14b8a6;">%s</strong></p>
                    </div>
                </div>
                """
                .formatted(ownerName, teamName, joinUrl, inviteCode);

        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send blocker alert email to team owner (async)
     */
    public void sendBlockerAlert(String ownerEmail, String userName, String teamName, String blockerText) {
        String subject = "Blocker Alert: " + userName + " in " + teamName;
        String dashboardUrl = frontendUrl + "/teams";

        String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 12px; overflow: hidden;">
                    <div style="background: #ef4444; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Blocker Alert</h1>
                    </div>
                    <div style="padding: 30px; background: white;">
                        <p><strong>%s</strong> reported a blocker in the team <strong>%s</strong>:</p>
                        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; color: #991b1b;">
                            %s
                        </div>
                        <p>You can view more details on the team dashboard.</p>
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="%s" style="color: #ef4444; font-weight: bold;">Go to Dashboard</a>
                        </div>
                    </div>
                </div>
                """
                .formatted(userName, teamName, blockerText, dashboardUrl);

        sendHtmlEmail(ownerEmail, subject, htmlContent);
    }
}
