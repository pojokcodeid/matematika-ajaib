@echo off
rem ================================================================
rem   Main Game.bat  -  Peluncur untuk Windows
rem
rem   Klik 2x berkas ini untuk membuka Matematika Ajaib di browser.
rem   Kalau Node.js tersedia, server lokal ikut dijalankan supaya
rem   progres tersimpan di data/game.sqlite dan papan peringkat
rem   daring bisa dipakai.
rem   Kalau tidak ada Node.js, game tetap dibuka langsung dari
rem   berkas index.html (mode portable).
rem
rem   CATATAN: berkas ini sengaja memakai huruf ASCII semua supaya
rem   tidak rusak di cmd.exe yang memakai kode halaman lain.
rem ================================================================

setlocal
cd /d "%~dp0"

rem PORT boleh diganti dari luar, misalnya: set PORT=9000 lalu jalankan lagi
if "%PORT%"=="" set "PORT=8080"

set "URL=http://localhost:%PORT%"

echo.
echo   ============================================
echo               M A G I C   M A T H
echo       educational math game, grades 1-6
echo   ============================================
echo.

rem ---------- 1. sudah ada server yang jalan? ----------
call :tunggu_server
if "%DIJUMPET%"=="1" goto :sudah_jalan

rem ---------- 2. cari Node.js ----------
where node >nul 2>&1
if errorlevel 1 goto :portable

for /f "delims=" %%v in ('node -v') do set "NODEVER=%%v"
echo   [+] Node.js found: %NODEVER%
echo   [i] Starting the local server on port %PORT%...

rem Server dijalankan di jendela terpisah yang diperkecil supaya jendela
rem ini tidak ikut terblokir. Cara menghentikan: tutup jendela kecil itu.
start "Magic Math - Server" /min node server.js

call :tunggu_server
if not "%DIJUMPET%"=="1" goto :gagal_start

start "" "%URL%"
echo   [OK] Game opened in your browser.
echo.
echo   Progress is saved to : data\game.sqlite
echo   Online leaderboard   : %URL%
echo.
echo   To stop the server: close the small black window titled
echo   "Magic Math - Server", or right-click the Node.js icon in
echo   Task Manager and choose End task.
echo.
echo   Note: if Windows Firewall asks the first time, choose
echo   "Allow access" for the Private network (home or school).
echo   Choose "Cancel" if you do not want phones on the same
echo   network to join - the game still works normally here.
echo.
echo   Press Enter to close this window.
pause >nul
endlocal
exit /b 0

rem ---------- server sudah jalan dari sebelumnya ----------
:sudah_jalan
echo   [i] A server is already running. Opening it in your browser...
start "" "%URL%"
echo.
echo   Press Enter to close this window.
pause >nul
endlocal
exit /b 0

rem ---------- Node.js ada tapi server gagal menyala ----------
:gagal_start
echo   [X] The server failed to start. Opening the file directly...
echo.
goto :portable

rem ---------- cadangan: mode portable ----------
:portable
echo   [i] Opening index.html directly (portable mode)...
start "" "%~dp0index.html"
echo   [OK] Game opened.
echo.
echo   Tip: install Node.js from https://nodejs.org then run this
echo   file again to turn on server-side saving and the online
echo   leaderboard.
echo.
echo   Press Enter to close this window.
pause >nul
endlocal
exit /b 0

rem ================================================================
rem   :tunggu_server
rem   Mengecek apakah server di port %PORT% sudah siap, maksimal
rem   sekitar 30 detik (tiap percobaan: 1 detik time-out + 0,5 detik
rem   jeda). Mengisi DIJUMPET=1 kalau sudah merespons endpoint
rem   /api/info, selain itu DIJUMPET=0.
rem
rem   Semua pemeriksaan dilakukan dalam satu pemanggilan PowerShell
rem   supaya tidak lambat seperti memanggilnya berulang kali.
rem ================================================================
:tunggu_server
set "DIJUMPET=0"
powershell -NoProfile -Command "$ok=$false; foreach($i in 1..20){ try{ $null=Invoke-WebRequest -Uri '%URL%/api/info' -TimeoutSec 1 -UseBasicParsing; $ok=$true; break }catch{ Start-Sleep -Milliseconds 500 } }; if($ok){exit 0}else{exit 1}" >nul 2>&1
if not errorlevel 1 set "DIJUMPET=1"
goto :eof
