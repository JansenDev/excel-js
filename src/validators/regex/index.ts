
// Solo numeros,
// exactamente 8 caracteres
export const DNI_REGEX = /^[0-9]{8}$/

// Minimo dos grupos de palabras
// caracter minimo por cada grupo 2, max: 30
// si es apellido conpuesto opcionamente 1 a 3 grupos mas
export const APELLIDO_REGEX = /^[a-zñáéíóú]{2,30}\s[a-zñáéíóú]{2,30}(\s[a-zñáéíóú]{2,30}){0,3}$/i
