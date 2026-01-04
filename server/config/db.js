import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongodbURI = process.env.MONGODB_URI;
    const projectName = "resume_builder_dishant";

    if (!mongodbURI) {
      throw new Error("MongoDB URI environment variable not set");
    }

    const fullURI = `${mongodbURI}/${projectName}`;

    await mongoose.connect(fullURI);

    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export default connectDB;
