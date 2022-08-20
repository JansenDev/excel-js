import { NextFunction, Request, Response, Router } from "express";
import { readExcelBuffer, recorrerExcel } from "./utils";

const excelRoute = Router()

excelRoute.get("/excel", async (req: Request, res: Response, next: NextFunction) => {
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

        res.status(201).json({ error: [], message: "Subido correctamente", data });
    } catch (error: any) {
        console.log(error);
        res
            .status(404)
            .json({ error: true, message: error.message });
    }
});

export {
    excelRoute
}