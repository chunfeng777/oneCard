export const useBoundUsersStore = defineStore('boundUsers', {
  state: () => ({
    boundUsers: [] as number[] // 存储已经绑定过的用户信息的数组
  }),
  getters: {
    isAlreadyBound: (state) => (id: number) => {
      return state.boundUsers.includes(id)
    }
  },
  actions: {
    // 执行绑定操作的方法
    handleBind(id: number) {
      if (this.isAlreadyBound(id)) {
        // 如果用户已经绑定过，则提示信息并返回
        ElMessage.warning("该用户已经绑定过了");
        return;
      }
      this.boundUsers.push(id);
    },
    // 解绑
    handleUnBind(id: number) {
      if (!this.isAlreadyBound(id)) {
        ElMessage.warning("该用户尚未绑定");
        return;
      }
      this.boundUsers = this.boundUsers.filter(userId => userId !== id);
    }
  }
})
