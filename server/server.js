/*
 * Server file for the project
 * needs to be edited, add openai key and give it a port number, alongside the other 2 .js files which also need some changes
 */

import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import OpenAI from "openai";

const PORT = ****;
const app = express();

const upload = multer({
  dest: "uploads/",
  limits: {fileSize: 15 * 1024 * 1024},
});

app.use(cors());

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    if(!req.file) {
      return res.status(400).json({error: "No image uploaded" });
    }

    const buffer = fs.readFileSync(req.file.path);
    const mime = req.file.mimetype || "image/jpeg";
    const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;

    fs.unlinkSync(req.file.path);

    res.json({description: response.output_text});
  } catch (e) {
    console.error(e);
    res.status(500).json({error: e.message});
  }
});

app.listen(PORT, () =>
  console.log("Server running at http://mapd.cs-smu.ca:****"),
);
  
