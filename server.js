import express from "express";
import { WebSocketServer } from "ws";
import { io } from "socket.io-client";

const app = express();
const PORT = process.env.PORT || 10000;

// Запускаем WebSocket-сервер для ESP32
const wss = new WebSocketServer({ port: PORT });
console.log(`✅ WebSocket proxy запущен на порту ${PORT}`);

// Подключаемся к твоему бекенду (Socket.IO)
const socket = io("ws://backend.enia-kids.ru:8025", {
  transports: ["websocket"]
});

socket.on("connect", () => {
  console.log("🟢 Подключено к backend.enia-kids.ru");
});

socket.on("disconnect", () => {
  console.log("🔴 Отключено от backend.enia-kids.ru");
});

// Слушаем события игры
socket.on("/child/game-level/action", (msg) => {
  console.log("📩 Событие:", msg);

  // Пересылаем всем ESP32-клиентам
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(msg));
    }
  });
});
