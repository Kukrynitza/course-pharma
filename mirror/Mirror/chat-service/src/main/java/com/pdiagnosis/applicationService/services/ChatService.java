package com.pdiagnosis.applicationService.services;

import com.pdiagnosis.applicationService.repositories.ChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import com.pdiagnosis.Chat;
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;

    public List<Chat> findAll() {
        return chatRepository.findAll();
    }

    public List<Chat> findByUserId(Long userId) {
        return chatRepository.findByUserId(userId);
    }

    public Optional<Chat> findById(Long id) {
        return chatRepository.findById(id);
    }

    public Optional<Chat> findByIdAndUserId(Long id, Long userId) {
        return chatRepository.findByIdAndUserId(id, userId);
    }

    public Chat create(Chat chat) {
        return chatRepository.save(chat);
    }

    public Chat update(Chat chat) {
        return chatRepository.save(chat);
    }

    public void delete(Long id) {
        chatRepository.deleteById(id);
    }
}
