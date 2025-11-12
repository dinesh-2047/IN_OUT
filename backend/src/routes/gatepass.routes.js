import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createGatePassRequest,
  decideGatePassRequest,
  getGatePassRequestById,
  listGatePassRequests,
  scanGatePassToken,
} from "../controllers/gatepass.controller.js";

const router = Router();

router.use(verifyJWT);

router.post("/", createGatePassRequest);
router.get("/", listGatePassRequests);
router.post("/tokens/scan", scanGatePassToken);
router.get("/:id", getGatePassRequestById);
router.post("/:id/decision", decideGatePassRequest);

export default router;
