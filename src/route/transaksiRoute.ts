import express from "express";
import { verifyAdmin, verifyAuth, verifyUser } from "../middleware/verify";
import { verifyAddAU, verifyAuthentication, verifyEditAU } from "../middleware/verifytoken";
// import { createUser, deleteUser, loginUser, readUser, updateUser } from "../controller/userController";
import { createTransaksi, deleteTransaksi, printStruk, readTransaksi, updateTransaksi } from "../controller/transaksiController";
import { verifyAddDiskon, verifyEditDiskon } from "../middleware/verifyMD";
import { verifyAddOrder, verifyEditOrder } from "../middleware/verifyOrder";
const app = express();


// allow to read json from the body
app.use(express.json());

// adress for get transaksi data
app.get(`/transaksiU`, verifyUser, readTransaksi);

app.get(`/transaksiA`, verifyAdmin, readTransaksi);

// adress for add new transaksi
app.post(`/transaksiU`, verifyUser, verifyAddOrder, createTransaksi);

app.post(`/transaksiA`, verifyAdmin, verifyAddOrder, createTransaksi);

app.put(`/transaksi/:Id`, verifyAdmin, verifyEditOrder, updateTransaksi);


app.delete(`/transaksi/:Id`, verifyAdmin, deleteTransaksi);


export default app;
