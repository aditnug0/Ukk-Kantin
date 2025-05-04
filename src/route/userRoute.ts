import express from "express";
import { verifyAdmin, verifyUser, loginUser } from "../middleware/verify";
import { verifyAddAU, verifyAuthentication, verifyEditAU } from "../middleware/verifytoken";
import { createUser, deleteUser, readUser, updateUser } from "../controller/userController";
const app = express();

// allow to read json from the body
app.use(express.json());

// adress for get user data
app.get(`/user`, verifyUser, readUser);

// adress for add new user
app.post(`/user`,  /*verifyUser,*/ verifyAddAU, createUser);

app.put(`/user/:Id`, verifyAdmin, verifyEditAU, updateUser);

app.delete(`/user/:Id`, verifyAdmin, deleteUser);

app.post(`/user/login`, verifyAuthentication, loginUser);


export default app;
