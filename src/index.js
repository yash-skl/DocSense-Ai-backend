import express from 'express'
import dotenv from 'dotenv';
import cors from "cors"
import cookieParser from "cookie-parser"
import { JSON_LIMIT } from './constants.js';

dotenv.config({
    path: './.env'
});

const app = express()

const allowedOrigins = ["https://doc-sense-ai-frontend-tzpt.vercel.app", "http://localhost:5173"];
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true, 
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);


app.use(express.json({limit: JSON_LIMIT})) 
app.use(express.urlencoded({extended: true, limit:JSON_LIMIT}))
app.use("/uploads", express.static("uploads"));
app.use(cookieParser())


import pdfRoutes from './routes/pdf.routes.js'


app.use('/api/v1/pdf', pdfRoutes)



app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})