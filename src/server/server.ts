import express from "express";
import getRoute from './controllers/userController';
import authRoute from './controllers/authController';
import authMiddleware from './middlewares/auth';
import watchRoute from "./controllers/watchController";
import updateRoute from "./controllers/patchController";

const port = process.env.PORT || 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use('/api/auth', authRoute)

app.use(authMiddleware)

app.use('/api/get', getRoute)
app.use('/api/patch', updateRoute)
app.use('/api/watch', watchRoute)




app.listen(port);

export default app