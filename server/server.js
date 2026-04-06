/*
 * Server file for the project
 * 
 * Authors: Hunter Turner (A00488748)
 *          Caleb Halverson (A00488146)
 *          Jim nguyen (A00488742)
 * 
 * TODO:
 *  - Add more / better code comments
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

// Get the API key
process.env.OPENAI_API_KEY = fs.readFileSync("apikey.txt");
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

// Get OpenAI parameters
const AI_PARAMS = JSON.parse(fs.readFileSync("AIParams.json", "utf-8"));

// List of supported image file types
const supportedFileTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif"
]

app.post("/analyze", upload.single("image"), async (req, res) => {
    console.log("Incoming request")
    try {
        if(!req.file) {
            console.log("No file");
            return res.status(400).json({error: "No file"});
        }
        
        const buffer = fs.readFileSync(req.file.path);
        const mime = req.file.mimetype
        
        // Remove the file now that it's not being used anymoe
        fs.unlinkSync(req.file.path);
        
        if (!supportedFileTypes.includes(mime)) {
            console.log("File not supported");
            return res.status(400).json({error: "File type not supported"});
        }
        
        // Data url thing to send to the AI
        const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
        
        let tempPrompt = AI_PARAMS.prompt;
        if (req.headers.language) {
            tempPrompt += " Respond for the language "+req.headers.language;
        }
        
        const openaiResponse = await openai.responses.create({
            model: AI_PARAMS.model,
            input: [{
                role: "user",
                content: [
                    {type: "input_text", "text": tempPrompt},
                    {
                        type: "input_image",
                        image_url: dataUrl
                    }
                ]
            }],
            store: false
        });
        
        res.json({contents: openaiResponse.output_text});
        console.log(`-> ${openaiResponse.output_text}`);
        console.log("Ok");
    } catch (e) {
        console.error(e);
        res.status(500).json({error: "Internal server error"});
        
        // Delete the file if theres an error
        fs.unlinkSync(req.file.path);
    }
});

app.listen(SERVER_PORT, () => {
    console.log(`Server running at http://mapd.cs-smu.ca:${SERVER_PORT}`);
    console.log(`Using model: ${AI_PARAMS.model}`);
    console.log(`AI prompt: ${AI_PARAMS.prompt}`);
});