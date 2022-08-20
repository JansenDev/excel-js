require("dotenv").config();
import express from "express";
// import { readFile, writeFile } from "fs/promises";
import bodyParser from "body-parser";
import { errorHandler } from "./utils/errorHandler";
import { AllRouters } from "./routes";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());


app.use(AllRouters())


app.use(errorHandler)


app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
