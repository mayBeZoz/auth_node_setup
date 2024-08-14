import mongoose from "mongoose";

export default async function dbConnection () {
    try {
        await mongoose.connect(process.env.MONGO_URI as string)
        console.log('\n===========     Connected to db successfully     ===========\n')
    }catch (err) {
        console.log('\n===========     Error connecting to db     ===========\n\n\n\n\n',err)
    }
}