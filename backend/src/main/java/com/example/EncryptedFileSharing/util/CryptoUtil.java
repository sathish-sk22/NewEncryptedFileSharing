package com.example.EncryptedFileSharing.util;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

public class CryptoUtil {

    private static final String ALGO = "AES";
    private static final String TRANSFORMATION = "AES/CBC/PKCS5Padding";

    // Better: Load from environment variable
    private static final String SECRET_KEY = System.getenv("ENCRYPTION_KEY") != null
            ? System.getenv("ENCRYPTION_KEY")
            : "MySecretKey12345";


    public static byte[] encrypt(byte[] data) throws Exception {
        if (data == null || data.length == 0) {
            throw new IllegalArgumentException("Data to encrypt cannot be null or empty");
        }

        // Generate random IV
        byte[] iv = new byte[16];
        SecureRandom random = new SecureRandom();
        random.nextBytes(iv);
        IvParameterSpec ivSpec = new IvParameterSpec(iv);

        SecretKeySpec key = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), ALGO);
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.ENCRYPT_MODE, key, ivSpec);

        byte[] encrypted = cipher.doFinal(data);


        ByteBuffer buffer = ByteBuffer.allocate(iv.length + encrypted.length);
        buffer.put(iv);
        buffer.put(encrypted);

        byte[] result = buffer.array();
        System.out.println("Encryption successful. Original: " + data.length +
                " bytes, Encrypted (with IV): " + result.length + " bytes");
        return result;
    }


    public static byte[] decrypt(byte[] encryptedData) throws Exception {
        if (encryptedData == null || encryptedData.length < 16) {
            throw new IllegalArgumentException("Encrypted data must be at least 16 bytes (IV size)");
        }

        System.out.println("Attempting to decrypt data of size: " + encryptedData.length);

        ByteBuffer buffer = ByteBuffer.wrap(encryptedData);
        byte[] iv = new byte[16];
        buffer.get(iv);


        byte[] encrypted = new byte[buffer.remaining()];
        buffer.get(encrypted);

        IvParameterSpec ivSpec = new IvParameterSpec(iv);
        SecretKeySpec key = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), ALGO);
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.DECRYPT_MODE, key, ivSpec);

        byte[] decrypted = cipher.doFinal(encrypted);
        System.out.println("Decryption successful. Decrypted size: " + decrypted.length);
        return decrypted;
    }


    public static String encryptToBase64(byte[] data) throws Exception {
        byte[] encrypted = encrypt(data);
        return Base64.getEncoder().encodeToString(encrypted);
    }


    public static byte[] decryptFromBase64(String base64Data) throws Exception {
        byte[] encrypted = Base64.getDecoder().decode(base64Data);
        return decrypt(encrypted);
    }
}