const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: ["https://videocallapplication.netlify.app"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: ["https://videocallapplication.netlify.app"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true
  },
  transports: ["websocket", "polling"]
});

const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("WebSocket Server Running");
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

server.listen(PORT, () => {console.log("server is running")});
