import { error } from "console";
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import md5 from "md5"
import { PrismaClient, role } from "@prisma/client";
import { sign } from "jsonwebtoken";
import { Sign } from "crypto";



// create an object from prisma
const prisma = new PrismaClient();

// Extend the Request type to include `user`
interface AuthRequest extends Request {
    user?: { Id: number; role: string };
}

// const verifyAdmin = async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         // membaca data header request
//         const header = request.headers.authorization
//         // membaca data token yang dikirimkan 
//         const token = header?.split(" ")[1] || ''
//         const secretkey = 'admin🤓'
//         // proses verifikasi token 
//         verify(token, secretkey, error => {
//             if (error) {
//                 return response.status(401).json({
//                     status: false,
//                     message: 'Unauthorized'
//                 })
//             }
//             next()
//         })

//     } catch (error) {
//         return response.status(500).json({
//             status: false,
//             message: error,
//         });
//     }
// }



const verifyUser = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const header = request.headers.authorization;
        if (!header) {
            return response.status(401).json({ status: false, message: "Unauthorized: No token provided" });
        }

        const token = header.split(" ")[1]; // Extract token from "Bearer <token>"
        const secretKey = "user☝️"; // Adjust if needed

        verify(token, secretKey, (error, decoded: any) => {
            if (error) {
                return response.status(401).json({ status: false, message: "Unauthorized: Invalid token" });
            }

            request.user = decoded; // Attach decoded data to `request.user`
            next();
        });

    } catch (error) {
        return response.status(500).json({ status: false, message: "Internal server error" });
    }
};

const verifyAdmin = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const header = request.headers.authorization;
        if (!header) {
            return response.status(401).json({ status: false, message: "Unauthorized: No token provided" });
        }

        const token = header.split(" ")[1]; // Extract token from "Bearer <token>"
        const secretKey = "admin🤓"; // Adjust if needed

        verify(token, secretKey, (error, decoded: any) => {
            if (error) {
                return response.status(401).json({ status: false, message: "Unauthorized: Invalid token" });
            }

            request.user = decoded; // Attach decoded data to `request.user`
            next();
        });

    } catch (error) {
        return response.status(500).json({ status: false, message: "Internal server error" });
    }
};







const verifyAuth = async (request: Request, response: Response, next: NextFunction) => {
    let userAllowed = false;
    let adminAllowed = false;

    // Run verifyUser and check if it allows access
    await new Promise((resolve) => {
        verifyUser(request, response, (err?: any) => {
            if (!err) userAllowed = true;
            resolve(null);
        });
    });

    // Run verifyAdmin and check if it allows access
    await new Promise((resolve) => {
        verifyAdmin(request, response, (err?: any) => {
            if (!err) adminAllowed = true;
            resolve(null);
        });
    });

    // If either is allowed, proceed to next middleware
    if (userAllowed || adminAllowed) {
        return next();
    } else {
        return response.status(403).json({ message: "Access denied" });
    }
};

const loginUser = async (request: Request, response: Response) => {
    try {
        const { username, password } = request.body;
        const hashedPassword = md5(password);

        // Find user with matching credentials
        const user = await prisma.users.findFirst({
            where: { username: username, password: hashedPassword },
        });

        if (!user) {
            return response.status(401).json({
                status: false,
                message: "Invalid username or password",
            });
        }

        // Check the user's role
        if (user.role === "siswa") {
            // Handle siswa-specific logic if needed
            return response.status(200).json({
                status: true,
                message: "Login successful as Siswa",
                role: user.role,
                token: sign({ Id: user.Id, role: user.role }, "user☝️"),
            });
        } else if (user.role === "admin_stan") {
            // Handle admin_stan-specific logic if needed
            return response.status(200).json({
                status: true,
                message: "Login successful as Admin Stan",
                role: user.role,
                token: sign({ Id: user.Id, role: user.role }, "admin🤓"),
            });
        } else {
            return response.status(403).json({
                status: false,
                message: "Unauthorized role",
            });
        }
    } catch (error: any) {
        return response.status(500).json({
            status: false,
            message: error.message || "An error occurred",
        });
    }
};

export { verifyAdmin, verifyUser, verifyAuth, loginUser }


// const verifyUser = async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         // membaca data header request
//         const header = request.headers.authorization
//         // membaca data token yang dikirimkan
//         const token = header?.split(" ")[1] || ''
//         const secretkey = 'user☝️'
//         // proses verifikasi token
//         verify(token, secretkey, error => {
//             if (error) {
//                 return response.status(401).json({
//                     status: false,
//                     message: 'Unauthorized'
//                 })
//             }
//             next()
//         })

//     } catch (error) {
//         return response.status(500).json({
//             status: false,
//             message: error,
//         });
//     }
// }

