import mongoose from 'mongoose'


export async function dbConnect() {
    try {

        await mongoose.connect(`${process.env.MONGO_URI}`).then(() => {console.log("db connected")});

        const connection = mongoose.connection;
        connection.on("connected",() => {
            console.log("connected to database");
        });
        connection.on("error",(err) => {
            console.log("some error occured while connecting to db: ",err);
        })
    
    } catch (error) {
        console.log("error while connecting to the database: ",error);
        process.exit(1);
    }
}