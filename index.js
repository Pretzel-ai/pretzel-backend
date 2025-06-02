import express from "express"
import { createServer } from "http"
import compression from "compression"
import cors from "cors"
import path from "path"
import dotenv from "dotenv"
import { MongoClient, ServerApiVersion } from "mongodb"
import fetch from "node-fetch"
import { createRequire } from "module"
const require = createRequire(import.meta.url)
const pdf = require("pdf-parse")
import bcrypt from "bcrypt"
import mammoth from "mammoth"

const app = express()
const __dirname = path.resolve()
const server = createServer(app)
dotenv.config()

const PORT = process.env.PORT || 8000
const uri = `mongodb+srv://${process.env["DB_USERNAME"]}:${process.env["DB_PASSWORD"]}@visioneerlist.${process.env["DB_KEY"]}.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
})

const CRUD = ({ GET, FROM }) => {
    const access = (client, collectionName, db) => client.db(db).collection(collectionName)
    return {
        getAll: async (client) => {
            let result = await access(client, GET, FROM).find({}).toArray()
            return result.reduce((obj, item) => {
                obj[item._id] = item
                return obj
            }, {})
        },
        get: async (client, data) => {
            return await access(client, GET, FROM).findOne({ _id: data })
        },
        insert: async (client, data) => {
            return await access(client, GET, FROM).insertOne(data)
        },
        update: async (client, ID, data) => {
            return await access(client, GET, FROM).updateOne({ _id: ID }, { $set: data })
        },
        delete: async (client, data) => {
            return await access(client, GET, FROM).deleteOne({ _id: data })
        },
    }
}

async function run() {
    await client
        .connect()
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => console.log(err))
    app.use(
        "/utils/",
        express.json({ limit: "200mb" }),
        express.urlencoded({ extended: true, limit: "200mb" })
    )
    app.use(cors())
    app.use(compression())
    app.use(express.json({ limit: "200mb" }))
    app.use(express.urlencoded({ extended: true, limit: "200mb" }))

    app.get("/", (req, res) => res.send("Hello World"))

    app.post("/register", async (req, res) => {
        const { name, password, email } = req.body
        const id = String(Date.now())
        const hash = await bcrypt.hash(password, 10)

        if (!name || !password || !email) {
            return res.status(400).json({ error: true, message: "Missing required fields" })
        }

        try {
            const user = await client.db("pretzel").collection("users").findOne({ email: email })
            if (user)
                return res
                    .status(409)
                    .json({ error: true, message: "A user has already registered with this email" })

            await CRUD({ GET: "users", FROM: "pretzel" }).insert(client, {
                _id: id,
                name,
                email,
                password: hash,
            })

            // await CRUD({ GET: "organizations", FROM: "pretzel" }).insert(client, {
            //     _id: String(Date.now()),
            //     name: "Guest Organization",
            //     created: Date.now(),
            //     owners: [name],
            // })

            res.json({ name, email, _id: id, authToken: hash, success: true })
        } catch (err) {
            res.status(500).json({ error: true, message: err.message })
        }
    })

    app.post("/verify-user", async (req, res) => {
        const { email, _id, password, authToken } = req.body

        try {
            const user = await client
                .db("pretzel")
                .collection("users")
                .findOne({ [_id ? "_id" : "email"]: _id || email })

            if (email) {
                if (!user || !(await bcrypt.compare(password, user.password))) {
                    return res
                        .status(401)
                        .json({ error: true, message: "Unable to authenticate user" })
                }

                res.json({ ...user, success: true, authToken: user.password })
            } else if (_id) {
                if (!user || authToken !== user.password) {
                    return res
                        .status(401)
                        .json({ error: true, message: "Unable to authenticate user" })
                }

                res.json({ ...user, success: true, authToken: user.password })
            }
        } catch (err) {
            res.status(500).json({ error: true, message: err.message })
        }
    })

    app.post("/upload-file", async (req, res) => {
        const { owner, authToken, name, size, type, lastModified, created, content } = req.body
        if (!name || !size || !type || !lastModified || !created || !content) {
            return res.status(400).json({ error: true, message: "Missing required fields" })
        }

        const fileId = Date.now() + 1
        await CRUD({ GET: "files", FROM: "pretzel" }).insert(client, {
            _id: String(fileId),
            content,
        })

        if (!owner || !authToken) {
            try {
                const id = String(Date.now())
                const hash = bcrypt.hashSync("guest", 10)

                await CRUD({ GET: "users", FROM: "pretzel" }).insert(client, {
                    _id: id,
                    name: "Guest",
                    email: "guest",
                    password: hash,
                    files: [{ name, size, type, lastModified, created, fileId }],
                })

                res.json({ _id: id, authToken: hash, fileId, success: true })
            } catch (err) {
                res.status(500).json({ error: true, message: err.message })
            }
            return
        }

        try {
            const user = await client.db("pretzel").collection("users").findOne({ _id: owner })
            if (!user || authToken !== user.password) {
                return res.status(401).json({ error: true, message: "Unable to authenticate user" })
            }

            await CRUD({ GET: "users", FROM: "pretzel" }).update(client, owner, {
                files: [
                    ...(user?.files || []),
                    { name, size, type, lastModified, created, fileId },
                ],
            })

            res.json({ _id: user._id, authToken: user.password, fileId, success: true })
        } catch (err) {
            res.status(500).json({ error: true, message: err.message })
        }
    })

    app.get("/get-file/:fileId", async (req, res) => {
        const { fileId } = req.params
        if (!fileId)
            return res.status(400).json({ error: true, message: "Missing required fields" })
        try {
            const file = await CRUD({ GET: "files", FROM: "pretzel" }).get(client, String(fileId))
            if (!file) return res.status(404).json({ error: true, message: "File not found" })
            res.json(file)
        } catch (err) {
            res.status(500).json({ error: true, message: err.message })
        }
    })

    app.post("/update-file", async (req, res) => {
        const { fileId, content } = req.body
        if (!fileId || !content) {
            return res.status(400).json({ error: true, message: "Missing required fields" })
        }
        try {
            res.json(
                await CRUD({ GET: "files", FROM: "pretzel" }).update(client, String(fileId), {
                    content,
                })
            )
        } catch (err) {
            res.status(500).json({ error: true, message: err.message })
        }
    })

    app.delete("/delete-file", async (req, res) => {
        const { fileId, owner, authToken } = req.body
        try {
            const user = await client.db("pretzel").collection("users").findOne({ _id: owner })
            if (!user || authToken !== user.password) {
                return res.status(401).json({ error: true, message: "Unable to authenticate user" })
            }

            await CRUD({ GET: "files", FROM: "pretzel" }).delete(client, String(fileId))
            const files = user.files.filter((file) => String(file.fileId) !== String(fileId))
            await CRUD({ GET: "users", FROM: "pretzel" }).update(client, owner, { files })

            res.json({ success: true })
        } catch (err) {
            res.status(500).json({ error: true, message: err.message })
        }
    })

    app.post("/process-temp-save-docx", async (req, res) => {
        const fileBinaryString = req.body.content
        const fileBuffer = Buffer.from(fileBinaryString, "binary")
        const result = await mammoth.convertToHtml({ buffer: fileBuffer })
        res.send(result.value)
    })

    app.post("/utils/pdf", async (req, res) => {
        try {
            const { url } = req.body
            fetch(url)
                .then((res) => res.arrayBuffer())
                .then((pdfBuffer) => {
                    pdf(pdfBuffer).then((data) => res.send(data.text))
                })
                .catch((err) => {
                    res.status(500).json({ error: true, message: err.message })
                })
        } catch (err) {
            res.status(500).json({ error: true, message: err.message })
        }
    })

    process.on("SIGINT", async () => {
        await client.close()
        process.exit(0)
    })
}

run().catch(console.dir)
server.listen(PORT, () => console.log(`Server running port ${PORT}`))
