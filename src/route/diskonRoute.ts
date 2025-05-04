import express from "express";
import { verifyAdmin, verifyUser } from "../middleware/verify";
import { verifyAddAU, verifyAuthentication, verifyEditAU } from "../middleware/verifytoken";
// import { createUser, deleteUser, loginUser, readUser, updateUser } from "../controller/userController";
import { createDiskon, deleteDiskon, readDiskon, updateDiskon } from "../controller/diskonController";
import { verifyAddDiskon, verifyEditDiskon } from "../middleware/verifyMD";
const app = express();

// allow to read json from the body
app.use(express.json());

// adress for get diskon data
app.get(`/diskon`, verifyAdmin, readDiskon);

// adress for add new diskon
app.post(`/diskon`, verifyAdmin, verifyAddDiskon, createDiskon);

app.put(`/diskon/:Id`, verifyAdmin, verifyEditDiskon, updateDiskon);

app.delete(`/diskon/:Id`, verifyAdmin, deleteDiskon);


export default app;
