import { Router } from 'express'
import userRouter from './routes/users.mjs'
import productRouter from './routes/products.mjs'
import router from './users.mjs';

router = Router();

router.use(userRouter); // alternatively
router.use(productRouter);


export default router 