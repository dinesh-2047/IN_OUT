import { app } from "./app.js";
import connectDB from "./db/db.js";

const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.error("Server Error", error);
            throw error;
        });

        app.listen(PORT, () => {
            console.log(`Server is running at port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB Connection failed", err);
        process.exit(1);
    });