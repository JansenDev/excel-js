export interface IUser extends IUserCells {
    role_id?: number | undefined;
    office_id?: number | undefined;
}

export interface ICellError {
    message: string,
    cell: string,
    description: string
}

export interface IUserCells {
    identityDocument: string;
    names: string;
    lastName: string;
    role: string;
    office: string;
}