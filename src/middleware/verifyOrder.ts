import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'


const detailSchema = Joi.object({
    qty: Joi.number().min(1).required(),
    harga_beli: Joi.number().min(1).optional(),
    id_menu: Joi.number().min(1).optional()
})
/** create schema when add new pack's data, all of fileds have to be required */
const addDataSchema = Joi.object({
    name: Joi.string().required(),
    id_stan: Joi.number().min(1).required(),
    id_siswa: Joi.number().min(1).required(),
    status: Joi.string().optional(),
    detail_transaksi: Joi.array().items(detailSchema).min(1).required()
})


/** create schema when edit pack's data, all of fileds allow and optional to sent in request */
const updateDataSchema = Joi.object({
    name: Joi.string().optional(),
    id_stan: Joi.number().min(1).optional(),
    id_siswa: Joi.number().min(1).optional(),
    status: Joi.string().optional(),
    detail_transaksi: Joi.array().items(detailSchema).min(1).optional()

})


export const verifyAddOrder = (request: Request, response: Response, next: NextFunction) => {
    /** validate a request body and grab error if exist */
    const { error } = addDataSchema.validate(request.body, { abortEarly: false })

    if (error) {
        /** if there is an error, then give a response like this */
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const verifyEditOrder = (request: Request, response: Response, next: NextFunction) => {
    /** validate a request body and grab error if exist */
    const { error } = updateDataSchema.validate(request.body, { abortEarly: false })

    if (error) {
        /** if there is an error, then give a response like this */
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}