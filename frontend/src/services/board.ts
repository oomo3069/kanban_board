// src/services/board.ts
import axios from "axios";

export const getBoards = async () => {
  const res = await axios.get("/api/boards");
  return res.data;
};

export const createBoard = async (name: string) => {
  const res = await axios.post("/api/boards", { name });
  return res.data;
};
