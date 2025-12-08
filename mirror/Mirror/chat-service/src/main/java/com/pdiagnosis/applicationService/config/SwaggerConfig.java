package com.pdiagnosis.applicationService.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("PDiagnosis Chat Service API")
                        .version("1.0")
                        .description("API for managing chats, LLM interactions, and request history"))
                .addServersItem(new Server().url("http://localhost:8082").description("Chat Service"))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }

    @Bean
    public GroupedOpenApi chatApi() {
        return GroupedOpenApi.builder()
                .group("chat")
                .packagesToScan("com.pdiagnosis.applicationService.controllers")
                .pathsToMatch("/api/**")
                .build();
    }
}