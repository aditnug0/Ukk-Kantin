import { transaksi } from './../../node_modules/.prisma/client/index.d';
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs"
import { BASE_URL } from "../global";
import { promisify } from "util";
import path from "path";
import md5 from "md5"
import { verify } from "jsonwebtoken";
import jwt from 'jsonwebtoken';

// Define a custom request type that includes `user`
interface AuthRequest extends Request {
    user?: { Id: number; role: string };
}

const unlinkAsync = promisify(fs.unlink); // Convert fs.unlink to async function

const prisma = new PrismaClient({ errorFormat: "pretty" })

const readSiswa = async (request: Request, response: Response) => {
    try {
        const { search } = request.query
        const allSiswa = await prisma.siswa.findMany({
            where: {
                nama_siswa: { contains: search?.toString() || "" }
            }, include: { user_detail_sw: true }
        })
        /** contains means search name of siswa based on sent keyword */
        return response.json({
            status: true,
            data: allSiswa,
            message: `Student has found`
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

const createSiswa = async (request: Request, response: Response) => {
    try {
        // Extract fields from request body
        // const { username, password, role, stan } = request.body;
        const { username, password, role, siswa } = request.body /** get requested data (data has been sent from request) */

        /** variable filename use to define of uploaded file name */
        // let filename = ""
        // if (request.file) filename = request.file.filename /** get file name of uploaded file */

        // Get uploaded file name if present
        const filename = request.file ? request.file.filename : "";

        // Validate that stan is an array
        if (!Array.isArray(siswa) || siswa.length === 0) {
            return response.status(400).json({
                status: false,
                message: "Siswa must be a non-empty array."
            });
        }

        const result = await prisma.$transaction(async (prisma) => {
            // Create the user
            const newUser = await prisma.users.create({
                data: {
                    username,
                    password: md5(password),
                    role
                }
            });

            // Map over the stan array and add the new user's ID to each record
            const siswaData = siswa.map((item: any) => ({
                nama_siswa: item.nama_siswa,
                alamat: item.alamat,
                telp: item.telp,
                id_user: newUser.Id,
                foto: item.foto || filename
            }));

            // Create all stan records for this user
            await prisma.siswa.createMany({
                data: siswaData
            });

            // Optionally, retrieve the created stan records
            const newSiswa = await prisma.siswa.findMany({
                where: { id_user: newUser.Id }
            });

            return { newUser, newSiswa };
        });

        return response.status(201).json({
            status: true,
            data: result,
            message: "User and Siswa created successfully"
        });
    } catch (error: any) {
        console.error("Error creating user with siswa:", error);
        return response.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

const updateSiswa = async (request: AuthRequest, response: Response) => {
    try {
        const { Id: userId } = request.user!;

        if (!userId) {
            return response.status(401).json({ status: false, message: "Unauthorized: Missing user ID" });
        }

        const { username, password, role, siswa } = request.body;

        // Check if user exists
        const existingUser = await prisma.users.findUnique({
            where: { Id: userId },
        });

        if (!existingUser) {
            return response.status(404).json({ status: false, message: "User not found" });
        }

        // Update user (just like before)
        const updatedUser = await prisma.users.update({
            where: { Id: userId },
            data: {
                username: username ?? undefined,
                password: password ? md5(password) : undefined,
                role: role ?? undefined,
            },
        });

        const siswaData = Array.isArray(siswa) ? siswa[0] : siswa;


        // Get existing siswa record linked to user
        const existingSiswa = await prisma.siswa.findFirst({
            where: { id_user: userId },
        });

        if (!existingSiswa) {
            return response.status(404).json({ status: false, message: "Siswa data not found" });
        }

        let filename = existingSiswa.foto;

        // Handle image update if file is uploaded
        if (request.file) {
            filename = request.file.filename;

            // Delete old image file if present
            const oldImagePath = path.join(__dirname, "..", "public", "siswa", existingSiswa.foto);
            if (fs.existsSync(oldImagePath)) {
                try {
                    fs.unlinkSync(oldImagePath);
                    console.log(`Deleted old image: ${oldImagePath}`);
                } catch (err) {
                    console.error("Failed to delete old image:", err);
                }
            }
        }

        // Update siswa data
        const updatedSiswa = await prisma.siswa.update({
            where: { Id: existingSiswa.Id },
            data: {
                nama_siswa: siswaData?.nama_siswa ?? existingSiswa.nama_siswa,
                alamat: siswaData?.alamat ?? existingSiswa.alamat,
                telp: siswaData?.telp ?? existingSiswa.telp,
                foto: filename,
            },
        });

        return response.status(200).json({
            status: true,
            message: "User and Siswa data updated successfully",
            data: {
                updatedUser,
                updatedSiswa,
            },
        });
    } catch (error) {
        console.error("Error updating siswa:", error);
        return response.status(500).json({
            status: false,
            message: `An error occurred: ${error}`,
        });
    }
};

const Siswa = async (request: AuthRequest, response: Response) => {
    try {
        const { Id } = request.user!; // Get user ID from token

        if (!Id) {
            return response.status(401).json({ status: false, message: "Unauthorized: Missing user ID" });
        }

        // Convert Id to integer
        const userId = Id;

        // Check if user exists
        const existingUser = await prisma.users.findUnique({
            where: { Id: userId },
            include: { siswa: true }
        });

        if (!existingUser) {
            return response.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        return response.status(200).json({
            status: true,
            existingUser,
            message: "Located"
        });

    } catch (error) {
        console.error("Error while locating :", error);

        return response.status(500).json({
            status: false,
            message: "Status Internal server error"
        });
    }
};

const statusPm = async (request: AuthRequest, response: Response) => {
    try {
        const { Id } = request.user!; // Get user ID from token

        if (!Id) {
            return response.status(401).json({ status: false, message: "Unauthorized: Missing user ID" });
        }

        // Get optional month filter from query (e.g., ?month=4)
        const month = request.query.month ? parseInt(request.query.month as string) : null;

        // Convert Id to integer
        const userId = Id;

        // Check if user exists
        const existingUser = await prisma.users.findUnique({
            where: { Id: userId },
            // include: { siswa: { include: { transaksi: { include: { detail_transaksi: true } } } } }
            include: {
                siswa: {
                    include: {
                        transaksi: {
                            where: month ?
                                {
                                    tanggal: {
                                        gte: new Date(new Date().getFullYear(), month - 1, 1),
                                        lt: new Date(new Date().getFullYear(), month, 1),
                                    }
                                }
                                : {},
                            orderBy: {
                                tanggal: 'desc',
                            },
                            include: {
                                stan_detail_tr: true
                            }
                        }
                    }
                }
            }
        });

        if (!existingUser) {
            return response.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        return response.status(200).json({
            status: true,
            existingUser,
            message: "Located"
        });

    } catch (error) {
        console.error("Error while locating :", error);

        return response.status(500).json({
            status: false,
            message: "Status Internal server error"
        });
    }
};

const tracker = async (request: AuthRequest, response: Response) => {
    try {
        const { Id } = request.user!; // Get user ID from token

        if (!Id) {
            return response.status(401).json({ status: false, message: "Unauthorized: Missing user ID" });
        }

        // Get optional month filter from query (e.g., ?month=4)
        const { transaksiId } = request.params
        const txtId = Number(transaksiId)
        if (isNaN(txtId)) {
            return response.status(401).json({ status: false, message: "invalid ID" });
        }
        // // Convert Id to integer
        // const userId = Id;

        // Check if user exists
        const trs = await prisma.transaksi.findFirst({
            where: {
                Id: txtId,
                siswa_detail_tr: {
                    user_detail_sw: { Id: Id }
                }
            },
            // include: {
            //     detail_transaksi: {
            //         include: { menu_detail_dt: true }
            //     }
            // }
        });

        if (!trs) {
            return response.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        return response.status(200).json({
            status: true,
            data: trs,
            message: "Located"
        });

    } catch (error) {
        console.error("Error while locating :", error);

        return response.status(500).json({
            status: false,
            message: "Status Internal server error"
        });
    }
};


const struk = async (request: AuthRequest, response: Response) => {
    try {
        const { Id } = request.user!; // Get user ID from token

        if (!Id) {
            return response.status(401).json({ status: false, message: "Unauthorized: Missing user ID" });
        }

        // Get optional month filter from query (e.g., ?month=4)
        const { transaksiId } = request.params
        const txtId = Number(transaksiId)
        if (isNaN(txtId)) {
            return response.status(401).json({ status: false, message: "invalid ID" });
        }
        // // Convert Id to integer
        // const userId = Id;

        // Check if user exists
        const ps = await prisma.transaksi.findFirst({
            where: {
                Id: txtId,
                siswa_detail_tr: {
                    user_detail_sw: { Id: Id }
                }
            },
            include: {
                siswa_detail_tr: true,
                detail_transaksi: {
                    include: { menu_detail_dt: true }
                }
            }
        });

        if (!ps) {
            return response.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        return response.status(200).json({
            status: true,
            ps,
            message: "Located"
        });

    } catch (error) {
        console.error("Error while locating :", error);

        return response.status(500).json({
            status: false,
            message: "Status Internal server error"
        });
    }
};


const deleteSiswa = async (request: AuthRequest, response: Response) => {
    try {
        const { Id } = request.user!; // Get user ID from token

        if (!Id) {
            return response.status(401).json({ status: false, message: "Unauthorized: Missing user ID" });
        }

        // Convert Id to integer
        const userId = Id;

        // Check if user exists
        const existingUser = await prisma.users.findUnique({
            where: { Id: userId },
            include: { siswa: true }
        });

        if (!existingUser) {
            return response.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        // Step 1: Delete related `stan` records first
        await prisma.stan.deleteMany({
            where: { id_user: userId }
        });

        // Step 2: Delete related `siswa` records
        await prisma.siswa.deleteMany({
            where: { id_user: userId }
        });

        // Step 3: Now delete the user
        const deletedUser = await prisma.users.delete({
            where: { Id: userId }
        });

        return response.status(200).json({
            status: true,
            deletedUser,
            message: "User, stan, and siswa deleted successfully"
        });

    } catch (error) {
        console.error("Error while deleting :", error);

        return response.status(500).json({
            status: false,
            message: "[DELETE SISWA] Internal server error"
        });
    }
};



export { createSiswa, readSiswa, updateSiswa, deleteSiswa, Siswa, statusPm, tracker, struk }

// const updateSiswa = async (request: AuthRequest, response: Response) => {
//     try {
//         const { Id } = request.user!; // Get user ID from token

//         if (!Id) {
//             return response.status(401).json({ status: false, message: "Unauthorized: Missing user ID" });
//         }

//         const { username, password, role, siswa } = request.body;

//         // Check if the user exists
//         const findSiswa = await prisma.users.findUnique({ where: { Id: Number(Id) } });
//         if (!findSiswa) {
//             return response.status(404).json({ status: false, message: "User not found" });
//         }

//         let siswaData = [];
//         if (siswa) {
//             siswaData = Array.isArray(siswa) ? siswa : [siswa];
//         }

//         // Fetch existing siswa records
//         const existingSiswas = await prisma.siswa.findMany({ where: { id_user: Number(Id) } });
//         const existingSiswaIds = existingSiswas.map((s) => s.Id);

//         // Update user information
//         const updatedUser = await prisma.users.update({
//             where: { Id: Number(Id) },
//             data: {
//                 username: username ?? undefined,
//                 password: password ? md5(password) : undefined,
//                 role: role ?? undefined,
//             },
//         });

//         // Update or create siswa records
//         const updatedSiswaRecords = [];
//         const providedSiswaIds = siswaData.map((s) => Number(s.Id)).filter(Boolean);

//         for (let i = 0; i < siswaData.length; i++) {
//             const s = siswaData[i];
//             const siswaId = s.Id ? Number(s.Id) : null;
//             let filename = null;

//             if (siswaId && existingSiswaIds.includes(siswaId)) {
//                 const existingSiswa = existingSiswas.find((siswa) => siswa.Id === siswaId);
//                 if (!existingSiswa) {
//                     return response.status(404).json({ status: false, message: `Siswa with ID ${siswaId} not found` });
//                 }

//                 filename = existingSiswa.foto;

//                 if (request.file) {
//                     filename = request.file.filename;
//                     if (existingSiswa.foto) {
//                         const oldImagePath = path.join(__dirname, "..", "public", "siswa", existingSiswa.foto);
//                         if (fs.existsSync(oldImagePath)) {
//                             try {
//                                 fs.unlinkSync(oldImagePath);
//                                 console.log(`Deleted old image: ${oldImagePath}`);
//                             } catch (err) {
//                                 console.error("Failed to delete old image:", err);
//                             }
//                         }
//                     }
//                 }

//                 const updatedSiswa = await prisma.siswa.update({
//                     where: { Id: siswaId },
//                     data: {
//                         nama_siswa: s.nama_siswa ?? existingSiswa.nama_siswa,
//                         alamat: s.alamat ?? existingSiswa.alamat,
//                         telp: s.telp ?? existingSiswa.telp,
//                         foto: filename,
//                     },
//                 });

//                 updatedSiswaRecords.push(updatedSiswa);
//             } else {
//                 if (request.file) {
//                     filename = request.file.filename;
//                 }

//                 const newSiswa = await prisma.siswa.create({
//                     data: {
//                         nama_siswa: s.nama_siswa,
//                         alamat: s.alamat,
//                         telp: s.telp,
//                         id_user: Number(Id),
//                         foto: filename || "",
//                     },
//                 });

//                 updatedSiswaRecords.push(newSiswa);
//             }
//         }



//         return response.status(200).json({
//             status: true,
//             data: { updatedUser, updatedSiswaRecords },
//             message: "User and siswa records have been updated successfully",
//         });
//     } catch (error) {
//         console.error("Error updating siswa:", error);
//         return response.status(500).json({
//             status: false,
//             message: `An error occurred: ${error}`,
//         });
//     }
// };

// // Remove siswa records that were not provided in the update request
// const siswaToDelete = existingSiswaIds.filter((id) => !providedSiswaIds.includes(id));
// if (siswaToDelete.length > 0) {
//     await prisma.siswa.deleteMany({ where: { Id: { in: siswaToDelete } } });
// }
