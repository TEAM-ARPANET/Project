/*
 * Server file for the project
 */

import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import OpenAI from "openai";

const SERVER_PORT = 6502;

const AI_MODEL = "gpt-5.4-mini"
const AI_PROMPT = "Describe this image in one or two sentences without the use of emojis."

const app = express();
app.use(cors());

const upload = multer({
    dest: "uploads/",
    limits: {fileSize: 1024*1024*15},   // 15 mb upload limit
});

// Get the API key
process.env.OPENAI_API_KEY = fs.readFileSync("apikey.txt");
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

// List of supported image file types
const supportedFileTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif"
]

app.post("/analyze", upload.single("image"), async (req, res) => {
    console.log(`Request from ${req.headers.host}`)
    try {
        if(!req.file) {
            console.log("No file");
            return res.status(400).json({error: "No file"});
        }
        
        const buffer = fs.readFileSync(req.file.path);
        const mime = req.file.mimetype
        
        if (!supportedFileTypes.includes(mime)) {
            console.log("File not supported");
            return res.status(400).json({error: "File type not supported"});
        }
        
        // Data url thing to send to the AI
        const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
        
        const openaiResponse = await openai.responses.create({
            model: AI_MODEL,
            input: [{
                role: "user",
                content: [
                    {type: "input_text", "text": AI_PROMPT},
                    {
                        type: "input_image",
                        image_url: dataUrl
                    }
                ]
            }],
            store: false
        });
        
        // Remove the file now that it's not being used anymoe
        fs.unlinkSync(req.file.path);
        
        res.json({contents: openaiResponse.output_text});
        console.log(openaiResponse);
        console.log("Ok");
    } catch (e) {
        console.error(e);
        res.status(500).json({error: e.message});
    }
});

app.listen(SERVER_PORT, () => {
    console.log(`Server running at http://mapd.cs-smu.ca:${SERVER_PORT}`);
});