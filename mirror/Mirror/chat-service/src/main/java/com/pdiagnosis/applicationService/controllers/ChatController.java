package com.pdiagnosis.applicationService.controllers;

import com.pdiagnosis.applicationService.services.ChatService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

import com.pdiagnosis.Chat;
@RestController
@RequestMapping("/api/chats/chatController")
@RequiredArgsConstructor
@Slf4j
public class ChatController {
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public class ChatDto {
        private Long id;
        private Long userId;
        private String title;
        private LocalDateTime createdAt;
    }
    private final ChatService chatService;

    /**
     * Получить все чаты пользователя
     */
    @GetMapping("/byUser")
    public ResponseEntity<?> getChatsByUser(@RequestParam Long userId) {
        List<Chat> chats = chatService.findByUserId(userId);

        if (chats.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "No chats found for user"));
        }

        List<Map<String, Object>> chatList = chats.stream()
                .map(chat -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", chat.getId());
                    map.put("userId", chat.getUserId());
                    map.put("title", chat.getTitle());
                    map.put("createdAt", chat.getCreatedAt());
                    return map;
                })
                .toList();

        return ResponseEntity.ok(chatList);
    }


    /**
     * Получить чат по ID
     */
    @GetMapping("/byId")
    public ResponseEntity<?> getChatById(Long userId, @RequestParam Long chatId) {
        Optional<Chat> chatOpt = chatService.findByIdAndUserId(chatId, userId);
        return chatOpt.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Chat not found"));
    }

    /**
     * Создать новый чат
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createChat(@RequestBody Chat chat) {
        chat.setId(null);
        Chat saved = chatService.create(chat);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "id", saved.getId(),
                        "userId", saved.getUserId(),
                        "title", saved.getTitle(),
                        "createdAt", saved.getCreatedAt()
                ));
    }



    /**
     * Обновить чат
     */
    @PutMapping("/update/{chatId}")
    public ResponseEntity<?> updateChat(@RequestParam Long userId,
                                        @PathVariable Long chatId,
                                        @RequestBody Chat updatedChat) {
        Optional<Chat> existingOpt = chatService.findByIdAndUserId(chatId, userId);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Chat not found");
        }

        Chat existing = existingOpt.get();
        existing.setTitle(updatedChat.getTitle());
        return ResponseEntity.ok(chatService.update(existing));
    }

    /**
     * Удалить чат
     */
    @DeleteMapping("/delete/{chatId}")
    public ResponseEntity<?> deleteChat(@RequestParam Long userId, @PathVariable Long chatId) {
        Optional<Chat> chatOpt = chatService.findByIdAndUserId(chatId, userId);
        if (chatOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Chat not found");
        }

        chatService.delete(chatId);
        return ResponseEntity.noContent().build();
    }
}
