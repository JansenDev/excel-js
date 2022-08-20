import { NextFunction, Request, Response, Router } from "express";

const greetingRoute = Router()

greetingRoute.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: "Hello World" });
});

export {
    greetingRoute
}