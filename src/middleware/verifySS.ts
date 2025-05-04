import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

/** create schema when add new egg's data, all of fileds have to be required */

const detailSchemaStan = Joi.object({
    nama_stan: Joi.string().optional(),
    nama_pemilik: Joi.string().optional(),
    Telp: Joi.number().min(1).optional(),
    // id_user: Joi.number().min(1).optional(),
})

const detailSchemaSiswa = Joi.object({
    nama_siswa: Joi.string().optional(),
    alamat: Joi.string().optional(),
    telp: Joi.number().min(1).optional(),
    foto: Joi.allow().optional(),
    // id_user: Joi.number().min(1).optional(),
})
// /** create schema when add new pack's data, all of fileds have to be required */
// const addDataSchemaStan = Joi.object({
//     name: Joi.string().required(),
//     id_stan: Joi.number().min(1).required(),
//     id_siswa: Joi.number().min(1).required(),
//     status: Joi.string().optional(),
// })

const addDataSchemaSiswa = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().optional(),
    siswa: Joi.array().items(detailSchemaSiswa).min(1).required()

})

/** create schema when edit egg's data, all of fileds allow and optional to sent in request */
const updateDataSchemaSiswa = Joi.object({
    username: Joi.string().optional(),
    password: Joi.string().optional(),
    role: Joi.string().optional(),
    siswa: Joi.array().items(detailSchemaSiswa).optional()


})

const addDataSchemaStan = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().optional(),
    stan: Joi.array().items(detailSchemaStan).min(1).required()

})

const updateDataSchemaStan = Joi.object({
    username: Joi.string().optional(),
    password: Joi.string().optional(),
    role: Joi.string().optional(),
    stan: Joi.array().items(detailSchemaStan).optional()
})

export const verifyAddSiswa = (request: Request, response: Response, next: NextFunction) => {
    /** validate a request body and grab error if exist */
    const { error } = addDataSchemaSiswa.validate(request.body, { abortEarly: false })

    if (error) {
        /** if there is an error, then give a response like this */
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const verifyEditSiswa = (request: Request, response: Response, next: NextFunction) => {
    /** validate a request body and grab error if exist */
    const { error } = updateDataSchemaSiswa.validate(request.body, { abortEarly: false })

    if (error) {
        /** if there is an error, then give a response like this */
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const verifyAddStan = (request: Request, response: Response, next: NextFunction) => {
    /** validate a request body and grab error if exist */
    const { error } = addDataSchemaStan.validate(request.body, { abortEarly: false })

    if (error) {
        /** if there is an error, then give a response like this */
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const verifyEditStan = (request: Request, response: Response, next: NextFunction) => {
    /** validate a request body and grab error if exist */
    const { error } = updateDataSchemaStan.validate(request.body, { abortEarly: false })

    if (error) {
        /** if there is an error, then give a response like this */
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

