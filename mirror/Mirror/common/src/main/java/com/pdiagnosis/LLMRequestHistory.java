package com.pdiagnosis;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "llm_request_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LLMRequestHistory {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime requestTime = LocalDateTime.now();

    @Column(name = "response", nullable = false, columnDefinition = "TEXT")
    @Basic(fetch = FetchType.EAGER)
    private String response;
    @Column(name = "prompt",nullable = false, columnDefinition = "TEXT")
    @Basic(fetch = FetchType.EAGER)
    private String prompt;
    @Column(length = 255)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    @JsonIgnore
    private Chat chat;

    @PrePersist
    protected void onCreate() {
        requestTime = LocalDateTime.now();
    }
}
