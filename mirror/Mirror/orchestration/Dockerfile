# ==== Stage 1: Build common-dto ====
FROM maven:3.9.9-eclipse-temurin-21 AS common-builder
WORKDIR /common

COPY common/pom.xml ./pom.xml
COPY common/src ./src
RUN mvn clean install -DskipTests

# ==== Stage 2: Build orchestration-service ====
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /app

COPY orchestration/pom.xml ./pom.xml
COPY orchestration/src ./src

COPY --from=common-builder /root/.m2 /root/.m2

RUN mvn clean package -DskipTests

# ==== Stage 3: Runtime ====
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/orchestration-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8084
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
