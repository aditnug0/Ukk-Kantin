import { PrismaClient, role } from "@prisma/client";
import { Request, Response, request, response } from "express";
import md5 from "md5"
import { sign } from "jsonwebtoken";
import { Sign } from "crypto";

// create an object from prisma
const prisma = new PrismaClient();

// create a function to "create" new user
// asyncronous = fungsi yang berjalan secara pararel
const createUser = async (request: Request, response: Response) => {
    try {
        // read a request from body
        const username = request.body.username;
        const password = md5(request.body.password);
        const role = request.body.role;

        //insert to user table using prisma
        const newData = await prisma.users.create({
            data: {
                username: username,
                password: password,
                role: role
            }
        });
        return response.status(200).json({
            status: true,
            message: `User data has been created`,
            data: newData,
        });
    } catch (error) {
        return response.status(500).json({
            status: false,
            message: error,
        });
    }
};

const readUser = async (request: Request, response: Response) => {
    try {
        const { search } = request.query
        const allStan = await prisma.users.findMany({
            where: {
                username: { contains: search?.toString() || "" }
            }, include: { siswa: true, stan: true }
        })
        /** contains means search name of siswa based on sent keyword */
        return response.json({
            status: true,
            data: allStan,
            message: `Users has found`
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

// // create a function to READ user
// const readUser = async (request: Request, response: Response) => {
//     try {
//         // pagination
//         const page = Number(request.query.page) || 1;
//         const qty = Number(request.query.qty) || 5;
//         // searching
//         const keyword = request.query.keyword?.toString() || "";

//         // await untuk memebri delay pada sistem asyncronous sehingga berjalan
//         // seperti syncronous dan menunggu sistem sebelumnya
//         const userData = await prisma.users.findMany({
//             //untuk mendefinisikan jml data yang diambil
//             take: qty,
//             skip: (page - 1) * qty,
//             where: {
//                 OR: [
//                     { username: { contains: keyword } },
//                     // { role: { contains:keyword } },
//                 ]
//             }, include: { siswa: true, stan: true },
//             orderBy: { Id: "asc" }
//         });
//         return response.status(200).json({
//             status: true,
//             message: `User data has been loaded`,
//             data: userData,
//         });
//     } catch (error) {
//         return response.status(500).json({
//             status: false,
//             message: error,
//         });
//     }
// };

// function for update user
const updateUser = async (request: Request, response: Response) => {

    try {
        // read user id that sent from url
        const Id = request.params.Id
        // read data perubahan
        const username = request.body.username
        const password = md5(request.body.password)
        // make sure that data has existed
        const findUser = await prisma.users.findFirst({
            where: { Id: Number(Id) }
        })

        if (!findUser) {
            return response.status(400).json({
                status: false,
                message: `User data not found`
            })
        }

        const dataUser = await prisma.users.update({
            where: { Id: Number(Id) },
            data: {
                username: username || findUser.username,
                password: password || findUser.password
            }
        })

        return response.status(200).json({
            status: true,
            message: `Data has been updated`,
            data: dataUser
        })

    } catch (error) {
        return response.status(500).json({
            status: false,
            message: error,
        });
    }
}

// create a function to delete user
const deleteUser = async (request: Request, response: Response) => {
    try {

        // get user id from url
        const Id = request.params.Id

        // make sure that user is exist
        const findUsers = await prisma.users.findFirst({
            where: { Id: Number(Id) }
        })

        if (!findUsers) {
            return response.status(400).json({
                status: false,
                message: `Data not found`
            })
        }

        // execute for delete user
        const dataUser = await prisma.users.delete({
            where: { Id: Number(Id) }
        })

        // return response
        return response.status(200).json({
            status: true,
            message: `User data has been deleted `
        })

    } catch (error) {
        return response.status(500).json({
            status: false,
            message: error,
        });
    }
}


export { createUser, readUser, updateUser, deleteUser }
