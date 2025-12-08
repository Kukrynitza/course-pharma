package com.pdiagnosis.orchestration.controllers;

import com.pdiagnosis.Chat;
import com.pdiagnosis.orchestration.MultipartInputStreamFileResource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${services.face-detection.url}")
    private String faceDetectionUrl;

    @Value("${services.llm-fastapi.url}")
    private String llmFastApiUrl;

    @Value("${services.llm.spring.chat.url}")
    private String llmSpringUrl;

    @Value("${services.llm.spring.transcribe.url}")
    private String voiceRecognition;

    @Value("${services.chat.creation.url}")
    private String chatCreation;

    @Value("${services.chat.getter.url}")
    private String chatGetter;

    @Value("${services.chat.history.url}")
    private String chatHistoryGetter;
    @Value("${services.chat.history.create.url}")
    private String chatHistory;
    @PostMapping(value = "/new/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> messageWithImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "prompt", required = false) String prompt,
            @RequestParam("chatId") Long chatId,
            @RequestParam("userId") Long userId

    ) {
        return sendQuestion(file, prompt, chatId,userId);
    }

    @PostMapping(value = "/new/voice", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> messageWithVoice(
            @RequestParam("image") MultipartFile imageFile,
            @RequestParam("voice") MultipartFile voiceFile,
            @RequestParam("chatId") Long chatId,
            @RequestParam("userId") Long userId
    ) {
        try {
            String voiceText = convertVoiceToText(voiceFile);

            return sendQuestion(imageFile, voiceText, chatId,userId);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/list")
    public ResponseEntity<?> getChatList(@RequestParam("userId") Long userId) {
        try {
            String url = chatGetter + "?userId=" + userId;

            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return ResponseEntity.ok(response.getBody());
            }

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "No chats found for userId " + userId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch chats: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{chatId}")
    public ResponseEntity<?> getChatHistory(@PathVariable Long chatId) {
        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl(chatHistoryGetter)
                    .queryParam("chatId", chatId)
                    .toUriString();

            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {}
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "No history found for chatId " + chatId));
            }

            List<Map<String, Object>> rawHistory = response.getBody();

            List<Map<String, Object>> historyWithImages = rawHistory.stream().map(entry -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", entry.get("id"));
                map.put("chatId", entry.get("chatId"));
                map.put("requestTime", entry.get("requestTime"));
                map.put("response", entry.get("response"));
                map.put("prompt", entry.get("prompt"));

                String imageUrl = (String) entry.get("imageUrl");
                if (imageUrl != null && !imageUrl.isEmpty()) {
                    try {
                        Path filePath = Paths.get(System.getProperty("user.dir")).resolve(imageUrl);
                        if (Files.exists(filePath)) {
                            byte[] bytes = Files.readAllBytes(filePath);
                            String base64 = Base64.getEncoder().encodeToString(bytes);
                            map.put("imageBase64", base64);
                        } else {
                            map.put("imageBase64", null);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                        map.put("imageBase64", null);
                    }
                } else {
                    map.put("imageBase64", null);
                }

                return map;
            }).toList();

            return ResponseEntity.ok(historyWithImages);

        } catch (Exception e) {
            System.err.println("Error fetching chat history: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch chat history: " + e.getMessage()));
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createChat(
            @RequestParam("userId") Long userId,
            @RequestParam("title") String title
    ) {
        try {
            Chat newChat = new Chat();
            newChat.setMessages(new ArrayList<>());
            newChat.setUserId(userId);
            newChat.setTitle(title);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    chatCreation,
                    newChat,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.CREATED && response.getBody() != null) {
                Long chatId = Long.valueOf(response.getBody().get("id").toString());
                return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("chatId", chatId));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create chat"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error creating chat: " + e.getMessage()));
        }
    }
//TODO: add method to call RAG maybe
    private ResponseEntity<?> sendQuestion(MultipartFile imageFile, String prompt, Long chatId,Long userId) {
        try {
            if (imageFile.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing image file"));
            }
            Map<String,Object> faceDetected = new HashMap<>();
            if (imageFile != null) {
                faceDetected = checkFaceOnImage(imageFile);
            }
            String finalResponse="No face detected on image";
            if (((Boolean)faceDetected.get("check"))) {
                String llmResult = "";
                if (imageFile != null)
                    try {
                        llmResult = sendToFastApiLLM(imageFile);


                 finalResponse = sendToSpringLLM(llmResult+"\nОписание лица от whisper large 3 pro:"+faceDetected.get("answer").toString(), prompt,chatId);
                    }catch (Exception e) {
                        finalResponse = e.getMessage();
                    }
            }
            saveChatHistory(chatId, prompt, finalResponse, imageFile);

            return ResponseEntity.ok(Map.of(
                    "chatId", chatId,
                    "response", finalResponse
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    private Map<String,Object> checkFaceOnImage(MultipartFile file) {

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new MultipartInputStreamFileResource(file.getInputStream(), file.getOriginalFilename()));
            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(faceDetectionUrl, request, Map.class);
            if( response.getStatusCode() == HttpStatus.OK && Boolean.TRUE.equals(response.getBody().get("faceDetected"))){
                String firstWord = Optional.ofNullable(response.getBody())
                        .map(b -> (List<?>) b.get("choices"))
                        .filter(list -> !list.isEmpty())
                        .map(list -> (Map<String, Object>) list.get(0))
                        .map(choice -> (Map<String, Object>) choice.get("message"))
                        .map(msg -> (String) msg.get("content"))
                        .orElse("");
                return new HashMap<>(Map.of("check",response.getBody().get("faceDetected"),"answer",firstWord));
            }


        } catch (Exception e) {
            return new HashMap<>(Map.of("check",false));
        }
        return new HashMap<>(Map.of("check",false));
    }

    public String sendToFastApiLLM(MultipartFile file) {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(llmFastApiUrl, requestEntity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Object resp = response.getBody();

                return resp != null ? resp.toString() : "Нет ответа от сервера.";
            }

            return "Ошибка при анализе изображения.";
        } catch (Exception e) {
            return "Ошибка при анализе изображения: " + e.getMessage();
        }
    }

    private String sendToSpringLLM(String llmResult, String userPrompt,Long userId) {
        try {
            Map<String, String> requestBody = Map.of(
                    "model", "openai/gpt-oss-120b",
                    "prompt", llmResult + "\n\nВопрос пользователя: " + (userPrompt != null ? userPrompt : ""),
                    "userId",userId.toString()
            );
            ResponseEntity<Map> response = restTemplate.postForEntity(llmSpringUrl, requestBody, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (String) response.getBody().get("response");
            }
            return "Ошибка при получении ответа от LLM.";
        } catch (Exception e) {
            return "Ошибка при получении ответа от LLM: " + e.getMessage();
        }
    }

    private String convertVoiceToText(MultipartFile voiceFile) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new MultipartInputStreamFileResource(voiceFile.getInputStream(), voiceFile.getOriginalFilename()));

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(voiceRecognition, request, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (String) response.getBody().get("transcription");
            }
            return "Ошибка при распознавании голоса.";
        } catch (Exception e) {
            return "Ошибка при распознавании голоса: " + e.getMessage();
        }
    }

    private void saveChatHistory(Long chatId, String prompt, String response, MultipartFile imageFile) {
        try {
            String imageUrl = null;

            if (imageFile != null && !imageFile.isEmpty()) {
                Path projectRoot = Paths.get(System.getProperty("user.dir"));
                Path uploadDir = projectRoot.resolve("photo");

                Files.createDirectories(uploadDir);

                String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();

                Path filePath = uploadDir.resolve(fileName);

                Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                imageUrl = "photo/" + fileName;
            }

            String url = UriComponentsBuilder.fromHttpUrl(chatHistory)
                    .queryParam("chatId", chatId)
                    .toUriString();

            Map<String, Object> history = new HashMap<>();
            history.put("response", response);
            history.put("imageUrl", imageUrl);
            history.put("prompt", prompt);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(history, headers);

            ResponseEntity<Map> result = restTemplate.postForEntity(url, request, Map.class);

            if (!result.getStatusCode().is2xxSuccessful()) {
                System.err.println("Failed to save history: " + result.getStatusCode());
            }

        } catch (Exception e) {
            System.err.println("Error saving chat history: " + e.getMessage());
            e.printStackTrace();
        }
    }

}