package com.example.EncryptedFileSharing.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "stored_file")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoredFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    // --- ADD THIS FIELD FOR MIME TYPE FIX (Crucial for download) ---
    @Column(nullable = false)
    private String contentType;

    @Column(nullable = false)
    private String uploadedBy;

    @Lob // JPA annotation for large object
    // Note: The specific database column type (BLOB, BYTEA, etc.) will be
    // handled automatically by your JPA provider (e.g., Hibernate) based on this byte[].

    @Column(columnDefinition = "LONGBLOB", nullable = false)
    private byte[] encryptedData; // <-- CORRECT TYPE for encrypted files

    @Builder.Default
    private Instant createdAt = Instant.now();
}