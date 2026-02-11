FROM openjdk:27-ea-oraclelinux9
WORKDIR /app
COPY target/EncryptedFileSharing-0.0.1-SNAPSHOT.jar ./app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]