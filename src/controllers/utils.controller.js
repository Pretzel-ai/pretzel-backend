import fetch from "node-fetch"
import logger from "../config/logger.js"
import { createRequire } from "module"

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
