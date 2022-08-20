import { Router } from "express";
import { excelRoute } from "./excel/excel.route";
import { greetingRoute } from "./greeting/greeting.route";
const router = Router();

router.use(excelRoute);
router.use(greetingRoute);

export const AllRouters = () => router