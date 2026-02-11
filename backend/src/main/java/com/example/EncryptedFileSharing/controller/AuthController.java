package com.example.EncryptedFileSharing.controller;

import com.example.EncryptedFileSharing.util.UserDetails;
import com.example.EncryptedFileSharing.dto.LoginRequest;
import com.example.EncryptedFileSharing.dto.LoginResponse;
import com.example.EncryptedFileSharing.dto.SignUpReq;
import com.example.EncryptedFileSharing.repository.UserRepository;
import com.example.EncryptedFileSharing.security.JwtUtil;
import com.example.EncryptedFileSharing.service.OtpService;
import com.example.EncryptedFileSharing.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final UserRepository userRepository;
    private final OtpService otpService;
    private final JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignUpReq request){
        String res= userService.register(request);
        return ResponseEntity.ok(res);
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request){
        LoginResponse response= userService.login(request);
        if (response.getToken() == null) {

            return ResponseEntity.badRequest().body(response.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@RequestParam String usernameOrEmail) {

        System.out.println("DEBUG: requestOtp HIT");

        UserDetails user = userRepository.findByUsername(usernameOrEmail)
                .orElseGet(() ->
                        userRepository.findByEmail(usernameOrEmail).orElse(null)
                );

        if (user == null) {
            System.out.println("DEBUG: user not found");
            return ResponseEntity.badRequest().body("User not found");
        }

        System.out.println("DEBUG: user found = " + user.getUsername());

        otpService.generateOtp(user.getUsername(), user.getEmail());

        System.out.println("DEBUG: otpService called");

        return ResponseEntity.ok("OTP sent successfully");
    }
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String username, @RequestParam String code) {
        boolean ok = otpService.verifyOtp(username, code);
        if (!ok) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP");
        }


        userRepository.findByUsername(username).ifPresent(u -> {
            u.setEnabled(true);
            userRepository.save(u);
        });


        String token = jwtUtil.generateToken(username);
        return ResponseEntity.ok(Map.of("token", token, "message", "OTP verified"));



    }

}
