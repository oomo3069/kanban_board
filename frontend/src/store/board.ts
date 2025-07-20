// src/store/board.ts
import { defineStore } from "pinia";
import { getBoards, createBoard as apiCreate } from "../services/board";

export const useBoardStore = defineStore("board", {
  state: () => ({
    ownedBoards: [] as any[],
    memberBoards: [] as any[],
  }),
  actions: {
    async fetchBoards() {
      const res = await getBoards();
      this.ownedBoards = res.owned;
      this.memberBoards = res.member;
    },
    async createBoard(name: string) {
      await apiCreate(name);
      await this.fetchBoards(); // refresh list
    },
  },
});
