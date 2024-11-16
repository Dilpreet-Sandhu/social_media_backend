import {dbConnect} from "./db/connection.js"
import { server } from './app.js'
import dotenv from 'dotenv'

dotenv.config();
dbConnect().then(() => {
    server.listen(process.env.PORT,() => {
        console.log("server started")
    })
})