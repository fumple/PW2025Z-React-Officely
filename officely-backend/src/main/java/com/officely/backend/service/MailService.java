package com.officely.backend.service;

import com.officely.backend.config.MailConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class MailService {
    private final MailConfig config;

    private void send(String to, String subject, String content) {
        var sender = new JavaMailSenderImpl();
        sender.setHost(config.getHost());
        var message = new SimpleMailMessage();
        message.setFrom(config.getFrom());
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        sender.send(message);
    }

    public void sendPasswordResetEmail(String name, String email, String code) {
        var emailParts = email.split("@", 2);
        if(emailParts.length != 2 || config.getDomainWhitelist().stream().noneMatch(e -> emailParts[1].equalsIgnoreCase(e))) {
            // Silently discard incorrect emails
            return;
        }
        var content = "Hello " + name + "! This is Officely.\n\n" +
                "We have received a reset password request for your account.\n\n" +
                "If this was you, please enter the code " + code + " on the website in order to proceed with resetting your password.\n" +
                "The code expires in 15 minutes.\n\n" +
                "If this wasn't you, you may ignore this message.\n\n" +
                "Thank you for using Officely!\n\n";
        send(String.format("%s <%s>", name, email), "Officely password reset request", content);
    }

}
