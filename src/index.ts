require('dotenv').config();

import express from 'express';
import dbConnection from './core/infrastructure/db-connection';
import router from './features/router';
import cookieParser from 'cookie-parser'

const app = express();
const port = process.env.PORT || 3000;
dbConnection()

app.use(express.json());
app.use(cookieParser())
app.use(router)

app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});
