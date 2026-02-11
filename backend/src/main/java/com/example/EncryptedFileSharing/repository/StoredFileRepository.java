package com.example.EncryptedFileSharing.repository;

import com.example.EncryptedFileSharing.model.StoredFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoredFileRepository extends JpaRepository<StoredFile, Long> {

    List<StoredFile> findByUploadedBy(String username);
}
