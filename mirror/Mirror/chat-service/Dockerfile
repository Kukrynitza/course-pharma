# ==== Stage 1: Build common-dto ====
FROM maven:3.9.9-eclipse-temurin-21 AS common-builder
WORKDIR /common

# Копируем POM и исходники common-dto
COPY common/pom.xml ./pom.xml
COPY common/src ./src

# Сборка и установка в локальный Maven репозиторий контейнера
RUN mvn clean install -DskipTests

# ==== Stage 2: Build chat-service ====
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Копируем POM и исходники сервиса
COPY chat-service/pom.xml ./pom.xml
COPY chat-service/src ./src

# Копируем локальный репозиторий с common-dto из предыдущего stage
COPY --from=common-builder /root/.m2 /root/.m2

# Скачиваем зависимости и собираем проект

RUN mvn clean package -DskipTests

# ==== Stage 3: Runtime ====
FROM eclipse-temurin:21-jre
WORKDIR /app

# Копируем скомпилированный JAR
COPY --from=builder /app/target/chat-service-0.0.1-SNAPSHOT.jar app.jar

# Порт приложения
EXPOSE 8082

# Переменные окружения
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS=""
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/chats
ENV SPRING_DATASOURCE_USERNAME=postgres
ENV SPRING_DATASOURCE_PASSWORD=password

# Точка входа
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
