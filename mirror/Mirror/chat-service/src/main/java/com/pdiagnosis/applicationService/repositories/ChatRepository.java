package com.pdiagnosis.applicationService.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.pdiagnosis.Chat;
import java.util.List;
import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat, Long> {

    List<Chat> findByUserId(Long userId);

    Optional<Chat> findByIdAndUserId(Long id, Long userId);
}
