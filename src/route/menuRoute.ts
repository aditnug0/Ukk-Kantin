import express from "express";
import { verifyAdmin, verifyUser } from "../middleware/verify";
import { verifyAddAU, verifyAuthentication, verifyEditAU } from "../middleware/verifytoken";
import { createMenu, deleteMenu, readMenu, updateMenu } from "../controller/menuController";
import { verifyAddMenu, verifyEditMenu } from "../middleware/verifyMD";
import uploadFile from "../middleware/uploadFileMn";
const app = express();

// allow to read json from the body
app.use(express.json());

// adress for get menu data
app.get(`/menuU`, verifyUser, readMenu);

app.get(`/menuA`, verifyAdmin, readMenu);

// adress for add new menu
// app.post(`/menu`, verifyUser, verifyAddMenu, createMenu);
app.post(`/menu`, [uploadFile.single("foto"), verifyAdmin, verifyAddMenu], createMenu);

app.put(`/menu/:Id`, [uploadFile.single("foto"), verifyAdmin, verifyEditMenu], updateMenu);

// app.put(`/menu/:Id`, verifyAdmin, verifyEditMenu, updateMenu);

app.delete(`/menu/:Id`, verifyAdmin, deleteMenu);


export default app;
