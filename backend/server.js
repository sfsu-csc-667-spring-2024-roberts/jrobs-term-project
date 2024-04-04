import express from "express";
import rootRoutes from "./routes/root.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/", rootRoutes);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
