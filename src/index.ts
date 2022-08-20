require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import { readFile, writeFile } from "fs/promises";
import bodyParser from "body-parser";
import Excel, { Worksheet } from "exceljs";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());

app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: "Hello World" });
});

app.get("/excel", async (req: Request, res: Response, next: NextFunction) => {
    const { fileBase64 } = req?.body;
    try {
        // const excel = await readFile("./importacion masiva de usuarios.xlsx", "base64");
        // await writeFile("excel-base64.txt", excel)
        if (!fileBase64) throw new Error("No hay excel");

        const excelBuffer64 = Buffer.from(fileBase64, "base64");
        const { worksheet } = await readExcelBuffer(excelBuffer64, 1);

        // const rows6 = worksheet.getRow(6);
        // console.log("ROW PRRO: ", rows6.values);
        const { data, errors } = await recorrerExcel(worksheet);
        console.log(data);


        res.status(200).json({ success: true, error: false });
    } catch (error: any) {
        console.log(error);
        res
            .status(404)
            .json({ success: false, error: true, message: error.message });
    }
});

const recorrerExcel = async (worksheet: Worksheet) => {
    const data: IUser[] = [];
    const errors: any[] = [];
    worksheet.eachRow({ includeEmpty: false }, (row, numberRow) => {
        if (numberRow === 6) {
            const headers: any = row.values;
            const isValidHeaders = checkExcelHeader(headers);

            console.log(`Row(${numberRow}): `, row.values);
            console.log(isValidHeaders);

            if (!isValidHeaders) throw new Error("Cabeceras incorrectas");
        } else if (numberRow >= 7) {
            // console.log(`Row(${numberRow}): `, row.values);
            const rowValues: any = row.values;
            const userData = {
                identityDocument: rowValues[2],
                names: rowValues[3],
                lastName: rowValues[4],
                role: rowValues[5],
                office: rowValues[6],
            };

            data.push(userData);
        }
    });
    return {
        data,
        errors,
    };
};

const checkExcelHeader = (headers: string[] = []) => {
    const headerValids = ["DNI", "NOMBRES", "APELLIDOS", "ROL", "TIENDA"];
    headers.map((value) => value.toUpperCase());
    if (
        headers[2] === headerValids[0] &&
        headers[3] === headerValids[1] &&
        headers[4] === headerValids[2] &&
        headers[5] === headerValids[3] &&
        headers[6] === headerValids[4]
    ) {
        return true;
    }
    return false;
};

export const readExcelBuffer = async (excelBuffer: Buffer, index = 1) => {
    let workBook = new Excel.Workbook();
    await workBook.xlsx.load(excelBuffer);
    let worksheet = workBook.getWorksheet(index);
    return { workBook, worksheet };
};

export interface IUser {
    identityDocument: string;
    names: string;
    lastName: string;
    role: string;
    office: string;
}

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
