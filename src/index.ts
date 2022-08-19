require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import { readFile, writeFile } from "fs/promises";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3001

app.use(bodyParser.json())


app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: "Hello World" })
})

app.get("/excel", async (req: Request, res: Response, next: NextFunction) => {



    res.json({ success: true })
})


app.listen(PORT, () => console.log(`http://localhost:${PORT}`)
)