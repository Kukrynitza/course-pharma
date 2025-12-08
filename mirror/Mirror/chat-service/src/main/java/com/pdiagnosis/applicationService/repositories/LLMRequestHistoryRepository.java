package com.pdiagnosis.applicationService.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import com.pdiagnosis.LLMRequestHistory;
import com.pdiagnosis.Chat;
@Repository
public interface LLMRequestHistoryRepository extends JpaRepository<LLMRequestHistory, Long> {

    // Получить все записи истории по конкретному чату
    List<LLMRequestHistory> findByChat(Chat chat);
}
