@echo off
echo ========================================================
echo        HealthTrack AI - Demarrage des Serveurs
echo ========================================================

echo [1/2] Lancement du Backend Spring Boot (Port 8085)...
start "HealthTrack Backend (Port 8085)" cmd /k "cd /d %~dp0backend && mvn spring-boot:run"

echo [2/2] Lancement du Frontend Angular (Port 4200)...
start "HealthTrack Frontend (Port 4200)" cmd /k "cd /d %~dp0frontend-angular && npm start"

echo.
echo Les deux serveurs sont en cours de demarrage dans leurs fenetres dediees.
echo - Backend  : http://localhost:8085/api
echo - Frontend : http://localhost:4200/
echo.
pause
