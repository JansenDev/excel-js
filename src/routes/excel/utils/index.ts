import Excel, { Worksheet } from "exceljs";
import { ExcelCells, ExcelHeaders } from "../../../domain/enum/excel.enum";
import { ICellError, IUser, IUserCells } from "../../../domain/models/excel.model";
import { dataRoles, dataSucursales } from "../../../utils/fetchData";
import { userExcelSchema } from "../../../validators/excel.validator";

export const recorrerExcel = async (worksheet: Worksheet) => {
    const data: IUser[] = [];
    const errors: any[] = [];
    worksheet.eachRow({ includeEmpty: false }, (row, numberRow) => {
        if (numberRow === 6) {
            const headers: any = row.values;
            const isValidHeaders = checkExcelHeader(headers);

            if (!isValidHeaders) throw new Error("Cabeceras incorrectas");

        } else if (numberRow >= 7) {
            const fetchSucursales = dataSucursales
            const fetchRoles = dataRoles
            // console.log(`Row(${numberRow}): `, row.values);
            const rowValues: any = row.values;

            const userData: IUser = {
                identityDocument: rowValues[2].toString().trim(),
                names: rowValues[3].toString().trim(),
                lastName: rowValues[4].toString().trim(),
                role: rowValues[5].toString().trim(),
                office: rowValues[6].toString().trim(),
            };

            const { joiErrors } = isUserValidate(userData, numberRow, fetchSucursales, fetchRoles);

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

export const isUserValidate = (userData: IUser, numberRow: number, offices: typeof dataSucursales, roles: typeof dataRoles) => {
    const joiErrors: ICellError[] = []

    let officeName = officeCustomExceptions(userData.office.toLocaleLowerCase());

    const schemaValidated = userExcelSchema.validate(userData, { abortEarly: false })

    const findRole = roles.find(e => e.name.toLowerCase() === userData.role.toLowerCase())
    const findOffices = offices.find(e => e.name.toLowerCase() === officeName)

    // ^ si no existe sucursal  en db
    if (!findRole) {
        joiErrors.push({
            message: `No existe el rol '${userData.role}'`,
            cell: `${ExcelCells.role}${numberRow}`,
            description: `${userData.role}`
        })
    }

    // ^ si no existe el rol en db
    if (!findOffices) {
        joiErrors.push({
            message: `No existe la sucursal '${userData.office}'`,
            cell: `${ExcelCells.office}${numberRow}`,
            description: `${userData.office}`
        })
    }else{
        userData.office_id = findOffices.id;
    }

    // ^ si no cumple con el esquema
    if (schemaValidated.error) {
        console.log("JOI VALIDATOR: ", schemaValidated.error?.details);
        schemaValidated.error.details.map(e => {

            const nameCell = e.path[0] as keyof IUserCells;

            joiErrors.push({
                message: e.message,
                cell: `${ExcelCells[nameCell]}${numberRow}`,
                description: e.context?.value
            })
        })
    }else{
        userData.role_id = findRole?.id;
    }


    return { joiErrors, dataWithIds: userData }
}

export const officeCustomExceptions = (officeName: string) => {

    if (officeName === "bellavista") {
        return "ripley callao";
    }

    if (officeName === "mega plaza") {
        return "megaplaza";
    }

    if (officeName === "piura 2") {
        return "piura ii";
    }

    if (officeName === "chiclayo 2") {
        return "chiclayo ii";
    }

    if (officeName === "piura 1" || officeName === "piura i") {
        return "piura";
    }

    if (officeName === "chiclayo 1" || officeName === "chiclayo i") {
        return "chiclayo";
    }
    return officeName

}

export const checkExcelHeader = (headers: string[] = []) => {
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
