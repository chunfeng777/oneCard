import { defineStore } from "pinia";

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    lastUpdated: 0, // 用来标记最后一次更新时间
  }),

  actions: {
    // 操作完成后更新 lastUpdated
    updateLastUpdated() {
      this.lastUpdated = Date.now();
      // console.log("updateLastUpdated", this.lastUpdated);
    },
  },
});
