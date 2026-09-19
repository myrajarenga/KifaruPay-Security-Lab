const express = require("express");
const cors = require("cors");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 5000;
const JWT_SECRET = "kifaru-lab-secret";

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Access token required"
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: "Invalid or expired token"
      });
    }

    req.user = user;
    next();
  });
}

app.use(cors());
app.use(express.json());

const users = JSON.parse(
  fs.readFileSync("./data/users.json", "utf8")
);

const transactions = JSON.parse(
  fs.readFileSync("./data/transactions.json", "utf8")
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy"
  });
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (item) => item.email === email
  );

  if (!user) {
    return res.status(401).json({
      error: "Invalid email or password"
    });
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    return res.status(401).json({
      error: "Invalid email or password"
    });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: "1h"
    }
  );

  res.json({
    message: "Login successful",
    token
  });
});
// Get one transaction
app.get("/api/transactions", authenticateToken, (req, res) => {
  res.json(transactions);
});

// Get one transaction
app.get("/api/transactions/:id", authenticateToken, (req, res) => {
  const transactionId = Number(req.params.id);

  const transaction = transactions.find(
    (item) => item.id === transactionId
  );

  if (!transaction) {
    return res.status(404).json({
      error: "Transaction not found"
    });
  }

  // Authorization check
  if (
    req.user.role !== "admin" &&
    transaction.userId !== req.user.userId
  ) {
    return res.status(403).json({
      error: "Access denied"
    });
  }

  res.json(transaction);
});

app.get("/", (req, res) => {
  res.json({
    message: "KifaruPay API is running",
    status: "development"
  });
});

app.listen(PORT, () => {
  console.log(`KifaruPay API running on http://localhost:${PORT}`);
});