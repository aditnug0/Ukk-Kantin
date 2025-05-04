import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

/** create schema when add new egg's data, all of fileds have to be required */
const addDataSchemaMenu = Joi.object({
    nama_makanan: Joi.string().required(),
    harga: Joi.number().min(1).required(),
    jenis: Joi.string().required(),
    foto: Joi.allow().optional(),
    deskripsi: Joi.string().required(),
    // id_stan: Joi.number().min(1).required(),
})

/** create schema when edit egg's data, all of fileds allow and optional to sent in request */
const updateDataSchemaMenu = Joi.object({
    nama_makanan: Joi.string().optional(),
    harga: Joi.number().min(1).optional(),
    jenis: Joi.string().optional(),
    foto: Joi.allow().optional(),
    deskripsi: Joi.string().optional(),
    // id_stan: Joi.number().min(1).optional(),
})


const detailSchemaDiskon = Joi.object({
    // nama_stan: Joi.string().optional(),
    // nama_pemilik: Joi.string().optional(),
    id_menu: Joi.number().min(1).optional(),
    // id_user: Joi.number().min(1).optional(),
})

const addDataSchemaDiskon = Joi.object({
    // id_stan: Joi.number().min(1).required(),
    nama_diskon: Joi.string().required(),
    persentase_diskon: Joi.number().min(1).required(),
    tanggal_awal: Joi.date().required(),
    tanggal_akhir: Joi.date().required(),
    menu_diskon: Joi.array().items(detailSchemaDiskon).min(1).required()
})

const updateDataSchemaDiskon = Joi.object({
    // id_stan: Joi.number().min(1).optional(),
    nama_diskon: Joi.string().optional(),
    persentase_diskon: Joi.number().min(1).optional(),
    tanggal_awal: Joi.date().optional(),
    tanggal_akhir: Joi.date().optional(),
    menu_diskon: Joi.array().items(detailSchemaDiskon).min(1).optional()
})

export const verifyAddMenu = (request: Request, response: Response, next: NextFunction) => {
    /** validate a request body and grab error if exist */
    const { error } = addDataSchemaMenu.validate(request.body, { abortEarly: false })

    if (error) {
        /** if there is an error, then give a response like this */
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const verifyEditMenu = (request: Request, response: Response, next: NextFunction) => {
    /** validate a request body and grab error if exist */
    const { error } = updateDataSchemaMenu.validate(request.body, { abortEarly: false })

    if (error) {
        /** if there is an error, then give a response like this */
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const verifyAddDiskon = (request: Request, response: Response, next: NextFunction) => {
    /** validate a request body and grab error if exist */
    const { error } = addDataSchemaDiskon.validate(request.body, { abortEarly: false })

    if (error) {
        /** if there is an error, then give a response like this */
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const verifyEditDiskon = (request: Request, response: Response, next: NextFunction) => {
    /** validate a request body and grab error if exist */
    const { error } = updateDataSchemaDiskon.validate(request.body, { abortEarly: false })

    if (error) {
        /** if there is an error, then give a response like this */
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}