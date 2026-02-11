package com.example.EncryptedFileSharing.dto;

import lombok.Data;

@Data
public class SignUpReq {
    private String username;
    private String email;
    private String password;
}
