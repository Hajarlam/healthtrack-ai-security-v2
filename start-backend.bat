@echo off
echo Lancement du Backend Spring Boot (Port 8085)...
cd /d %~dp0backend
mvn spring-boot:run
pause
