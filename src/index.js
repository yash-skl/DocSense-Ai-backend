import express from 'express'
import dotenv from 'dotenv';
import cors from "cors"
import cookieParser from "cookie-parser"
import { JSON_LIMIT } from './constants.js';

dotenv.config({
    path: './.env'
});

const app = express()

app.use(cors({
    origin: ['http://localhost:5173','http://localhost:5174'] ,
    credentials: true
}))

app.use(express.json({limit: JSON_LIMIT})) 
app.use(express.urlencoded({extended: true, limit:JSON_LIMIT}))
app.use("/uploads", express.static("uploads"));
app.use(cookieParser())


import pdfRoutes from './routes/pdf.routes.js'


app.use('/api/v1/pdf', pdfRoutes)



app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})