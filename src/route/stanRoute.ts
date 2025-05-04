import express from "express";
import { verifyAdmin, verifyUser } from "../middleware/verify";
import { verifyAddAU, verifyAuthentication, verifyEditAU } from "../middleware/verifytoken";
import { createStan, deletePlg, deleteStan, income, readStan, Stan, statusPj, updatePlg, updateStan } from "../controller/stanController";
import { createSiswa, deleteSiswa, readSiswa, Siswa, statusPm, updateSiswa } from "../controller/siswaController";
import { verifyAddStan, verifyEditStan } from "../middleware/verifySS";
import { verifyAddSiswa, verifyEditSiswa } from "../middleware/verifySS";
import uploadFile from "../middleware/uploadFileSw";

const app = express();

// allow to read json from the body
app.use(express.json());

// adress for get stan data
app.get(`/stan`, verifyAdmin, readStan);

// adress for get stan data
app.get(`/statusSt`, verifyAdmin, Stan);

app.get(`/statusPj`, verifyAdmin, statusPj);

app.get(`/income`, verifyAdmin, income);

// adress for add new stan
app.post(`/stan`,/* verifyAdmin,*/ verifyAddStan, createStan);

// app.put(`/stan/:Id`, verifyAdmin, /*verifyEditStan,*/ updateStan);
app.put(`/stan`, verifyAdmin, verifyEditStan, updateStan);

// app.delete(`/stan/:Id`, verifyAdmin, deleteStan);
app.delete(`/stan`, verifyAdmin, deleteStan);

// adress for add new siswa
// app.post(`/siswa`, verifyUser, /*verifyAddSiswa,*/ createSiswa);
app.post(`/plg`, verifyAdmin, [uploadFile.single("siswa[0][foto]"), verifyAddSiswa], createSiswa);

// app.put(`/siswa/:Id`, [uploadFile.single("siswa[0][foto]"), verifyUser, verifyEditSiswa], updateSiswa);

app.put(`/plg/:Id`, verifyAdmin, [uploadFile.single("siswa[0][foto]"), verifyEditSiswa], updatePlg);

// app.delete(`/siswa/:Id`, verifyUser, deleteSiswa);
app.delete(`/plg/:Id`, verifyAdmin, deletePlg);


export default app;
