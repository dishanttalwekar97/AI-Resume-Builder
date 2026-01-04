import express from 'express';
import { getUserById, getUserResmumes, loginUser, registerUser } from '../controllers/userControllers.js';
import protect from '../middleware/authMiddleware.js';


const userRouter = express.Router();


userRouter.post('/register',registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/data' , protect,getUserById);
userRouter.get('/resumes' , protect, getUserResmumes);

export default userRouter;