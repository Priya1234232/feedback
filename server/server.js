
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, "feedback.json");

app.use(cors());
app.use(express.json());

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function validFeedback(body) {
  return (
    body &&
    typeof body.q1 === "string" && body.q1.trim() !== "" &&
    typeof body.q2 === "string" && body.q2.trim() !== "" &&
    typeof body.q3 === "string" && body.q3.trim() !== "" &&
    typeof body.q4 === "string" && body.q4.trim() !== "" &&
    (body.q5 === undefined || typeof body.q5 === "string")
  );
}

app.get("/", (req, res) => {
  res.send("Feedback Server Running Successfully");
});

app.get("/api/feedback", (req, res) => {
  try {
    res.json(readData());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load feedback." });
  }
});

app.post("/api/feedback", (req, res) => {
  try {
    if (!validFeedback(req.body)) {
      return res.status(400).json({
        message: "Name, department, session title and feedback are required."
      });
    }

    const data = readData();

    const item = {
      id: crypto.randomUUID(),
      q1: req.body.q1.trim(),
      q2: req.body.q2.trim(),
      q3: req.body.q3.trim(),
      q4: req.body.q4.trim(),
      q5: (req.body.q5 || "").trim()
    };

    data.push(item);
    writeData(data);

    console.log("Feedback saved:", item);

    res.status(201).json({
      message: "Feedback submitted successfully!",
      feedback: item
    });
  } catch (error) {
    console.error("Submit error:", error);
    res.status(500).json({ message: "Failed to save feedback." });
  }
});

app.put("/api/feedback/:id", (req, res) => {
  try {
    if (!validFeedback(req.body)) {
      return res.status(400).json({
        message: "Please complete all required fields."
      });
    }

    const data = readData();
    const index = data.findIndex(item => item.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    data[index] = {
      id: req.params.id,
      q1: req.body.q1.trim(),
      q2: req.body.q2.trim(),
      q3: req.body.q3.trim(),
      q4: req.body.q4.trim(),
      q5: (req.body.q5 || "").trim()
    };

    writeData(data);

    res.json({ message: "Feedback updated successfully!" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Failed to update feedback." });
  }
});

app.delete("/api/feedback/:id", (req, res) => {
  try {
    const data = readData();
    const updated = data.filter(item => item.id !== req.params.id);

    if (updated.length === data.length) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    writeData(updated);
    res.json({ message: "Feedback deleted successfully!" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete feedback." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
