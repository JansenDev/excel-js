require("dotenv").config();
import express, { ErrorRequestHandler, NextFunction, Request, Response } from "express";
// import { readFile, writeFile } from "fs/promises";
import bodyParser from "body-parser";
import Excel, { Worksheet } from "exceljs";
import { userExcelSchema } from "./validators/excel.validator";
import { dataRoles, dataSucursales } from "./utils/fetchData";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());

app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: "Hello World" });
});

app.get("/excel", async (req: Request, res: Response, next: NextFunction) => {
    const { fileBase64 } = req.body;
    try {
        // const excel = await readFile("./importacion masiva de usuarios.xlsx", "base64");
        // await writeFile("excel-base64.txt", excel)
        if (!fileBase64) throw new Error("No hay excel");

        const excelBuffer64 = Buffer.from(fileBase64, "base64");
        const { worksheet } = await readExcelBuffer(excelBuffer64, 1);

        // const rows6 = worksheet.getRow(6);
        // console.log("ROW PRRO: ", rows6.values);
        const { data, errors } = await recorrerExcel(worksheet);

        if (errors.length) {
            return res.status(400)
                .json({ error: true, message: errors });
        }

        console.log("data: ", data.length);




        res.status(200).json({ success: true, error: [], message: "Subido correctamente" });
    } catch (error: any) {
        console.log(error);
        res
            .status(404)
            .json({ error: true, message: error.message });
    }
});

const recorrerExcel = async (worksheet: Worksheet) => {
    const data: IUser[] = [];
    const errors: any[] = [];
    worksheet.eachRow({ includeEmpty: false }, (row, numberRow) => {
        if (numberRow === 6) {
            const headers: any = row.values;
            const isValidHeaders = checkExcelHeader(headers);

            console.log(`Row(${numberRow}): `, headers);
            console.log(isValidHeaders);

            if (!isValidHeaders) throw new Error("Cabeceras incorrectas");

        } else if (numberRow >= 7) {
            // console.log(`Row(${numberRow}): `, row.values);
            const rowValues: any = row.values;
            const userData: IUser = {
                identityDocument: rowValues[2].toString(),
                names: rowValues[3].toString(),
                lastName: rowValues[4].toString(),
                role: rowValues[5].toString(),
                office: rowValues[6].toString(),
            };
            const fetchSucursales = dataSucursales
            const fetchRoles = dataRoles
            const { joiErrors } = isUserValidate(userData, numberRow, fetchSucursales, fetchRoles);
            // console.log("joiErrors: ", joiErrors);

            if (joiErrors.length) {
                errors.push(joiErrors)
            } else {
                data.push(userData);
            }

        }
    });
    return {
        data,
        errors,
    };
};

const isUserValidate = (userData: IUser, numberRow: number, sucursales: typeof dataSucursales, roles: typeof dataRoles) => {
    const joiErrors: ICellError[] = []
    // const cellError: ICellError = {} as ICellError;

    const data = userExcelSchema.validate(userData, { abortEarly: false })
    // ^ si no cumple con el esquema
    if (data.error) {
        console.log("JOI VALIDATOR: ", data.error?.details);
        data.error.details.map(e => {
            console.log(e);

            const nameCell = e.path[0] as keyof IUser;
            joiErrors.push({
                message: e.message,
                cell: `${ExcelCells[nameCell]}${numberRow}`,
                description: e.context?.value
            })
        })
    }

    return { joiErrors }
}

const checkExcelHeader = (headers: string[] = []) => {
    headers.map((value) => value.toUpperCase());
    if (
        headers[2].toUpperCase() === ExcelHeaders.DNI &&
        headers[3].toUpperCase() === ExcelHeaders.NOMBRES &&
        headers[4].toUpperCase() === ExcelHeaders.APELLIDOS &&
        headers[5].toUpperCase() === ExcelHeaders.ROL &&
        headers[6].toUpperCase() === ExcelHeaders.TIENDA
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

interface IUser {
    identityDocument: string;
    names: string;
    lastName: string;
    role: string;
    office: string;
}
interface ICellError {
    message: string,
    cell: string,
    description: string
}


const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    res.status(500).json({ error: err, message: err.message })
}
enum ExcelHeaders {
    DNI = 'DNI',
    NOMBRES = 'NOMBRES',
    APELLIDOS = 'APELLIDOS',
    ROL = 'ROL',
    TIENDA = 'TIENDA'
}

enum ExcelCells {
    identityDocument = 'B',
    names = 'C',
    lastName = 'D',
    role = 'E',
    office = 'F'
}

// app.use(errors())
app.use(errorHandler)


app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
