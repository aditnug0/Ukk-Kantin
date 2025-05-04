import { PrismaClient, status } from "@prisma/client";
import { Request, Response, request, response } from "express";

// Initialize Prisma client
const prisma = new PrismaClient();

// Define a custom request type that includes `user`
interface AuthRequest extends Request {
    user?: { Id: number; role: string };
}

const createTransaksi = async (request: Request, response: Response) => {
    try {
        const { name, id_stan, id_siswa, status: transaksiStatus, detail_transaksi } = request.body;

        // Validate the status input
        if (transaksiStatus && !Object.values(status).includes(transaksiStatus)) {
            return response.status(400).json({
                status: false,
                message: "Invalid status value",
            });
        }

        // Fetch menus with potential discounts
        const menus = await prisma.menu.findMany({
            include: {
                menu_diskon: {
                    include: {
                        diskon_detail_md: true, // Get discount details
                    },
                },
            },
        });

        // Create a map of product prices and discounts
        const menuMap: { [key: number]: { harga: number; diskon?: number } } = {};
        menus.forEach(menu => {
            let hargaFinal = menu.harga;

            // Check if menu has a valid discount
            const activeDiscount = menu.menu_diskon.find(md => {
                const diskon = md.diskon_detail_md;
                const now = new Date();
                return diskon && now >= diskon.tanggal_awal && now <= diskon.tanggal_akhir;
            });

            if (activeDiscount) {
                const diskonPersentase = activeDiscount.diskon_detail_md.persentase_diskon;
                hargaFinal = hargaFinal - (hargaFinal * (diskonPersentase / 100));
            }

            menuMap[menu.Id] = { harga: hargaFinal };
        });

        // Prepare order details with calculated prices
        const orderDetails = detail_transaksi.map((detail: any) => {
            const menu = menuMap[detail.id_menu];

            if (!menu) {
                throw new Error(`Menu with ID ${detail.id_menu} not found.`);
            }

            return {
                id_menu: detail.id_menu,
                qty: detail.qty,
                harga_beli: detail.qty * menu.harga, // Apply discounted price if applicable
            };
        });


        // Create transaction with default or provided status
        const newTransaksi = await prisma.transaksi.create({
            data: {
                name,
                id_stan,
                id_siswa,
                status: transaksiStatus || "belum_dimasak", // FIXED: Default status handling
                detail_transaksi: {
                    createMany: {
                        data: orderDetails,
                    },
                },
            },
            include: {
                detail_transaksi: true,
            },
        });

        return response.status(201).json({
            status: true,
            data: newTransaksi,
            message: "Transaksi created successfully",
        });
    } catch (error) {
        console.error("Error creating transaction:", error);
        return response.status(500).json({
            status: false,
            message: "[POST TRANSAKSI] Internal server error",
        });
    }
};



// create a function to READ transaksi

const readTransaksi = async (request: Request, response: Response) => {

    try {
        const { search } = request.query
        const Transaksi = await prisma.transaksi.findMany({
            where: {
                name: { contains: search?.toString() || "" }
            },
            include: {
                siswa_detail_tr: true,
                detail_transaksi: {
                    include: {
                        menu_detail_dt: true
                    }
                }
            }
        })

        if (Transaksi.length === 0) {
            return response.status(404).json({
                status: false,
                message: 'Order list not found'
            });
        }

        return response.status(200).json({
            status: true,
            data: Transaksi,
            message: 'Order list found'
        });
    } catch (error) {
        console.error('Error getting order list:', error);
        return response.status(500).json({
            status: false,
            message: '[GET TRANSACTION ID] Internal server error'
        });
    }
};


const printStruk = async (request: Request, response: Response) => {

    try {
        const { Id } = request.params;

        if (!Id) {
            return response.status(400).json({
                status: false,
                message: "ID required"
            });
        }

        const struk = await prisma.transaksi.findFirst({
            include: {
                siswa_detail_tr: true,
                detail_transaksi: {
                    include: {
                        menu_detail_dt: true
                    }
                }
            }
        })

        return response.status(200).json({
            status: true,
            struk,
            message: 'Transaksi loaded successfully'
        });
    } catch (error) {
        console.error('Error deleting order list:', error);
        return response.status(500).json({
            status: false,
            message: '[DELETE TRANSAKSI] Internal server error'
        });
    }
}


const updateTransaksi = async (request: Request, response: Response) => {
    try {
        const { Id } = request.params;
        const { name, id_stan, id_siswa, status: transaksiStatus, detail_transaksi } = request.body;

        if (!Id) {
            return response.status(400).json({
                status: false,
                message: "ID required"
            });
        }

        // Find the transaksi first
        const findOrder = await prisma.transaksi.findFirst({
            where: { Id: Number(Id) },
            include: { detail_transaksi: true } // Include existing details
        });

        if (!findOrder) {
            return response.status(404).json({
                status: false,
                message: "Order not found"
            });
        }

        // Fetch product prices along with discounts
        const menuIds = detail_transaksi.map((detail: any) => detail.id_menu);
        const menus = await prisma.menu.findMany({
            where: { Id: { in: menuIds } },
            include: {
                menu_diskon: {
                    include: { diskon_detail_md: true }, // Fetch related discount details
                },
            },
        });

        // Create a price map with discount calculation
        const menuMap: { [key: number]: number } = {};
        menus.forEach(menu => {
            let hargaFinal = menu.harga;

            // Check if there's an active discount
            const activeDiscount = menu.menu_diskon.find(md => {
                const diskon = md.diskon_detail_md;
                const now = new Date();
                return diskon && now >= diskon.tanggal_awal && now <= diskon.tanggal_akhir;
            });

            if (activeDiscount) {
                const diskonPersentase = activeDiscount.diskon_detail_md.persentase_diskon;
                hargaFinal = hargaFinal - (hargaFinal * (diskonPersentase / 100));
            }

            menuMap[menu.Id] = hargaFinal;
        });

        // Process details (separate into existing, new, and to-be-deleted)
        const existingDetails = [];
        const newDetails = [];
        const updatedDetailIds = detail_transaksi.map((detail: any) => detail.Id).filter(Boolean);

        for (const detail of detail_transaksi) {
            const menuPrice = menuMap[detail.id_menu];

            if (!menuPrice) {
                return response.status(400).json({
                    status: false,
                    message: `Menu ID ${detail.id_menu} not found`
                });
            }

            if (detail.Id) {
                existingDetails.push({
                    Id: detail.Id,
                    id_menu: detail.id_menu,
                    qty: detail.qty,
                    harga_beli: detail.qty * menuPrice // Apply discount if available
                });
            } else {
                newDetails.push({
                    id_transaksi: Number(Id),
                    id_menu: detail.id_menu,
                    qty: detail.qty,
                    harga_beli: detail.qty * menuPrice // Apply discount if available
                });
            }
        }

        // Find details that should be deleted
        const detailsToDelete = findOrder.detail_transaksi
            .filter(d => !updatedDetailIds.includes(d.Id))
            .map(d => d.Id);

        // Start transaction
        const updatedTransaksi = await prisma.$transaction([
            // Update transaksi itself
            prisma.transaksi.update({
                where: { Id: Number(Id) },
                data: {
                    name: name || findOrder.name,
                    id_stan: id_stan || findOrder.id_stan,
                    id_siswa: id_siswa || findOrder.id_siswa,
                    status: transaksiStatus || findOrder.status
                }
            }),

            // Update existing detail_transaksi records
            ...existingDetails.map(detail =>
                prisma.detail_transaksi.update({
                    where: { Id: detail.Id },
                    data: {
                        id_menu: detail.id_menu,
                        qty: detail.qty,
                        harga_beli: detail.harga_beli // Use discounted price
                    }
                })
            ),

            // Insert new detail_transaksi records
            prisma.detail_transaksi.createMany({
                data: newDetails
            }),

            // Delete removed detail_transaksi records
            prisma.detail_transaksi.deleteMany({
                where: { Id: { in: detailsToDelete } }
            })
        ]);

        return response.status(200).json({
            status: true,
            data: updatedTransaksi[0], // First transaction result is the updated transaksi
            message: "Order has been updated"
        });

    } catch (error) {
        console.error("Error updating order list:", error);
        return response.status(500).json({
            status: false,
            message: "[PUT TRANSAKSI] Internal server error"
        });
    }
};





const deleteTransaksi = async (request: AuthRequest, response: Response) => {
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

        if (!Id) {
            return response.status(400).json({
                status: false,
                message: "ID required"
            });
        }

        // Convert Id to integer
        const transaksiId = parseInt(Id);

        // Check if transaksi exists
        const existingTransaksi = await prisma.transaksi.findUnique({
            where: { Id: transaksiId, id_stan: existingStan.Id },
            include: { detail_transaksi: true }
        });

        if (!existingTransaksi) {
            return response.status(404).json({
                status: false,
                message: "Transaksi not found"
            });
        }

        // Delete related detail_transaksi first
        await prisma.detail_transaksi.deleteMany({
            where: { id_transaksi: transaksiId }
        });

        // Now delete transaksi
        const deletedTransaksi = await prisma.transaksi.delete({
            where: { Id: transaksiId }
        });

        return response.status(200).json({
            status: true,
            deletedTransaksi,
            message: "Transaksi deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting transaksi:", error);

        return response.status(500).json({
            status: false,
            message: "[DELETE TRANSAKSI] Internal server error"
        });
    }
};

export { createTransaksi, readTransaksi, updateTransaksi, deleteTransaksi, printStruk };

