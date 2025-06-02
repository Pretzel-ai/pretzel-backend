import Joi from "joi"

export const registerSchema = Joi.object({
    name: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string().email().required(),
})

export const verifyUserSchema = Joi.object({
    email: Joi.string().email(),
    _id: Joi.string(),
    password: Joi.string().when("email", { is: Joi.exist(), then: Joi.required() }),
    authToken: Joi.string().when("_id", { is: Joi.exist(), then: Joi.required() }),
}).or("email", "_id")

export const uploadFileSchema = Joi.object({
    owner: Joi.string().optional(),
    authToken: Joi.string().optional(),
    name: Joi.string().required(),
    size: Joi.number().required(),
    type: Joi.string().required(),
    lastModified: Joi.number().required(),
    created: Joi.number().required(),
    content: Joi.string().required(),
})

export const getFileSchema = Joi.object({
    fileId: Joi.string().required(),
})

export const updateFileSchema = Joi.object({
    fileId: Joi.alternatives().try(
        Joi.string().required(),
        Joi.number()
            .required()
            .custom((value, helpers) => String(value))
    ),
    content: Joi.string().required(),
})

export const deleteFileSchema = Joi.object({
    fileId: Joi.string().required(),
    owner: Joi.string().required(),
    authToken: Joi.string().required(),
})

export const processDocxSchema = Joi.object({
    content: Joi.string().required(),
})

export const processPDFSchema = Joi.object({
    url: Joi.string().uri().required(),
})
