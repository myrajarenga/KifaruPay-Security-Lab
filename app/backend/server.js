const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "KifaruPay API is running",
    status: "development"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy"
  });
});

app.listen(PORT, () => {
  console.log(`KifaruPay API running on http://localhost:${PORT}`);
});