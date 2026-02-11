package com.example.EncryptedFileSharing.service;

import com.example.EncryptedFileSharing.model.OtpCode;
import com.example.EncryptedFileSharing.repository.OtpRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpRepo otpRepo;
    private final EmailService emailService;

    // Generate & send OTP
    public void generateOtp(String username, String toEmail) {

        // Optional: invalidate old OTPs
        otpRepo.findTopByUsernameAndUsedFalse(username)
                .ifPresent(oldOtp -> {
                    oldOtp.setUsed(true);
                    otpRepo.save(oldOtp);
                });

        String code = String.format("%06d", new Random().nextInt(1_000_000));

        OtpCode otpCode = OtpCode.builder()
                .username(username)
                .code(code)
                .expiresAt(Instant.now().plus(5, ChronoUnit.MINUTES))
                .used(false)
                .build();

        otpRepo.save(otpCode);

        String message =
                "Your verification code: " + code +
                        "\nThis code expires in 5 minutes.";

        emailService.MailSender(toEmail, "Your OTP Code", message);

        // TEMP (DEV ONLY) — remove later
        System.out.println("DEBUG OTP for " + username + " => " + code);
    }

    // Verify OTP
    public boolean verifyOtp(String username, String code) {

        return otpRepo.findTopByUsernameAndUsedFalse(username)
                .filter(otp -> otp.getCode().equals(code))
                .filter(otp -> otp.getExpiresAt().isAfter(Instant.now()))
                .map(otp -> {
                    otp.setUsed(true);
                    otpRepo.save(otp);
                    return true;
                })
                .orElse(false);
    }
}
