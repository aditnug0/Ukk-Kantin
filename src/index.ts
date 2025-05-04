/*ini adalah file utama untuk menjalankan server backend */
/** import library express */
import express, { Request, Response } from "express";
// import routeAdmin from "./route/adminRoute";
import routeUser from "./route/userRoute"
import routeDiskon from "./route/diskonRoute"
import routeSiswa from "./route/siswaRoute"
import routeStan from "./route/stanRoute"
import routeMenu from "./route/menuRoute"
import routeTransaksi from "./route/transaksiRoute"

// import routeTransaction from "./route/olRoute";// order list
// import routeProduct from "./route/productRoute";

/**buat wadah inisiasi express */

const app = express();

/** mendefinisikan PORT berjalannya server */
const PORT = 12;

/**test*/
app.get(`/check`, (request: Request, response: Response) => {
    /**ini adalah proses handle request dengan url adress
     * url adress :https//localhost:12/see
     * method get
     */

    //memberi respon
    return response.status(200).json({
        message: `Hello  `,
    });
});

// register route of event
app.use(routeUser)
app.use(routeDiskon)
app.use(routeSiswa)
app.use(routeStan)
app.use(routeMenu)
app.use(routeTransaksi)



// app.use(routeAdmin)
// app.use(routeTransaction)
// app.use(routeProduct)


/**run server  */
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// 🔰
