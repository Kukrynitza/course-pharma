# === Stage 1: Build common-dto ===
FROM maven:3.9.2-eclipse-temurin-21 AS common-builder
WORKDIR /common
COPY ../common/pom.xml ./pom.xml
COPY ../common/src ./src
RUN mvn clean install -DskipTests

# === Stage 2: Build authentication-service ===
FROM maven:3.9.2-eclipse-temurin-21 AS builder
WORKDIR /app

# Копируем pom и src
COPY pom.xml .
COPY src ./src

# Копируем локальный репозиторий Maven из stage 1
COPY --from=common-builder /root/.m2 /root/.m2

# Сборка проекта
RUN mvn clean package -DskipTests

# === Stage 3: Run stage ===
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]

