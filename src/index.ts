require('dotenv').config();

import express,{ Request, Response, NextFunction } from "express";
import dbConnection from './core/infrastructure/db-connection';
import router from './features/router';
import cookieParser from 'cookie-parser'
import { ResponseStatus } from "./core/utils/constants";

const app = express();
const port = process.env.PORT || 3000;
dbConnection()

app.use(express.json());
app.use(cookieParser())
app.use(router)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {

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
