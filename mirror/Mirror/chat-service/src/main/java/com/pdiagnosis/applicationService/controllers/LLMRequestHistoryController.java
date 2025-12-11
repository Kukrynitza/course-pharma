package com.pdiagnosis.applicationService.controllers;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.pdiagnosis.Chat;
import com.pdiagnosis.LLMRequestHistory;
import com.pdiagnosis.applicationService.services.ChatService;
import com.pdiagnosis.applicationService.services.LLMRequestHistoryService;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/chats/history")
@RequiredArgsConstructor
@Slf4j  // <-- добавь это

public class LLMRequestHistoryController {

    private final LLMRequestHistoryService llmRequestHistoryService;
    private final ChatService chatService;

    /**
     * Получить все записи истории для конкретного чата
     */
    /**
     * GET /api/chats/history/getAll?chatId=1
     */
    @GetMapping("/getAll")
    public ResponseEntity<List<Map<String, Object>>> getAllHistory(@RequestParam Long chatId) {

        Optional<Chat> chatOpt = chatService.findById(chatId);

        log.info(">>> [info] chatId = {}", chatId);
        log.info(">>> [info] chatOpt.isPresent() = {}", chatOpt.isPresent());

        if (chatOpt.isEmpty()) {
            log.info(">>> [info] Chat not found for chatId = {}", chatId);
            return ResponseEntity.notFound().build();
        }

        Chat chat = chatOpt.get();
        log.info(">>> [info] Chat found: id = {}", chat.getId());
        try {
            List<LLMRequestHistory> list = llmRequestHistoryService.findByChat(chat);

            log.info(">>> [info] History size = {}", list.size());

            List<Map<String, Object>> dtoList = toDto(list, chatId);
            log.info(">>> [info] History chat id = {}", dtoList.getFirst().getOrDefault("chatId","null"));
            log.info(">>> [info] Returning DTO list with {} items", dtoList.size());

            return ResponseEntity.ok(dtoList);
        }catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    private List<Map<String, Object>> toDto(List<LLMRequestHistory> list, Long chatId) {
        return list.stream()
                .map(h -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", h.getId());
                    map.put("requestTime", h.getRequestTime());
                    map.put("prompt", h.getPrompt());
                    map.put("response", h.getResponse());
                    map.put("imageUrl", h.getImageUrl());
                    map.put("chatId", h.getChat().getId());
                    return map;
                })
                .toList();
    }

    /**
     * Получить запись по ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getHistoryById(@PathVariable Long id) {
        Optional<LLMRequestHistory> historyOpt = llmRequestHistoryService.findById(id);
        if (historyOpt.isPresent()) {
            return ResponseEntity.ok(historyOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("History record not found");
        }
    }

    @GetMapping("/image")
    public ResponseEntity<byte[]> getImageByUrl(@RequestParam String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            // Предполагаем, что imageUrl хранится как "/photo/filename.png"
            String fileName = Paths.get(imageUrl).getFileName().toString();
            Path filePath = Paths.get("/photo", fileName);

            if (!Files.exists(filePath) || !Files.isReadable(filePath)) {
                return ResponseEntity.notFound().build();
            }

            byte[] imageBytes = Files.readAllBytes(filePath);

            HttpHeaders headers = new HttpHeaders();
            // Можно определить тип по расширению файла
            headers.setContentType(MediaType.IMAGE_PNG);

            return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @Data
    @NoArgsConstructor
    public static class HistoryRecordCreateDto {
        private String prompt;
        private String response;
        private String imageUrl; // может быть null
    }
    /**
     * Создать новую запись истории
     */
    @PostMapping("/create")
    public ResponseEntity<?> createHistory(
            @RequestParam Long chatId,
            @RequestBody HistoryRecordCreateDto hist) {  // ← Принимай Map

        Optional<Chat> chatOpt = chatService.findById(chatId);
        if (chatOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Chat not found");
        }

        Chat chat = chatOpt.get();
        chat.setId(chatId);
        try {
            // Создаём объект вручную
            log.info("chatId: {}", chatId);

            log.info("Prompt: {}", hist.getPrompt());
            log.info("Response: {}",hist.getResponse());


            LLMRequestHistory history = new LLMRequestHistory();
            history.setId(null);
            history.setPrompt((String) hist.getPrompt());
            history.setResponse((String) hist.getResponse());

            history.setImageUrl((String) hist.getImageUrl());
            history.setChat(chat);

            LLMRequestHistory created = llmRequestHistoryService.create(history);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }

    }

    /**
     * Обновить запись
     */
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateHistory(@PathVariable Long id,
                                           @RequestBody LLMRequestHistory updated) {
        Optional<LLMRequestHistory> existingOpt = llmRequestHistoryService.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("History record not found");
        }

        LLMRequestHistory existing = existingOpt.get();
        existing.setResponse(updated.getResponse());
        existing.setImageUrl(updated.getImageUrl());


        LLMRequestHistory saved = llmRequestHistoryService.update(existing);
        return ResponseEntity.ok(saved);
    }

    /**
     * Удалить запись
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteHistory(@PathVariable Long id) {
        Optional<LLMRequestHistory> existingOpt = llmRequestHistoryService.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("History record not found");
        }

        llmRequestHistoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
