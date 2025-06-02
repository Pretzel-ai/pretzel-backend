import dotenv from "dotenv"

dotenv.config()

const config = {
    port: process.env.PORT || 80,
    mongoUri: `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@visioneerlist.${process.env.DB_KEY}.mongodb.net/?retryWrites=true&w=majority`,
    nodeEnv: process.env.NODE_ENV || "development",
}

export default config
