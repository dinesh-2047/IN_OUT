import {} from "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import gatePassRouter from "./routes/gatepass.routes.js";
import { ApiError } from "./utils/ApiError.js";
import { ApiResponse } from "./utils/ApiResponse.js";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/gatepasses", gatePassRouter);

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err instanceof ApiError ? err.statusCode : err?.statusCode || 500;
    const message = err instanceof ApiError ? err.message : err?.message || "Internal server error";
    const errors = err instanceof ApiError ? err.errors : err?.errors || [];

    return res.status(statusCode).json(
        Object.assign(new ApiResponse(statusCode, null, message), {
            errors,
            success: false,
        })
    );
});

export { app };