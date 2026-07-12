import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(mongoUri);

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");

    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exit(1);
  }
};