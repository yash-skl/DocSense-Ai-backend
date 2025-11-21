import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/ApiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import pdf from 'pdf-parse'
import fs from "fs";
import OpenAI from "openai"


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


const checkPdf = asyncHandler(async (req, res) => {
    const { rules } = req.body;
    if (!rules) {
        throw new apiError(400, "rules are required.")
    }

    if (!req.file) {
        throw new apiError(400, "pdf file is required.")
    }
    try {
        const rulesInText = JSON.parse(rules)
        const pdfBuffer = fs.readFileSync(req.file.path)
        const pdfData = await pdf(pdfBuffer)
        const pdfText = pdfData.text;

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


            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0,
            })

            result.push(JSON.parse(completion.choices[0].message.content))
        }

        fs.unlinkSync(req.file.path);

        return res
            .status(200)
            .json(new apiResponse(200, { result }, "Checked pdf successfully."))
    } catch (error) {
        throw new apiError(500, error.message || "Error processing PDF");
    }
})

export { checkPdf }