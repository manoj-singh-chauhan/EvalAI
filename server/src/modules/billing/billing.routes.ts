import { Router } from "express";
import { BillingController } from "./billing.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

router.post("/webhook", BillingController.handleWebhook);

router.get(
    "/me", requireAuth,
    BillingController.getMe
);
router.post(
    "/create-order", requireAuth,
    BillingController.createOrder
);
router.post(
    "/verify", requireAuth,
    BillingController.verifyPayment
);


export default router;