import { PrismaClient, role } from "@prisma/client";
import { Request, Response, request, response } from "express";
import md5 from "md5"
import { sign } from "jsonwebtoken";
import { Sign } from "crypto";
import { date } from "joi";

// Define a custom request type that includes `user`
interface AuthRequest extends Request {
    user?: { Id: number; role: string };
}

// create an object from prisma
const prisma = new PrismaClient();

// const createDiskon = async (request: Request, response: Response) => {
//     try {
//         // Extract fields from request body
//         // const { username, password, role, stan } = request.body;
//         const { id_stan, nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir, menu_diskon } = request.body;

//         // Validate that stan is an array
//         if (!Array.isArray(menu_diskon) || menu_diskon.length === 0) {
//             return response.status(400).json({
//                 status: false,
//                 message: "Menu Diskon must be a non-empty array."
//             });
//         }

//         const result = await prisma.$transaction(async (prisma) => {
//             // Create the user
//             const newDiskon = await prisma.diskon.create({
//                 data: {
//                     id_stan,
//                     nama_diskon,
//                     persentase_diskon,
//                     tanggal_awal: new Date(tanggal_awal),
//                     tanggal_akhir: new Date(tanggal_akhir),
//                     // password: md5(password)
//                 }
//             });

//             // Map over the stan array and add the new user's ID to each record
//             const diskonData = menu_diskon.map((item: any) => ({
//                 id_menu: item.id_menu,
//                 id_diskon: newDiskon.Id
//             }));

//             // Create all stan records for this user
//             await prisma.menu_diskon.createMany({
//                 data: diskonData
//             });

//             // Optionally, retrieve the created stan records
//             const newMd = await prisma.menu_diskon.findMany({
//                 where: { id_diskon: newDiskon.Id }
//             });

//             return { newDiskon, newMd };
//         });

//         return response.status(201).json({
//             status: true,
//             data: result,
//             message: "Diskon and Menu Diskon created successfully"
//         });
//     } catch (error: any) {
//         console.error("Error creating user with stan:", error);
//         return response.status(500).json({
//             status: false,
//             message: "Internal server error"
//         });
//     }
// };

const createDiskon = async (request: AuthRequest, response: Response) => {
    try {
        // Extract fields from request body

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

        const { nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir, menu_diskon } = request.body;

        // Validate that stan is an array
        if (!Array.isArray(menu_diskon) || menu_diskon.length === 0) {
            return response.status(400).json({
                status: false,
                message: "Menu Diskon must be a non-empty array."
            });
        }

        const result = await prisma.$transaction(async (prisma) => {
            // Create the user
            const newDiskon = await prisma.diskon.create({
                data: {
                    id_stan: existingStan.Id,
                    nama_diskon,
                    persentase_diskon,
                    tanggal_awal: new Date(tanggal_awal),
                    tanggal_akhir: new Date(tanggal_akhir),
                    // password: md5(password)
                }
            });

            // Map over the stan array and add the new user's ID to each record
            const diskonData = menu_diskon.map((item: any) => ({
                id_menu: item.id_menu,
                id_diskon: newDiskon.Id
            }));

            // Create all stan records for this user
            await prisma.menu_diskon.createMany({
                data: diskonData
            });

            // Optionally, retrieve the created stan records
            const newMd = await prisma.menu_diskon.findMany({
                where: { id_diskon: newDiskon.Id }
            });

            return { newDiskon, newMd };
        });

        return response.status(201).json({
            status: true,
            data: result,
            message: "Diskon and Menu Diskon created successfully"
        });
    } catch (error: any) {
        console.error("Error creating user with stan:", error);
        return response.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

// create a function to READ diskon

const readDiskon = async (request: Request, response: Response) => {
    try {
        const { search } = request.query
        const allDisc = await prisma.menu_diskon.findMany({
            where:
            {
                // id: { contains: search?.toString() || "" }
            },
            include: { menu_detail_md: true, diskon_detail_md: true }
        })
        /** contains means search name of siswa based on sent keyword */
        return response.json({
            status: true,
            data: allDisc,
            message: `Discount has found`
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


// const readDiskon = async (request: Request, response: Response) => {
//     try {
//         // pagination
//         const page = Number(request.query.page) || 1;
//         const qty = Number(request.query.qty) || 5;
//         // searching
//         const keyword = request.query.keyword?.toString() || "";

//         // await untuk memebri delay pada sistem asyncronous sehingga berjalan
//         // seperti syncronous dan menunggu sistem sebelumnya
//         const diskonData = await prisma.menu_diskon.findMany({
//             //untuk mendefinisikan jml data yang diambil
//             take: qty,
//             skip: (page - 1) * qty,
//             where: {
//                 // OR: [
//                 //     // { nama_diskon: { contains: keyword } },
//                 //     // { role: { contains:keyword } },
//                 // ]
//             }
//             , include: { diskon_detail_md: true, menu_detail_md: true },
//             orderBy: { Id: "asc" }
//         });
//         return response.status(200).json({
//             status: true,
//             data: diskonData,
//             message: `Diskon data has been loaded`,
//         });
//     } catch (error) {
//         return response.status(500).json({
//             status: false,
//             message: error,
//         });
//     }
// };

const updateDiskon = async (request: AuthRequest, response: Response) => {
    try {
        const { Id: userId } = request.user!;

        if (!userId) {
            return response.status(401).json({ status: false, message: "Unauthorized: Missing user ID" });
        }

        const { Id } = request.params;
        const dsId = Number(Id);
        if (isNaN(dsId)) {
            return response.status(401).json({ status: false, message: "Invalid ID" });
        }

        const findDiskon = await prisma.diskon.findFirst({ where: { Id: dsId } });
        if (!findDiskon) {
            return response.status(404).json({ status: false, message: `Diskon is not found` });
        }

        // Get the stan belonging to the authenticated user
        const userStan = await prisma.stan.findFirst({
            where: { id_user: userId },
        });

        if (!userStan || userStan.Id !== findDiskon.id_stan) {
            return response.status(403).json({
                status: false,
                message: "Forbidden: You do not have access to update this menu",
            });
        }
        // const { username, password, role, stan } = request.body;
        const { id_stan, nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir, menu_diskon } = request.body;

        // // Find existing diskon
        // const findDiskon = await prisma.diskon.findUnique({ where: { Id: Number(Id) } });
        // if (!findDiskon) {
        //     return response.status(404).json({ status: false, message: "Diskon not found" });
        // }

        if (!Id) {
            return response.status(400).json({
                status: false,
                message: "Diskon ID is required"
            });
        }

        if (!menu_diskon || !Array.isArray(menu_diskon)) {
            return response.status(400).json({
                status: false,
                message: "Diskon must be a non-empty array."
            });
        }

        const result = await prisma.$transaction(async (prisma) => {
            // Update user. If password is provided, hash it; otherwise, leave as is.
            const updatedDiskon = await prisma.diskon.update({
                where: { Id: dsId },
                data: {
                    // id_stan: id_stan ?? undefined,
                    // id_stan: existingStan.Id,
                    nama_diskon: nama_diskon ?? undefined,
                    persentase_diskon: persentase_diskon ?? undefined,

                    tanggal_awal: tanggal_awal ? new Date(tanggal_awal) : tanggal_awal(),
                    tanggal_akhir: tanggal_akhir ? new Date(tanggal_akhir) : tanggal_akhir(),
                    // password: password ? md5(password) : undefined,
                    // role: role ?? undefined,
                },
            });

            // Process the stan array.
            // Get existing stans for the user.
            const existingDiskons = await prisma.menu_diskon.findMany({
                where: { id_diskon: Number(Id) },
            });
            const existingDiskonIds = existingDiskons.map((d) => d.Id);

            // Separate provided stan records into those to update and those to create.
            const mdToUpdate = menu_diskon.filter((d: any) => d.Id);
            const mdToCreate = menu_diskon.filter((d: any) => !d.Id);

            // Update each stan that has an Id.
            for (const d of mdToUpdate) {
                // Optional: You might want to ensure this stan belongs to the user.
                if (!existingDiskonIds.includes(d.Id)) {
                    throw new Error(`md with Id ${d.Id} does not belong to user ${Id}`);
                }
                await prisma.menu_diskon.update({
                    where: { Id: d.Id },
                    data: {

                        id_menu: d.id_menu ?? undefined,
                        // nama_stan: s.nama_stan ?? undefined,
                        // nama_pemilik: s.nama_pemilik ?? undefined,
                        // Telp: s.Telp ?? undefined,
                    },
                });
            }

            // // Create new stan records.
            // if (mdToCreate.length > 0) {
            //     await prisma.menu_diskon.createMany({
            //         data: mdToCreate.map((d: any) => ({
            //             id_menu: d.id_menu,
            //             id_diskon: Number(Id),
            //             // nama_stan: d.nama_stan,
            //             // nama_pemilik: d.nama_pemilik,
            //             // Telp: d.Telp,
            //         })),
            //     });
            // }

            // // Optionally: If you want to remove any stan records that are no longer provided, you could do that here.
            // // For example:
            // const providedMdIds = menu_diskon.filter((d: any) => d.Id).map((d: any) => d.Id);
            // const MdToDelete = existingDiskonIds.filter((id) => !providedMdIds.includes(id));
            // if (MdToDelete.length > 0) {
            //     await prisma.menu_diskon.deleteMany({
            //         where: { Id: { in: MdToDelete } }
            //     });
            // }

            return updatedDiskon;
        });

        return response.status(200).json({
            status: true,
            data: result,
            message: "Diskon and related records have been updated successfully"
        });
    } catch (error: any) {
        console.error("Error updating user with stan:", error);
        return response.status(500).json({
            status: false,
            message: error.message || "Internal server error"
        });
    }
};


const deleteDiskon = async (request: AuthRequest, response: Response) => {
    try {

        // const { Id } = request.params;

        // if (!Id) {
        //     return response.status(400).json({
        //         status: false,
        //         message: "ID required"
        //     });
        // }

        const { Id: userId } = request.user!;

        if (!userId) {
            return response.status(401).json({ status: false, message: "Unauthorized: Missing user ID" });
        }

        const { Id } = request.params;
        const dsId = Number(Id);
        if (isNaN(dsId)) {
            return response.status(401).json({ status: false, message: "Invalid ID" });
        }

        const findDiskon = await prisma.diskon.findFirst({ where: { Id: dsId } });
        if (!findDiskon) {
            return response.status(404).json({ status: false, message: `Diskon is not found` });
        }

        // Get the stan belonging to the authenticated user
        const userStan = await prisma.stan.findFirst({
            where: { id_user: userId },
        });

        if (!userStan || userStan.Id !== findDiskon.id_stan) {
            return response.status(403).json({
                status: false,
                message: "Forbidden: You do not have access to update this menu",
            });
        }

        // Convert Id to integer
        // const diskonId = parseInt(Id);
        const diskonId = dsId;

        // Check if transaksi exists
        const existingDiskon = await prisma.diskon.findUnique({
            where: { Id: diskonId, },
            include: { menu_diskon: true }

        });

        if (!existingDiskon) {
            return response.status(404).json({
                status: false,
                message: "Diskon not found"
            });
        }

        // Delete related detail_transaksi first
        await prisma.menu_diskon.deleteMany({
            where: { id_diskon: diskonId }
        });

        // Now delete transaksi
        const deletedDiskon = await prisma.diskon.delete({
            where: { Id: diskonId }
        });

        return response.status(200).json({
            status: true,
            deletedDiskon,
            message: "User and stan deleted successfully"
        });

    } catch (error) {
        console.error("Error while deleting :", error);

        return response.status(500).json({
            status: false,
            message: "[DELETE Diskon] Internal server error"
        });
    }
};

export { createDiskon, readDiskon, updateDiskon, deleteDiskon }