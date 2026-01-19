FROM maven:3-eclipse-temurin-25-alpine AS packager
WORKDIR /builder
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:25-jdk-alpine AS builder
WORKDIR /builder
COPY --from=packager builder/target/*.jar app.jar
RUN java -Djarmode=tools -jar app.jar extract --layers --destination app


FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=builder builder/app/dependencies/ ./
COPY --from=builder builder/app/snapshot-dependencies/ ./
COPY --from=builder builder/app/spring-boot-loader/ ./
COPY --from=builder builder/app/application/ ./

ENV SERVER_PORT=8080
ENV SERVER_SERVLET_CONTEXT_PATH="/"
ENV	SPRING_PROFILES_ACTIVE=dev

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]