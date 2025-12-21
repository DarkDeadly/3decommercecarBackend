import mongoose from 'mongoose'

const connectDb = async(): Promise<void> => {
    try {
      await mongoose.connect(process.env.MONGO_URL as string) 
      console.log("MongoDB connection successful!"); 
    } catch (err) {
       console.log("error occured connection to database" , err)
       process.exit(1);
    }
}

export default connectDb