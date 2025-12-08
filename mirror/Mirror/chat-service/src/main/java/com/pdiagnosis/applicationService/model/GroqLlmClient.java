package com.pdiagnosis.applicationService.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdiagnosis.applicationService.repositories.MedicalCardRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@Slf4j
public class GroqLlmClient implements LlmInterface {

    @Value("${llm.groq.api-url:https://api.groq.com/openai/v1/chat/completions}")
    private String apiUrl;

    @Value("${llm.groq.api-key}")
    private String apiKey;

    private final MedicalCardRepository repository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GroqLlmClient(MedicalCardRepository repository) {
        this.repository = repository;
    }

    // -----------------------------
    //        SEND CHAT
    // -----------------------------
    @Override
    public String sendChatCompletion(String modelName, List<Map<String, String>> messages, Map<String, Object> options) throws Exception {
        log.info("➡️ sendChatCompletion(model={}, messages={}, options={})",
                modelName, messages.size(), options);

        Map<String, Object> body = new HashMap<>();
        body.put("model", modelName);
        body.put("messages", messages);
        if (options != null && !options.isEmpty()) {
            body.putAll(options);
        }

        log.info("📦 Request body JSON={}", objectMapper.writeValueAsString(body));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(body), headers);

        log.info("🌐 Sending request to Groq API: {}", apiUrl);
        log.info("📡 Headers: {}", headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(apiUrl, HttpMethod.POST, request, Map.class);

            log.info("⬅️ Groq API status: {}", response.getStatusCode());
            log.info("⬅️ Groq API raw body: {}", response.getBody());

            if (response.getStatusCode() != HttpStatus.OK) {
                log.error("❌ Unexpected Groq status: {}", response.getStatusCode());
                throw new RuntimeException("Groq returned status " + response.getStatusCode());
            }

            var choices = (List<Map<String, Object>>) response.getBody().get("choices");
            if (choices == null || choices.isEmpty()) {
                log.error("❌ Groq returned empty 'choices'");
                throw new RuntimeException("Groq returned no choices");
            }

            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            String content = (String) message.get("content");
            log.info("🧠 LLM content received: {}", content);

            return content;

        } catch (Exception e) {
            log.error("🔥 Error calling Groq API: {}", e.getMessage(), e);
            throw e;
        }
    }

    // -----------------------------
    //     UPDATE MEDICAL CARD
    // -----------------------------
    @Override
    public void updateMedicalCard(String modelName, List<Map<String, String>> messages, Map<String, Object> options, int userId) throws Exception {
        log.info("➡️ updateMedicalCard(userId={}, model={}, messages={})", userId, modelName, messages.size());

        Map<String, Object> body = new HashMap<>();
        body.put("model", modelName);
        body.put("messages", messages);
        if (options != null) body.putAll(options);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        Thread.sleep(1000);
        HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(body), headers);

        log.info("🌐 Sending update request to Groq API…");

        ResponseEntity<Map> response = restTemplate.exchange(apiUrl, HttpMethod.POST, request, Map.class);

        log.info("⬅️ Groq update response status: {}", response.getStatusCode());
        log.info("⬅️ Groq update body: {}", response.getBody());

        var choices = (List<Map<String, Object>>) response.getBody().get("choices");
        if (choices == null || choices.isEmpty()) {
            log.error("❌ Groq returned no choices during update");
            return;
        }

        String content = (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");
        log.info("🧠 LLM update content: {}", content);

        editCard(content, userId);
    }

    // -----------------------------
    //         PARSING
    // -----------------------------
    private static final Pattern PROBABILITY_PATTERN = Pattern.compile("\\d+");

    private List<String> parseIllness(String illness) {
        log.info("🔍 parseIllness(raw='{}')", illness);
        try {
            if (illness == null || illness.isBlank()) return Collections.emptyList();

            String[] parts = illness.split(":", 2);
            if (parts.length != 2) return Collections.emptyList();
            String disease = parts[0].trim();

            String[] probAndDesc = parts[1].split(";", 2);
            if (probAndDesc.length != 2) return Collections.emptyList();

            String probabilityStr = probAndDesc[0].trim();
            String description = probAndDesc[1].trim();

            Matcher m = PROBABILITY_PATTERN.matcher(probabilityStr);
            String probability = m.find() ? m.group() : "0";

            log.info("✅ Parsed illness: disease='{}', probability='{}', description='{}'",
                    disease, probability, description);

            return List.of(disease, probability, description);

        } catch (Exception e) {
            log.error("❌ Failed to parse illness '{}': {}", illness, e.getMessage());
            return Collections.emptyList();
        }
    }

    // -----------------------------
    //        UPDATE CARDS
    // -----------------------------
    private void editCard(String llm, int userId) {
        log.info("📝 editCard(): updating medical cards for userId={}, llm='{}'", userId, llm);

        var diagnosis = repository.findByUserId(userId);
        log.info("📄 Existing records count: {}", diagnosis.size());

        if (!llm.contains("Ответ:")) {
            log.error("❌ LLM response missing 'Ответ:' block");
            return;
        }
        log.info("llm answer: {}", llm);
        String[] ill=llm.split("Ответ:");
        if(ill.length<2){
            log.warn("⚠️ No illnesses provided in LLM response. Aborting update.");
            return;
        }
        String[] illnesses = llm.split("Ответ:")[1].split("\\n");
        log.info("illnesses size: {}", illnesses.length);
        if (illnesses.length == 0 || (illnesses.length == 1 && illnesses[0].isBlank())) {
            log.warn("⚠️ No illnesses provided in LLM response. Aborting update.");
            return;
        }
            Map<String, List<String>> illnessMap = new HashMap<>();
            for (var line : illnesses) {
                if (!line.strip().isEmpty()) {
                    List<String> parsed = parseIllness(line);
                    if (!parsed.isEmpty()) {
                        illnessMap.put(parsed.getFirst(), parsed);
                        log.info("➕ Added illness from LLM: {}", parsed);
                    } else {
                        log.warn("⚠️ Skipped unparsable illness line: {}", line);
                    }
                }
            }

            if (!diagnosis.isEmpty()) {
                log.info("🔄 Updating existing medical cards…");
                for (var card : diagnosis) {
                    List<String> update = illnessMap.get(card.getDiseas());

                    if (update == null) {
                        log.warn("⚠️ LLM response has no data for disease '{}', skipping", card.getDiseas());
                        continue;
                    }

                    log.info("✎ Updating {} → {}", card.getDiseas(), update);

                    card.setDiseas(update.getFirst());
                    card.setDescription(update.get(2));
                    card.setPossibility(Integer.parseInt(update.get(1)));
                    repository.save(card);
                }
            } else {
                log.info("➕ Creating NEW medical cards…");

                for (var disease : illnessMap.keySet()) {
                    List<String> values = illnessMap.get(disease);
                        if (values.size() < 3) {
                            log.error("❌ Invalid parsed illness data (size {}): {}", values.size(), values);
                            continue;
                        }
                    log.info("📌 Creating new card: {}", values);

                    MedicalCard newCard = new MedicalCard();
                    newCard.setUserId(userId);
                    newCard.setDiseas(values.getFirst());
                    newCard.setDescription(values.get(2));
                    newCard.setPossibility(Integer.parseInt(values.get(1)));

                    repository.save(newCard);
                }
            }
                    log.info("✅ Medical card update completed for user {}", userId);
        }
    }

