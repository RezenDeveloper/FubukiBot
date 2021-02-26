import express from "express";
import getRoute from './controllers/userController';
import authRoute from './controllers/authController';

const port = process.env.PORT || 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended:true })); 


app.use('/api/auth', authRoute)


app.use('/api/get', getRoute)




app.listen(port);

export default app