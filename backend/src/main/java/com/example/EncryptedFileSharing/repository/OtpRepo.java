package com.example.EncryptedFileSharing.repository;


import com.example.EncryptedFileSharing.model.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepo extends JpaRepository<OtpCode,Long> {
    Optional<OtpCode> findTopByUsernameAndUsedFalse(String username);
}
