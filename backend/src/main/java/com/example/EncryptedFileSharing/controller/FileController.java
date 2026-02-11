package com.example.EncryptedFileSharing.controller;

import com.example.EncryptedFileSharing.model.FileAccess;
import com.example.EncryptedFileSharing.model.StoredFile;
import com.example.EncryptedFileSharing.repository.FileAccessRepository;
import com.example.EncryptedFileSharing.repository.StoredFileRepository;
import com.example.EncryptedFileSharing.service.FileEncryptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final FileEncryptionService fileService;
    private final StoredFileRepository fileRepository;
    private final FileAccessRepository fileAccessRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String username = SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getName();

            System.out.println("Uploading file: " + file.getOriginalFilename() +
                    ", Size: " + file.getSize() + " bytes");

            StoredFile saved = fileService.uploadFile(file, username);

            Map<String, Object> resp = new HashMap<>();
            resp.put("id", saved.getId());
            resp.put("fileName", saved.getFileName());
            resp.put("message", "File uploaded and encrypted successfully");

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            System.err.println("Upload error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }

    @GetMapping("/my-files")
    public ResponseEntity<List<Map<String, Object>>> myFiles() {
        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        List<Map<String, Object>> files = fileRepository
                .findByUploadedBy(username)
                .stream()
                .map(f -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", f.getId());
                    map.put("fileName", f.getFileName());
                    map.put("uploadedAt", f.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(files);
    }



    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id) {
        try {
            String username = SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getName();

            StoredFile file = fileRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("File not found"));

            boolean isOwner = file.getUploadedBy().equals(username);
            boolean isShared = !fileAccessRepository
                    .findByFileIdAndSharedWith(id, username)
                    .isEmpty();


            if (!isOwner && !isShared) {
                return ResponseEntity.status(403).build();
            }

            // Decrypt the file
            byte[] decryptedData = fileService.downloadFile(id);

            // --- THE FINAL FIX ---
            // Use the original MIME type stored in the database
            String originalContentType = file.getContentType();

            // Use the original filename stored in the database
            String originalFileName = file.getFileName();

            // Use a default binary stream if the type is somehow missing
            MediaType mediaType = originalContentType != null
                    ? MediaType.parseMediaType(originalContentType)
                    : MediaType.APPLICATION_OCTET_STREAM;

            return ResponseEntity.ok()
                    // Content-Disposition: This correctly sets the filename (e.g., "photo.jpg")
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + originalFileName + "\"")
                    // Content-Type: This tells the browser the exact file format (e.g., "image/jpeg")
                    .contentType(mediaType)
                    .body(decryptedData);

        } catch (Exception e) {
            System.err.println("Download error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/share")
    public ResponseEntity<?> shareFile(
            @RequestParam Long fileId,
            @RequestParam String usernameToShare
    ) {
        try {
            String owner = SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getName();

            StoredFile file = fileRepository.findById(fileId)
                    .orElseThrow(() -> new RuntimeException("File not found"));

            if (!file.getUploadedBy().equals(owner)) {
                return ResponseEntity.status(403).body("Only owner can share");
            }

            fileAccessRepository.save(
                    FileAccess.builder()
                            .fileId(fileId)
                            .sharedBy(owner)
                            .sharedWith(usernameToShare)
                            .build()
            );

            return ResponseEntity.ok("File shared successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("Share failed: " + e.getMessage());
        }
    }

    @GetMapping("/shared-with-me")
    public ResponseEntity<List<Map<String, Object>>> sharedWithMe() {
        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        List<Map<String, Object>> files = fileAccessRepository
                .findBySharedWith(username)
                .stream()
                .map(access -> {
                    StoredFile file = fileRepository
                            .findById(access.getFileId())
                            .orElse(null);

                    if (file == null) return null;

                    Map<String, Object> map = new HashMap<>();
                    map.put("id", file.getId());
                    map.put("fileName", file.getFileName());
                    map.put("sharedBy", access.getSharedBy());
                    return map;
                })
                .filter(Objects::nonNull)
                .toList();

        return ResponseEntity.ok(files);
    }
}