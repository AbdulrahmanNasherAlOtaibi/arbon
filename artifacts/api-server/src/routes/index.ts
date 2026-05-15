import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import dealsRouter from "./deals";
import contractsRouter from "./contracts";
import disputesRouter from "./disputes";
import dashboardRouter from "./dashboard";
import templatesRouter from "./templates";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(dealsRouter);
router.use(contractsRouter);
router.use(disputesRouter);
router.use(dashboardRouter);
router.use(templatesRouter);

export default router;
