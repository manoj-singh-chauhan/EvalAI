import { Router } from "express";
import { ActivityController } from "./activity.controller";


const router = Router();
router.get(
    "/",  
    ActivityController.getMyActivity);

export default router;