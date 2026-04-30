const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinRepo", (repoId) => {
    socket.join(repoId);
    console.log(`User joined repo: ${repoId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Pass io to app for use in controllers
app.set("io", io);

// Routes
const repoRoutes = require("./routes/repo");
const authRoutes = require("./routes/auth");
const issueRoutes = require("./routes/issue");
const userRoutes = require("./routes/user");

app.use("/api/repo", repoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/issue", issueRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("VCS Backend API is running...");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
