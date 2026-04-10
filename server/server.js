/*
 * Server file for the project
 * 
 * Authors: Hunter Turner (A00488748)
 *          Caleb Halverson (A00488146)
 *          Jim Nguyen (A00488742)
 * 
 * TODO:
 *  - Review new comments on all js files and add any other needed
 */

// Libraries
import http from "http";
import https from "https";
import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import OpenAI from "openai";

//GLOBAL CONSTANTS
const SERVER_PORT = 6502;
const SECURE_SERVER_PORT = 6503;

const PRIVATE_KEY = "private.key";
const CERTIFICATE = "server.crt";

// Initialize http and https
const privateKey = fs.readFileSync(PRIVATE_KEY, 'utf8');
const certificate = fs.readFileSync(CERTIFICATE, 'utf8');
const credentials = {key: privateKey, cert: certificate};

const app = express();
app.use(cors());
const httpServer = https.createServer(app)
const httpsServer = https.createServer(credentials, app)

// Setup multer
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
        
        // Generat data url to send to the AI
        const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
        
        // Make a temporary string to contain the prompt, a basic and detailed
        // prompt will be selected depending on if the user wants a short or
        // long prompt.
        let tempPrompt;
        if (req.headers.detailed) {
            tempPrompt = AI_PARAMS.detailed_prompt;
        } else {
            tempPrompt = AI_PARAMS.base_prompt;
        }
        
        // If the header contains a language, append it to the prompt
        if (req.headers.language) {
            tempPrompt += " Respond for the language "+req.headers.language;
        }

        // Make a request to the AI, sending it the prompt and the image
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
        
        // Send the AI response back to the client
        res.json({contents: openaiResponse.output_text});
        console.log(`-> ${openaiResponse.output_text}`);
        console.log("Ok");
    } catch (e) {
        // Catch any error and log it, and send a generic error to the client
        console.error(e);
        res.status(500).json({error: "Internal server error"});
        
        // Delete the file if theres an error
        fs.unlinkSync(req.file.path);
    }
});

httpServer.listen(SERVER_PORT, () => {
    console.log(`Server running at https://mapd.cs-smu.ca:${SERVER_PORT}`);
    console.log(`Using model: ${AI_PARAMS.model}`);
});

httpsServer.listen(SERVER_PORT, () => {
    console.log(`HTTPS Started`);
});