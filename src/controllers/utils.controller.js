import fetch from "node-fetch"
import logger from "../config/logger.js"
import { createRequire } from "module"
import { OpenAI } from "openai"

const require = createRequire(import.meta.url)
const mammoth = require("mammoth")
const pdfParse = require("pdf-parse")

export const processDocx = async (req, res, next) => {
    try {
        const fileBinaryString = req.body.content
        const fileBuffer = Buffer.from(fileBinaryString, "binary")
        const result = await mammoth.convertToHtml({ buffer: fileBuffer })
        res.send(result.value)
    } catch (err) {
        logger.error("Process DOCX error:", err)
        next(err)
    }
}

export const processPDF = async (req, res, next) => {
    try {
        const { url } = req.body
        const response = await fetch(url)
        const pdfBuffer = await response.arrayBuffer()
        const data = await pdfParse(pdfBuffer)
        res.send(data.text)
    } catch (err) {
        logger.error("Process PDF error:", err)
        next(err)
    }
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export const chatWithGpt = async (req, res) => {
    const { messages } = req.body

    if (!Array.isArray(messages)) {
        return res.status(400).json({ error: "Message history must be an array." })
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: messages,
        })

        res.json({ response: response.choices[0].message })
    } catch (error) {
        console.error("OpenAI Error:", error)
        res.status(500).json({ error: "Failed to process GPT request." })
    }
}
