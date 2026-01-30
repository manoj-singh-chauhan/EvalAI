import { Router } from "express";
import { BillingController } from "./billing.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

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

router.post("/webhook", BillingController.handleWebhook);
export default router;