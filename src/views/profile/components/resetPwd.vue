<template>
  <el-form ref="formRef" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input
        v-model="user.oldPassword"
        placeholder="请输入旧密码"
        type="password"
        show-password
      />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input
        v-model="user.newPassword"
        placeholder="请输入新密码"
        type="password"
        show-password
      />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input
        v-model="user.confirmPassword"
        placeholder="请确认新密码"
        type="password"
        show-password
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">保存</el-button>
      <el-button type="danger" size="mini" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref } from "vue";
import UserAPI from "@/api/user";
import { useUserStore } from "@/store";
const userStore = useUserStore();
const router = useRouter();

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const user = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const formRef = ref(null); // 定义 formRef

const equalToPassword = (rule, value, callback) => {
  if (user.value.newPassword !== value) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const passwordNotEqual = (rule, value, callback) => {
  if (value === user.value.oldPassword) {
    callback(new Error("新密码不能与旧密码相同"));
  } else {
    callback();
  }
};

const rules = {
  oldPassword: [{ required: true, message: "旧密码不能为空", trigger: "blur" }],
  newPassword: [
    { required: true, message: "新密码不能为空", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" },
    {
      pattern: /^[^<>"'|\\]+$/,
      message: "不能包含非法字符：< > \" ' \\ |",
      trigger: "blur",
    },
    { validator: passwordNotEqual, trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "确认密码不能为空", trigger: "blur" },
    { validator: equalToPassword, trigger: "blur" },
  ],
};

const submit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      UserAPI.personalPassword(props.user.id, user.value).then(() => {
        ElMessage.success("密码修改成功，请重新登录");
        // 清除 token
        userStore.resetToken();
        location.reload(); // 清空路由
      });
    }
  });
};

const close = () => {
  // 跳转首页
  router.push("/");
};
</script>
