package com.pdiagnosis.applicationService.model;

import java.util.List;
import java.util.Map;

/**
 * Универсальный интерфейс для взаимодействия с внешними LLM API
 * (например, Groq, OpenAI, Anthropic, DeepSeek и др.)
 */
public interface LlmInterface {

    /**
     * Отправляет сообщение в LLM модель и получает ответ.
     *
     * @param modelName  имя модели (например "llama-3.3-70b-versatile")
     * @param messages   список сообщений (история чата)
     *                   каждое сообщение — это Map с ключами "role" и "content"
     *                   например: {"role": "user", "content": "Hello!"}
     * @param options    дополнительные параметры (например temperature, max_tokens)
     * @return ответ модели (в виде строки)
     * @throws Exception при сетевых ошибках или неверных данных
     */
    String sendChatCompletion(String modelName, List<Map<String, String>> messages, Map<String, Object> options) throws Exception;
    void updateMedicalCard(String modelName, List<Map<String, String>> messages, Map<String, Object> options,int userId) throws Exception;
}
