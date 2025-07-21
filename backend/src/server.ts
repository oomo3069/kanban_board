import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import customerRoutes from './routes/customer.routes';
import boardroutes from './routes/board.routes';
import taskRoutes from './routes/task.routes';
import notificationRoutes from './routes/notification.routes';
import assign from './routes/assign.routes';
import invite from './routes/invite.routes';
import tags from './routes/tag.routes';

const app = express();
dotenv.config();

app.use(cors({ origin: "https://kanban-board-chi-olive.vercel.app", credentials: true }));//อยู่ที่กลางใจอยู่ที่ใจกลาง

app.use(express.json());


app.use('/api/customers', customerRoutes);
app.use('/api/boards', boardroutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/assign", assign);
app.use("/api/notifications", notificationRoutes);
app.use("/api/invite", invite);
app.use("/api/tags",tags);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server is running on port ${PORT}`));