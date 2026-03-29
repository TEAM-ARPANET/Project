/*
 * Server file for the project
 */

import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import OpenAI from "openai";

const SERVER_PORT = 6502;

const app = express();
app.use(cors());

const upload = multer({
    dest: "uploads/",
    limits: {fileSize: 1024*1024*15},   // 15 mb upload limit
});

// Disable for now
//const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

// List of supported image file types
const supportedFileTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif"
]

app.post("/analyze", upload.single("image"), async (req, res) => {
    try {
        if(!req.file) {
            return res.status(400).json({error: "No file"});
        }
        
        const buffer = fs.readFileSync(req.file.path);
        const mime = req.file.mimetype
        
        if (!supportedFileTypes.includes(mime)) {
            return res.status(400).json({error: "File type not supported"});
        }
        
        // Data url thing to send to the AI
        const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
        
        // Remove the file now that it's not being used anymoe
        //fs.unlinkSync(req.file.path);
        
        //res.json({content: response.output_text});
        // For now just send a test message back to the client.
        res.json({contents: "A white and grey wolf sitting on a concrete ledge."});
    } catch (e) {
        console.error(e);
        res.status(500).json({error: e.message});
    }
});

app.listen(SERVER_PORT, () => {
    console.log(`Server running at http://mapd.cs-smu.ca:${SERVER_PORT}`);
});