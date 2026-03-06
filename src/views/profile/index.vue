<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <template #header>
            <div class="clearfix">
              <span>个人信息</span>
            </div>
          </template>
          <div>
            <div class="text-center">
              <userAvatar />
            </div>
            <!-- <template #footer> -->
            <ul class="list-group">
              <li class="list-group-item divider"></li>
              <li class="list-group-item">
                <div>
                  <el-icon><UserFilled /></el-icon>用户名称
                </div>
                <div class="pull-right">{{ user.username }}</div>
              </li>
              <li class="list-group-item">
                <div>
                  <el-icon><Iphone /></el-icon>手机号码
                </div>
                <div class="pull-right">{{ user.mobile }}</div>
              </li>
              <li class="list-group-item">
                <div><svg-icon icon-class="email" />用户邮箱</div>
                <div class="pull-right">{{ user.email }}</div>
              </li>
              <li class="list-group-item">
                <div><svg-icon icon-class="tree" />所属部门</div>
                <div class="pull-right">{{ user.deptName }}</div>
              </li>
              <li class="list-group-item">
                <div><svg-icon icon-class="peoples" />所属角色</div>
                <div class="pull-right">{{ user.roleNames.join(",") }}</div>
              </li>
              <li class="list-group-item">
                <div>
                  <el-icon><Timer /></el-icon>创建日期
                </div>
                <div class="pull-right">{{ user.createTime }}</div>
              </li>
            </ul>
            <!-- </template> -->
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <template #header>
            <div class="clearfix">
              <span>基本资料</span>
            </div>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo :user="user" @refresh:user="getUserInfo" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd :user="user" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
import userInfo from "./components/userInfo.vue";
import resetPwd from "./components/resetPwd.vue";
import userAvatar from "./components/userAvatar.vue";
import UserAPI from "@/api/user";
import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore();
console.log(userStore.user.userId);
const user = ref({
  username: "",
  mobile: "",
  email: "",
  deptName: "",
  roleNames: [],
  createTime: "",
});
const activeTab = ref("userinfo");
const getUserInfo = () => {
  const userId = userStore.user.userId;
  // console.log(userId);
  UserAPI.getPersonalCenter(userId).then((resp) => {
    // Object.assign(user, resp);
    user.value = resp;
    // console.log(resp);
  });
};

onMounted(() => {
  getUserInfo();
});
</script>
<style scoped>
.list-group {
  padding: 0;
  margin: 0;
  list-style: none;
}

.list-group-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.pull-right {
  text-align: right;
}

.divider {
  /* 隐藏内容 */
  height: 1px;
  overflow: hidden;
  border-bottom: 1px solid #ebeef5;
}

.clearfix::after {
  display: table;
  clear: both;
  content: "";
}
</style>
