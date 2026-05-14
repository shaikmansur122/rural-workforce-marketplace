package com.ruralworkforce.marketplace.controller;

import com.ruralworkforce.marketplace.entity.User;
import com.ruralworkforce.marketplace.exception.ApiException;
import com.ruralworkforce.marketplace.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/upload")
public class UploadController {

    private final UserRepository userRepository;

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    public UploadController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * POST /upload/profile-image
     * Accepts a multipart image file, saves it to disk, updates user's profileImageUrl.
     * Returns the accessible URL of the uploaded image.
     */
    @PostMapping("/profile-image")
    public ResponseEntity<Map<String, String>> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {

        if (file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only image files are allowed");
        }

        // Max 5MB
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File size must be under 5MB");
        }

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
        String filename = UUID.randomUUID() + extension;

        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Build accessible URL
        String imageUrl = "/uploads/" + filename;

        // Update user's profileImageUrl
        Long userId = (Long) authentication.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        user.setProfileImageUrl(imageUrl);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("url", imageUrl));
    }
}
