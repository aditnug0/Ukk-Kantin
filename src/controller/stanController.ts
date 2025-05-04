import { stan, siswa } from './../../node_modules/.prisma/client/index.d';
import { PrismaClient, role } from "@prisma/client";
import { Request, Response, request, response } from "express";
import md5 from "md5"
import path from "path";
import fs from "fs"
import { BASE_URL } from "../global";
import { sign } from "jsonwebtoken";
import { Sign } from "crypto";


// Extend the Request type to include `user`
interface AuthRequest extends Request {
    user?: { Id: number; role: string };
}

// create an object from prisma
const prisma = new PrismaClient();

const createStan = async (request: Request, response: Response) => {
    try {
        // Extract fields from request body
        const { username, password, role, stan } = request.body;

        // Validate that stan is an array
        if (!Array.isArray(stan) || stan.length === 0) {
            return response.status(400).json({
                status: false,
                message: "Stan must be a non-empty array."
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
            const stanData = stan.map((item: any) => ({
                nama_stan: item.nama_stan,
                nama_pemilik: item.nama_pemilik,
                Telp: item.Telp,
                id_user: newUser.Id
            }));

            // Create all stan records for this user
            await prisma.stan.createMany({
                data: stanData
            });

            // Optionally, retrieve the created stan records
            const newStans = await prisma.stan.findMany({
                where: { id_user: newUser.Id }
            });

            return { newUser, newStans };
        });

        return response.status(201).json({
            status: true,
            data: result,
            message: "User and Stan created successfully"
        });
    } catch (error: any) {
        console.error("Error creating user with stan:", error);
        return response.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};


const readStan = async (request: Request, response: Response) => {
    try {
        const { search } = request.query
        const allStan = await prisma.stan.findMany({
            where: {
                nama_stan: { contains: search?.toString() || "" }
            }, include: { user_detail_st: true }
        })
        /** contains means search name of siswa based on sent keyword */
        return response.json({
            status: true,
            data: allStan,
            message: `Stan has found`
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


const Stan = async (request: AuthRequest, response: Response) => {
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
            include: {
                stan: {
                    include: { menu: { include: { stan_detail_mu: true } } }
                },
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

const statusPj = async (request: AuthRequest, response: Response) => {
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
                stan: {
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

const income = async (request: AuthRequest, response: Response) => {
    try {

        const userId = request.user?.Id;
        if (!userId) {
            return response.status(401).json({
                status: false,
                message: "Unauthorized: Missing user ID in token",
            });
        }

        const stan = await prisma.stan.findFirst({
            where: { id_user: userId },
            select: { Id: true },
        });
        if (!stan) {
            return response.status(404).json({
                status: false,
                message: "Stan not found for this user",
            });
        }

        // Get optional month filter from query (e.g., ?month=4)
        const Rmonth = request.query.month as string | undefined;
        let datefilter: { gte: Date; lt: Date } | undefined
        if (Rmonth) {
            const m = parseInt(Rmonth, 10);
            if (isNaN(m) || m < 1 || m > 12) {
                return response.status(400).json({
                    status: false,
                    message: "Invalid month"
                });
            }
            const year = new Date().getFullYear();
            datefilter = {
                gte: new Date(year, m - 1, 1),
                lt: new Date(year, m, 1),
            };
        }

        const dapat = await prisma.detail_transaksi.aggregate({
            where: {
                transaksi_detail_dt: {
                    id_stan: stan.Id,
                    ...(datefilter ? { tanggal: datefilter } : {}),
                },
            },
            _sum: { harga_beli: true },
        });

        const total = dapat._sum.harga_beli ?? 0;

        return response.status(200).json({
            status: true,
            month: Rmonth ?? "all",
            stanId: stan.Id,
            total,
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

const updateStan = async (request: AuthRequest, response: Response) => {
    try {
        const { Id: userId } = request.user!;

        if (!userId) {
            return response.status(401).json({ status: false, message: "Unauthorized: Missing user ID" });
        }

        const { username, password, role, stan } = request.body;

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

        const stanData = Array.isArray(stan) ? stan[0] : stan;

        // Get existing siswa record linked to user
        const existingStan = await prisma.stan.findFirst({
            where: { id_user: userId },
        });

        if (!existingStan) {
            return response.status(404).json({ status: false, message: "Stan data not found" });
        }

        // Update stan data
        const updatedStan = await prisma.stan.update({
            where: { Id: existingStan.Id },
            data: {
                nama_stan: stanData?.nama_stan ?? existingStan.nama_stan,
                nama_pemilik: stanData?.nama_pemilik ?? existingStan.nama_pemilik,
                Telp: stanData?.Telp ?? existingStan.Telp,
                // foto: filename,
            },
        });

        return response.status(200).json({
            status: true,
            message: "User and Stan data updated successfully",
            data: {
                updatedUser,
                updatedStan,
            },
        });
    } catch (error) {
        console.error("Error updating stan:", error);
        return response.status(500).json({
            status: false,
            message: `An error occurred: ${error}`,
        });
    }
};



const deleteStan = async (request: AuthRequest, response: Response) => {
    try {
        const { Id } = request.user!; // Get user ID from token

        if (!Id) {
            return response.status(401).json({ status: false, message: "Unauthorized: Missing user ID" });
        }

        // Convert Id to integer
        const userId = Number(Id);

        // Check if user exists
        const existingUser = await prisma.users.findUnique({
            where: { Id: userId },
            include: { siswa: true, stan: true }
        });

        if (!existingUser) {
            return response.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        await prisma.$transaction(async (prisma) => {
            // Get IDs of all stans related to the user
            const stanIds = existingUser.stan.map((s) => s.Id);

            if (stanIds.length > 0) {
                // Step 1: Find all `transaksi` linked to `stan`
                const transaksiToDelete = await prisma.transaksi.findMany({
                    where: { id_stan: { in: stanIds } },
                    select: { Id: true }
                });

                const transaksiIds = transaksiToDelete.map((t) => t.Id);

                if (transaksiIds.length > 0) {
                    // Step 2: Delete `detail_transaksi` first
                    await prisma.detail_transaksi.deleteMany({
                        where: { id_transaksi: { in: transaksiIds } }
                    });

                    // Step 3: Delete `transaksi`
                    await prisma.transaksi.deleteMany({
                        where: { Id: { in: transaksiIds } }
                    });
                }

                // Step 4: Delete `stan`
                await prisma.stan.deleteMany({
                    where: { id_user: userId }
                });
            }


            // Step 6: Now delete the user
            await prisma.users.delete({
                where: { Id: userId }
            });
        });

        return response.status(200).json({
            status: true,
            message: "User, stan deleted successfully"
        });

    } catch (error) {
        console.error("Error while deleting :", error);

        return response.status(500).json({
            status: false,
            message: "[DELETE STAN] Internal server error"
        });
    }
};


const updatePlg = async (request: Request & { user?: { Id: number } }, response: Response) => {
    try {
        // 1. Try params
        let userId: number | undefined = request.params.Id
            ? Number(request.params.Id)
            : undefined;

        // 3. Fallback to token (if you still want it)
        if (!userId && request.user?.Id) {
            userId = request.user.Id;
        }

        if (!userId) {
            return response
                .status(400)
                .json({ status: false, message: "User ID is required" });
        }

        // Check user exists
        const existingUser = await prisma.users.findUnique({
            where: { Id: userId },
        });
        if (!existingUser) {
            return response
                .status(404)
                .json({ status: false, message: "User not found" });
        }

        const { username, password, role, siswa } = request.body;

        // Update users table
        const updatedUser = await prisma.users.update({
            where: { Id: userId },
            data: {
                username: username ?? undefined,
                password: password ? md5(password) : undefined,
                role: role ?? undefined,
            },
        });

        // Find the existing siswa row
        const existingSiswa = await prisma.siswa.findFirst({
            where: { id_user: userId },
        });
        if (!existingSiswa) {
            return response
                .status(404)
                .json({ status: false, message: "Siswa data not found" });
        }

        // Handle single- or array‑style payload
        const siswaData = Array.isArray(siswa) ? siswa[0] : siswa;

        let filename = existingSiswa.foto;
        if (request.file) {
            filename = request.file.filename;
            // delete old file...
        }

        // Update siswa table
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
            data: { updatedUser, updatedSiswa },
        });
    } catch (error) {
        console.error("Error updating siswa:", error);
        return response.status(500).json({
            status: false,
            message: `An error occurred: ${error}`,
        });
    }
};

const deletePlg = async (request: Request & { user?: { Id: number } }, response: Response) => {

    try {
        // 1. Try params
        let userId: number | undefined = request.params.Id
            ? Number(request.params.Id)
            : undefined;

        // 3. Fallback to token (if you still want it)
        if (!userId && request.user?.Id) {
            userId = request.user.Id;
        }

        if (!userId) {
            return response
                .status(400)
                .json({ status: false, message: "User ID is required" });
        }

        // Check user exists
        const existingUser = await prisma.users.findUnique({
            where: { Id: userId },
        });
        if (!existingUser) {
            return response
                .status(404)
                .json({ status: false, message: "User not found" });
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


export { createStan, readStan, updateStan, deleteStan, Stan, statusPj, updatePlg, deletePlg, income }
