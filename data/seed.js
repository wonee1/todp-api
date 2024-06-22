import mongoose from "mongoose";
import * as dotenv from "dotenv";
import data from "./mock.js";
import Task from "../models/Task.js";

dotenv.config();

mongoose.connect(process.env.DATABASE_URL);


await Task.deleteMany({}); // 삭제 조건을 파라미터로 받는다 
await Task.insertMany(data); // 삽입할 데이터를 파라미터로 받는다

mongoose.connection.close();// 커넥션을 종료