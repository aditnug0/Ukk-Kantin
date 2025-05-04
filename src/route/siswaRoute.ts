import express from "express";
import { verifyAdmin, verifyUser } from "../middleware/verify";
import { verifyAddAU, verifyAuthentication, verifyEditAU } from "../middleware/verifytoken";
import { createUser, deleteUser, readUser, updateUser } from "../controller/userController";
import { createSiswa, deleteSiswa, readSiswa, Siswa, statusPm, struk, tracker, updateSiswa } from "../controller/siswaController";
import { verifyAddSiswa, verifyEditSiswa } from "../middleware/verifySS";
import uploadFile from "../middleware/uploadFileSw";
const app = express();

// allow to read json from the body
app.use(express.json());

// adress for get siswa data
app.get(`/siswa`, verifyUser, readSiswa);

app.get(`/statusSs`, verifyUser, Siswa);

app.get(`/statuspm`, verifyUser, statusPm);

app.get(`/tracker/:transaksiId`, verifyUser, tracker);

app.get(`/struk/:transaksiId`, verifyUser, struk);

// adress for add new siswa
// app.post(`/siswa`, verifyUser, /*verifyAddSiswa,*/ createSiswa);
app.post(`/siswa`, /*verifyUser,*/[uploadFile.single("siswa[0][foto]"), verifyAddSiswa], createSiswa);

// app.put(`/siswa/:Id`, [uploadFile.single("siswa[0][foto]"), verifyUser, verifyEditSiswa], updateSiswa);

app.put(`/siswa`, verifyUser, [uploadFile.single("siswa[0][foto]"), verifyEditSiswa], updateSiswa);

// app.delete(`/siswa/:Id`, verifyUser, deleteSiswa);
app.delete(`/siswa`, verifyUser, deleteSiswa);


export default app;
