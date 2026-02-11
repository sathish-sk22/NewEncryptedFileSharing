package com.example.EncryptedFileSharing.repository;

import com.example.EncryptedFileSharing.model.FileAccess;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FileAccessRepository extends JpaRepository<FileAccess, Long> {

    List<FileAccess> findBySharedWith(String username);

    List<FileAccess> findByFileIdAndSharedWith(Long fileId, String username);
    Optional<FileAccess> findFirstByFileIdAndSharedWith(Long fileId, String username);
}
