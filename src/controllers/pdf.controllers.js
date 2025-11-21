import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import fs from "fs";
import Groq from "groq-sdk";
import dotenv from "dotenv";



dotenv.config({
    path: './.env'
});


const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});


const checkPdf = asyncHandler(async (req, res) => {
    const { rules } = req.body;
    console.log("rules : ===========>", rules);

    if (!rules) {
        throw new apiError(400, "rules are required.")
    }

    if (!req.file) {
        throw new apiError(400, "pdf file is required.")
    }
    try {
        const rulesInText = JSON.parse(rules)
        const pdfBuffer = fs.readFileSync(req.file.path)
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) });
        const pdfDoc = await loadingTask.promise;

        let text = "";

        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(" ") + "\n";
        }

        const pdfText = text;


        let result = [];

        for (let rule of rulesInText) {
            const prompt = `
You are an AI PDF compliance checker.

PDF TEXT:
"""
${pdfText}
"""

RULE:
"${rule}"

Return ONLY a JSON object with this exact structure:
{
  "rule": "${rule}",
  "status": "",
  "evidence": "",
  "reasoning": "",
  "confidence": 0
}
`;


            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0
            });
            let content = completion.choices[0].message.content;

            // remove code block markers
            content = content.replace(/```json|```/g, "").trim();

            result.push(JSON.parse(content))
        }

        fs.unlinkSync(path.resolve(req.file.path));

        return res
            .status(200)
            .json(new apiResponse(200, { result }, "Checked pdf successfully."))
    } catch (error) {
        throw new apiError(500, error.message || "Error processing PDF");
    }
})

export { checkPdf }