import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { WebSocketServer } from "ws";
import { io as Client } from "socket.io-client";

const app = express();
const server = createServer(app);

// Клиенты ESP32 будут подключаться сюда по WebSocket
const wss = new WebSocketServer({ server });

// Подключаемся к твоему основному бекенду
const backend = Client("wss://backend.enia-kids.ru/socket.io/?EIO=4&transport=websocket");

// Храним подключённых ESP32
let clients = [];

wss.on("connection", (ws) => {
  console.log("📡 ESP32 подключен");
  clients.push(ws);

  ws.on("close", () => {
    clients = clients.filter((c) => c !== ws);
    console.log("❌ ESP32 отключен");
  });
});

// Пришло событие от бекенда
backend.on("connect", () => {
  console.log("✅ Подключен к backend");
});

backend.on("message", (msg) => {
  try {
    const data = JSON.parse(msg);

    // Берём только поле "type" и маппим
    let mapped = null;
    if (data.type === "success") mapped = "happy";
    if (data.type === "fail") mapped = "sad";
    if (data.type === "completed") mapped = "angry";

    if (mapped) {
      console.log("➡️ Отправляем ESP32:", mapped);
      clients.forEach((c) => c.send(mapped));
    }
  } catch (e) {
    console.error("Ошибка обработки сообщения:", e);
  }
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🌐 Proxy запущен на порту ${PORT}`);
});
