package com.example.EncryptedFileSharing.service;

import com.example.EncryptedFileSharing.util.UserDetails;
import com.example.EncryptedFileSharing.dto.LoginResponse;
import com.example.EncryptedFileSharing.repository.UserRepository;
import com.example.EncryptedFileSharing.dto.LoginRequest;
import com.example.EncryptedFileSharing.dto.SignUpReq;
import com.example.EncryptedFileSharing.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;;

    public String register(SignUpReq request){
        if(userRepository.findByUsername(request.getUsername()).isPresent()) {
            return "username already exist";
        }
        if(userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "email already exist";
        }

       UserDetails user=UserDetails.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);
        return "user created successfully";

    }
    public LoginResponse login(LoginRequest request){
        UserDetails user=userRepository.findByUsername(request.getUsername()).orElse(null);
        if(user==null){
            return new LoginResponse(null,"User not found");
        }
        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            return new LoginResponse(null,"invalid password");
        }


        String token =jwtUtil.generateToken(user.getUsername());
        return new LoginResponse(token,"login successful");
    }
}
