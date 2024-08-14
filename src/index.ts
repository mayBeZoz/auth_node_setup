require('dotenv').config();

import express from 'express';
import dbConnection from './core/infrastructure/db-connection';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.listen(port, () => {
    console.log(`Server running at port ${port}`);
    dbConnection()
});
