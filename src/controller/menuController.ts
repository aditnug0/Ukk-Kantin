import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs"
import { BASE_URL } from "../global";
import { string } from "joi";

// Define a custom request type that includes `user`
interface AuthRequest extends Request {
    user?: { Id: number; role: string };
}

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const readMenu = async (request: Request, response: Response) => {
    try {
        const { search } = request.query

        const diskon = await prisma.menu_diskon.findMany({
            where: {
                id_diskon: {},
            }, include: { diskon_detail_md: true, menu_detail_md: true }
        })
        const allMenu = await prisma.menu.findMany({
            where: {
                nama_makanan: { contains: search?.toString() || "" }
            }, include: { stan_detail_mu: true, menu_diskon: true }
        })
        /** contains means search name of menu based on sent keyword */
        return response.json({
            status: true,
            data: allMenu, diskon,
            message: `Menu has found`
        }).status(200)
    } catch (error) {
        return response
            .json({
                status: false,
                message: `Error has occured ${error}`
            })
            .status(400)
    }
}

export const createMenu = async (request: AuthRequest, response: Response) => {
    try {

        const { Id: userId } = request.user!;

        if (!userId) {
            return response.status(401).json({ status: false, message: "Unauthorized: Missing user ID" });
        }

        const existingStan = await prisma.stan.findFirst({
            where: { id_user: userId }
        });

        if (!existingStan) {
            return response.status(401).json({ status: false, message: "Not found" });
        }

        const { nama_makanan, harga, jenis, foto, deskripsi, } = request.body /** get requested data (data has been sent from request) */

        /** variable filename use to define of uploaded file name */
        let filename = ""
        if (request.file) filename = request.file.filename /** get file name of uploaded file */

        /** process to save menu */
        const newMenu = await prisma.menu.create({
            data: {
                nama_makanan, harga: Number(harga),
                jenis: (jenis),
                foto: filename,
                deskripsi: String(deskripsi),
                id_stan: existingStan.Id
            }
            , include: { stan_detail_mu: true }
        })
        /** price and stock have to convert in number type */

        return response.json({
            status: true,
            data: newMenu,
            message: `New Menu data has created`
        }).status(200)
    } catch (error) {
        return response
            .json({
                status: false,
                message: `An error has occured ${error}`
            })
            .status(400)
    }
}

// export const createMenu = async (request: Request, response: Response) => {
//     try {
//         const { nama_makanan, harga, jenis, foto, deskripsi, id_stan, } = request.body /** get requested data (data has been sent from request) */

//         /** variable filename use to define of uploaded file name */
//         let filename = ""
//         if (request.file) filename = request.file.filename /** get file name of uploaded file */

//         /** process to save menu */
//         const newMenu = await prisma.menu.create({
//             data: { nama_makanan, harga: Number(harga), jenis: (jenis), foto: filename, deskripsi: String(deskripsi), id_stan: Number(id_stan), }
//             , include: { stan_detail_mu: true }
//         })
//         /** price and stock have to convert in number type */

//         return response.json({
//             status: true,
//             data: newMenu,
//             message: `New Menu data has created`
//         }).status(200)
//     } catch (error) {
//         return response
//             .json({
//                 status: false,
//                 message: `An error has occured ${error}`
//             })
//             .status(400)
//     }
// }


export const updateMenu = async (request: AuthRequest, response: Response) => {
    try {

        const { Id: userId } = request.user!;

        if (!userId) {
            return response.status(401).json({ status: false, message: "Unauthorized: Missing user ID" });
        }

        const existingStan = await prisma.stan.findFirst({
            where: { id_user: userId }
        });

        if (!existingStan) {
            return response.status(401).json({ status: false, message: "Not found" });
        }

        const { Id } = request.params;
        const { nama_makanan, harga, jenis, foto, deskripsi, } = request.body /** get requested data (data has been sent from request) */

        const findMenu = await prisma.menu.findFirst({ where: { Id: Number(Id) } });
        if (!findMenu) {
            return response.status(404).json({ status: false, message: `Menu is not found` });
        }

        let filename = findMenu.foto; // Default value based on existing image

        if (request.file) {
            // If a new file is uploaded, use the new filename
            filename = request.file.filename;

            // Delete old image file
            const imagePath = `${BASE_URL}/public/stan/${findMenu.foto}`;
            const imageExists = fs.existsSync(imagePath);

            if (imageExists && findMenu.foto !== '') {
                fs.unlinkSync(imagePath);
            }
        }

        const updatedMenu = await prisma.menu.update({
            where: { Id: Number(Id) },
            data: {
                nama_makanan: nama_makanan ? String(nama_makanan) : findMenu.nama_makanan,
                harga: harga ? Number(harga) : findMenu.harga,
                jenis: jenis ? (jenis) : findMenu.jenis,
                foto: filename,
                deskripsi: deskripsi ? String(deskripsi) : findMenu.deskripsi,
                id_stan: existingStan.Id

            },

        });

        return response.status(200).json({
            status: true,
            data: updatedMenu,
            message: `Menu data have been updated`
        })
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `An error occurred: ${error}`
        });
    }
};

export const deleteMenu = async (request: Request, response: Response) => {
    try {
        const { Id } = request.params;

        const findMenu = await prisma.menu.findFirst({ where: { Id: Number(Id) } });
        if (!findMenu) {
            return response.status(404).json({ status: false, message: `Menu is not found` });
        }

        const imagePath = `${BASE_URL}/public/stan/${findMenu.foto}`;
        const imageExists = fs.existsSync(imagePath);

        if (imageExists && findMenu.foto !== '') {
            fs.unlinkSync(imagePath);
        }

        const deletedMenu = await prisma.menu.delete({ where: { Id: Number(Id) } });

        return response.json({
            status: true,
            data: deletedMenu,
            message: `Menu data have been deleted`
        }).status(200);
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `An error occurred: ${error}`
        });
    }
};


