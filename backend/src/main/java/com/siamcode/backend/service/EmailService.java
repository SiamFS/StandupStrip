package com.siamcode.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@Service
@Slf4j
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    // Dedicated thread pool for email sending - won't block HTTP threads
    private final Executor emailExecutor = Executors.newFixedThreadPool(2);

    @jakarta.annotation.PostConstruct
    public void init() {
        log.info("==> Email Service Configuration:");
        log.info("    mailSender: {}", mailSender != null ? "CONFIGURED" : "NOT CONFIGURED");
        log.info("    fromEmail: {}", fromEmail.isEmpty() ? "NOT SET" : fromEmail);
        log.info("    Status: {}", isConfigured() ? "READY" : "DISABLED");
        log.info("    Async: ENABLED (using dedicated thread pool)");
    }

    /**
     * Send a simple text email (synchronous - use for testing only)
     */
    public void sendSimpleEmail(String to, String subject, String body) {
        if (mailSender == null || fromEmail.isEmpty()) {
            log.warn("Email service not configured. Skipping email to: {}", to);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("Simple email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send simple email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    /**
     * Internal method to actually send the HTML email (runs in background thread)
     */
    private void doSendHtmlEmail(String to, String subject, String htmlContent) {
        if (mailSender == null || fromEmail.isEmpty()) {
            log.warn("Email service not configured. Skipping email to: {}", to);
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = isHtml

            mailSender.send(mimeMessage);
            log.info("HTML email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send HTML email to {}: {}", to, e.getMessage());
            // Don't throw - just log the error
        }
    }

    /**
     * Send an HTML email ASYNCHRONOUSLY using dedicated thread pool.
     * Returns immediately - email sends in background.
     */
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        log.info("Queuing HTML email to: {} (async)", to);
        CompletableFuture.runAsync(() -> doSendHtmlEmail(to, subject, htmlContent), emailExecutor);
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
        String verificationUrl = "http://localhost:3000/verify?token=" + token;

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
        String resetUrl = "http://localhost:3000/reset-password?token=" + token;

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
        String joinUrl = "http://localhost:3000/join/" + inviteCode;

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
        String subject = "🚨 Blocker Alert: " + userName + " in " + teamName;

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
                            <a href="http://localhost:3000/teams" style="color: #ef4444; font-weight: bold;">Go to Dashboard &rarr;</a>
                        </div>
                    </div>
                </div>
                """
                .formatted(userName, teamName, blockerText);

        sendHtmlEmail(ownerEmail, subject, htmlContent);
    }

    /**
     * Check if email service is configured
     */
    public boolean isConfigured() {
        return mailSender != null && !fromEmail.isEmpty();
    }
}
