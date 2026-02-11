package com.example.EncryptedFileSharing.service;

import com.example.EncryptedFileSharing.model.StoredFile;
import com.example.EncryptedFileSharing.repository.StoredFileRepository;
import com.example.EncryptedFileSharing.util.CryptoUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class FileEncryptionService {

    private final StoredFileRepository fileRepository;

    public StoredFile uploadFile(MultipartFile file, String username) throws Exception {

        byte[] encryptedBytes = CryptoUtil.encrypt(file.getBytes());



        StoredFile storedFile = StoredFile.builder()
                .fileName(file.getOriginalFilename())
                .contentType(file.getContentType())
                .uploadedBy(username)
                .encryptedData(encryptedBytes)
                .build();

        return fileRepository.save(storedFile);
    }

    public byte[] downloadFile(Long id) throws Exception {

        StoredFile file = fileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));


        byte[] encryptedBytes = file.getEncryptedData();


        byte[] decrypted = CryptoUtil.decrypt(encryptedBytes);
        return decrypted;
    }
}