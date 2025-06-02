export const validate = (schema, target = "body") => {
    return (req, res, next) => {
        const data = req[target] // Use req.body, req.params, etc. based on target
        const { error } = schema.validate(data, { abortEarly: false })
        if (error) {
            return res.status(400).json({
                error: true,
                message: error.details.map((detail) => detail.message).join(", "),
            })
        }
        next()
    }
}
