import express from 'express';
import cors from 'cors';
import "dotenv/config";
import mongoose from 'mongoose';
import userRouter from './routes/userRouter.js';
import resumeRouter from './routes/resumeRouter.js';
import aiRouter from './routes/aiRouter.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

// Call the function to connect DB
connectDB();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send("Server is Running");
});
app.use('/api/users', userRouter)
app.use('/api/resumes',resumeRouter)
app.use('/api/ai',aiRouter)



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
