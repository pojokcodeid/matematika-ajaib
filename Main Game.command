#!/bin/bash
# ============================================================
#  Main Game.command  —  Peluncur untuk macOS
#
#  Klik 2x berkas ini untuk membuka Matematika Ajaib di browser.
#  Kalau Node.js tersedia, server lokal ikut dijalankan supaya
#  progres tersimpan di data/game.sqlite.
#  Kalau tidak ada Node.js, game tetap dibuka langsung dari
#  berkas index.html (mode portable).
# ============================================================

cd "$(dirname "$0")" || exit 1
export PORT

# PORT boleh diganti dari luar, misalnya:  PORT=9000 open "Main Game.command"
PORT="${PORT:-8080}"

echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║             MAGIC MATH                  ║"
echo "  ║   educational math game, grades 1-6     ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""

# --- cek apakah sudah ada server yang jalan di port ini ---
if curl -s -o /dev/null --max-time 1 "http://localhost:$PORT/api/info"; then
  echo "  ℹ️  A server is already running. Opening it in your browser…"
  open "http://localhost:$PORT"
  exit 0
fi

# --- pakai Node.js kalau ada ---
if command -v node >/dev/null 2>&1; then
  echo "  ✓ Node.js found: $(node -v)"
  # ${PORT} ditulis dengan kurung kurawal: pada bash 3.2 bawaan macOS,
  # $PORT yang langsung diikuti tanda baca non-ASCII bisa ikut tersedot.
  echo "  ▶️  Starting the local server on port ${PORT}…"
  echo "  💡  To stop the server: press Ctrl + C in this window."
  echo ""
  node server.js &
  SERVER_PID=$!
  sleep 1.5

  if curl -s -o /dev/null --max-time 2 "http://localhost:$PORT/api/info"; then
    open "http://localhost:$PORT"
    echo "  ✅ Game opened in your browser."
    echo "  📁 Progress is saved to: data/game.sqlite"
    echo ""
    wait $SERVER_PID
    kill $SERVER_PID 2>/dev/null
    exit 0
  else
    echo "  ⚠️  The server failed to start — opening the file directly…"
    kill $SERVER_PID 2>/dev/null
  fi
fi

# --- cadangkan: buka berkas langsung (mode portable) ---
echo "  ▶️  Opening index.html directly (portable mode)…"
open "index.html"
echo "  ✅ Game opened."
echo ""
echo "  ℹ️  Tip: install Node.js (https://nodejs.org) and run this"
echo "     file again to turn on server-side saving."
echo ""
echo "  Press Enter to close this window."
read -r
