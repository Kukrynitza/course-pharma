package com.pdiagnosis.applicationService.services;

import com.pdiagnosis.applicationService.repositories.LLMRequestHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import com.pdiagnosis.Chat;
import com.pdiagnosis.LLMRequestHistory;
@Service
@RequiredArgsConstructor
public class LLMRequestHistoryService {

    private final LLMRequestHistoryRepository llmRequestHistoryRepository;

    // Создать новую запись истории
    public LLMRequestHistory create(LLMRequestHistory history) {
        return llmRequestHistoryRepository.save(history);
    }

    // Найти запись по ID
    public Optional<LLMRequestHistory> findById(Long id) {
        return llmRequestHistoryRepository.findById(id);
    }

    // Получить все записи по чату
    public List<LLMRequestHistory> findByChat(Chat chat) {
        return llmRequestHistoryRepository.findByChat(chat);
    }

    // Получить все записи
    public List<LLMRequestHistory> findAll() {
        return llmRequestHistoryRepository.findAll();
    }

    // Обновить запись (например, изменить ответ)
    public LLMRequestHistory update(LLMRequestHistory history) {
        if (history.getId() == null) {
            throw new IllegalArgumentException("Cannot update history without ID");
        }
        return llmRequestHistoryRepository.save(history);
    }

    // Удалить запись
    public void delete(Long id) {
        llmRequestHistoryRepository.deleteById(id);
    }
}
