import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import http from 'http';
import { initSocket } from './utils/socket.js';

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import employerRoutes from "./routes/employerRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/jobApplicationRoutes.js";
import savedJobRoutes from "./routes/savedJobRoutes.js";
import otpRoutes from "./routes/OTPRoutes.js"
import CategoryRoutes from "./routes/CategoryRoutes.js";


connectDB();

const app = express();
app.use(cors());
app.use(express.json());
import path from 'path';
// Serve uploaded files (avatars/resumes)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/otp", otpRoutes);
app.use("/employee", employeeRoutes);
app.use("/employer", employerRoutes);
app.use("/job", jobRoutes);
app.use("/application", applicationRoutes);
app.use("/category", CategoryRoutes);
app.use("/saved", savedJobRoutes);

const PORT = 5000;
const server = http.createServer(app);

// init socket
initSocket(server);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
