const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use("/assets", express.static(path.join(__dirname, "../assets")));
// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== SERVE FRONTEND (../static) =====
app.use(express.static(path.join(__dirname, "../static")));

// ===== MAIL TRANSPORT =====
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ===== API ROUTE =====
app.post("/send-message", async (req, res) => {
    const { name, email, message } = req.body;


    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            error: "All fields are required"
        });
    }

    try {
        await transporter.sendMail({
            from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `New Message from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>New Portfolio Message</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Message:</strong></p>
                    <p>${message}</p>
                </div>
            `
        });

        res.json({ success: true });

    } catch (error) {
        console.error("MAIL ERROR:", error);

        res.status(500).json({
            success: false,
            error: "Failed to send message"
        });
    }
});

// ===== DEFAULT ROUTE → SERVE index.html =====
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../static/index.html"));
});

// ===== START SERVER =====
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});