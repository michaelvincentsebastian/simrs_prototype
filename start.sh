#!/bin/bash
# Script sederhana untuk menjalankan Prototype SIMRS Mini + Ngrok

PORT=8000

# Muat file .env jika ada
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Tambahkan ~/.local/bin ke PATH jika ngrok ada di sana
if [ -d "$HOME/.local/bin" ]; then
    export PATH="$HOME/.local/bin:$PATH"
fi

# Jika AUTH_TOKEN_NGROK di-set di .env, set authtoken ngrok
TOKEN="${AUTH_TOKEN_NGROK:-$NGROK_AUTHTOKEN}"
if [ -n "$TOKEN" ] && command -v ngrok &> /dev/null; then
    ngrok config add-authtoken "$TOKEN" > /dev/null 2>&1
    export NGROK_AUTHTOKEN="$TOKEN"
fi

echo "=== Menjalankan SIMRS Mini Prototype ==="
echo "1. Server lokal berjalan di: http://localhost:$PORT"

# Jalankan Python HTTP server di background
python3 -m http.server $PORT &
SERVER_PID=$!

trap "echo ''; echo 'Menghentikan server...'; kill $SERVER_PID 2>/dev/null" EXIT

# Periksa apakah ngrok terinstall
if command -v ngrok &> /dev/null; then
    echo "2. Menjalankan ngrok tunnel di port $PORT..."
    echo "   Tekan Ctrl+C mehentikan server."
    ngrok http $PORT
else
    echo "ngrok tidak ditemukan. Menjalankan server lokal saja."
    wait $SERVER_PID
fi
