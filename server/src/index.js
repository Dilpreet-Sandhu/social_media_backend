import {dbConnect} from "./db/connection.js"
import { app } from './app.js'
import dotenv from 'dotenv'

dotenv.config();
dbConnect().then(() => {
    app.listen(process.env.PORT,() => {
        console.log("server started")
    })
})