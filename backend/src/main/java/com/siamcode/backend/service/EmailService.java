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

@Service
@Slf4j
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    /**
     * Send a simple text email
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
     * Send an HTML email
     */
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
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
            throw new RuntimeException("Failed to send email", e);
        }
    }

    /**
     * Send a welcome email to new users
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
     * Check if email service is configured
     */
    public boolean isConfigured() {
        return mailSender != null && !fromEmail.isEmpty();
    }
}
