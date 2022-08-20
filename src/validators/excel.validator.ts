import { Joi } from "celebrate";
import { errorExcelMessages } from "./errorMessages/errorExcelMessages";
import { APELLIDO_REGEX, DNI_REGEX } from "./regex";


export const userExcelSchema = Joi.object().keys({
    identityDocument: Joi.string().regex(DNI_REGEX).message(errorExcelMessages.identityDocument),
    names: Joi.string().custom((value, helpers) => {
        // console.log("CUSTOM JOI NAME: ", value);
        return value
    }, "MY Custom Joi"),
    lastName: Joi.string().regex(APELLIDO_REGEX).message(errorExcelMessages.lastName),
    role: Joi.string().required(),
    office: Joi.string().required(),
})

