import express from "express";
import mongoose from "mongoose";
import Task from "./models/Task.js";
import * as dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// req.body로 접근하려면 express.json() 필요함
app.use(cors());
app.use(express.json());

// try-catch 대신 asyncHandler
function asyncHandler(handler) {
    // asyncReqHandler 함수 정의
  return async function (req, res) {
    try {
      // handler 함수 실행
      await handler(req, res);
    } catch (e) {
      // 오류 처리
      if (e.name === "ValidationError") {
        res.status(400).send({ message: e.message });
      } else if (e.name === "CastError") {
        res.status(404).send({ mesage: "Cannot find given id." });
      } else {
        res.status(500).send({ message: e.message });
      }
    }
  };
}



app.get(
  "/tasks",
  asyncHandler(async (req, res) => {
    const sort = req.query.sort;
    const count = Number(req.query.count) || 0;

    const sortOption = { createdAt: sort === "oldest" ? "asc" : "desc" };
    const tasks = await Task.find().sort(sortOption).limit(count);//여러 객체를 조회할 때는 .find() 메소드를 사용한다.

    res.send(tasks); // js를 json으로 변환
  })
);


app.get(
  "/tasks/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const task = await Task.findById(id);// id로 특정 객체를 조회할 때는 .findById()를 사용한다.
    if (task) {
      res.send(task);
    } else {
      res.status(404).send({ message: "Cannot find given id." });
    }
  })
);

app.post(
  "/tasks",
  asyncHandler(async (req, res) => {
    const newTask = await Task.create(req.body); //create() 메소드를 사용해서 객체를 생성할 수 있다.
    res.status(201).send(newTask);
  })
);

app.patch(
  "/tasks/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const task = await Task.findById(id);
    if (task) {
      Object.keys(req.body).forEach((key) => {
        task[key] = req.body[key];
      });
      await task.save(); //수정한 테스크를 저장하는 save 메소드를 호출한다 
      res.send(task);
    } else {
      res.status(404).send({ message: "Cannot find given id." });
    }
  })
);

app.delete(
  "/tasks/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
 
    const task = await Task.findByIdAndDelete(id);//.findByIdAndDelete() 메소드를 이용해서 객체를 가져오는 것과 동시에 객체를 삭제할 수 있다.
    if (task) {
      res.sendStatus(204);
    } else {
      res.status(404).send({ message: "Cannot find given id." });
    }
  })
);//유효성 검사는 모델의 create나 save 메소드를 사용할 때만 실행된다 

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to DB"));


app.listen(process.env.PORT || 3000, () => console.log("Server Started"));