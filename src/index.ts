require('dotenv').config();

import express,{ Request, Response, NextFunction } from "express";
import dbConnection from './core/infrastructure/db-connection';
import router from './features/router';
import cookieParser from 'cookie-parser'
import { ResponseStatus } from "./core/utils/constants";
import cors from "cors"
const app = express();
const port = process.env.PORT || 3000;
dbConnection()

app.use(express.json());
app.use(cookieParser())

const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true, // Allow credentials
    optionsSuccessStatus: 200, // For legacy browser support
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Custom-Header', 'token'], // Customize headers as needed
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed methods
  };
  
app.use(cors(corsOptions));

app.use(router)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err)
    res.status(500).json({
        message: "Internal Server Error",
        error: err,
        status:ResponseStatus.ERROR,
        data:null
    });
});


app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});
