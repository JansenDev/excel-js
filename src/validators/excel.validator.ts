import { Joi, Segments } from "celebrate";

// Solo numeros,
// exactamente 8 caracteres
const DNI_REGEX = /^[0-9]{8}$/

// Minimo dos grupos de palabras
// caracter minimo por cada grupo 2, max: 30
// si es apellido conpuesto opcionamente 1 a 3 grupos mas
const APELLIDO_REGEX = /^[a-zñáéíóú]{2,30}\s[a-zñáéíóú]{2,30}(\s[a-zñáéíóú]{2,30}){0,3}$/i

export const excelBodySchema = {
    [Segments.BODY]: Joi.object({
        fileBase64: Joi.string().required()
    })
}


export const userExcelSchema = Joi.object().keys({
    identityDocument: Joi.string().regex(DNI_REGEX).description("REGEX P0RRO"),
    names: Joi.string().custom((value, helpers) => {
        // console.log("CUSTOM JOI NAME: ", value);
        return value
    }, "MY Custom Joi"),
    lastName: Joi.string().regex(APELLIDO_REGEX),
    role: Joi.string().required(),
    office: Joi.string().required(),
})

