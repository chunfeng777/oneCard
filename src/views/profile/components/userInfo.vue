<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
    <el-form-item label="用户昵称" prop="nickname">
      <el-input v-model="form.nickname" maxlength="30" />
    </el-form-item>
    <el-form-item label="手机号码" prop="mobile">
      <el-input v-model="form.mobile" maxlength="11" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" maxlength="50" />
    </el-form-item>
    <el-form-item label="性别">
      <el-radio-group v-model="form.gender">
        <el-radio label="1">男</el-radio>
        <el-radio label="2">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">保存</el-button>
      <el-button type="danger" size="mini" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { useRouter } from "vue-router";
import UserAPI from "@/api/user";
import { useUserStore } from "@/store";
const userStore = useUserStore();
const router = useRouter();

const emit = defineEmits(["refresh:user"]);

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

// 初始化表单
const form = ref({
  nickname: props.user.nickname || "",
  mobile: props.user.mobile || "",
  email: props.user.email || "",
  gender: props.user.gender !== undefined ? String(props.user.gender) : "",
  username: props.user.username || "", // 保持初始值
  roleIds: props.user.roleIds || [], // 保持初始值
  userId: props.user.id || "", // 保持初始值
  id: props.user.id || "", // 保持初始值
});

// 观察 user 属性变化
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      form.value.nickname = newUser.nickname || "";
      form.value.mobile = newUser.mobile || "";
      form.value.email = newUser.email || "";
      form.value.gender =
        newUser.gender !== undefined ? String(newUser.gender) : "";
    }
    console.log(form.value);
  },
  { immediate: true } // 立即执行
);

const formRef = ref(null);

const rules = {
  nickname: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
  email: [
    { required: true, message: "邮箱地址不能为空", trigger: "blur" },
    {
      type: "email",
      message: "请输入正确的邮箱地址",
      trigger: ["blur", "change"],
    },
  ],
  mobile: [
    { required: true, message: "手机号码不能为空", trigger: "blur" },
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
};

const submit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 在提交前手动添加这些值
      const dataToSubmit = {
        ...form.value,
        username: props.user.username, // 保持之前的值
        roleIds: props.user.roleIds, // 保持之前的值
        userId: props.user.id, // 保持之前的值
        id: props.user.id, // 保持之前的值
      };
      // 调用修改接口
      UserAPI.updateProfile(props.user.id, dataToSubmit).then(() => {
        ElMessage.success("修改成功");
        // 更新 userStore 中的用户信息
        userStore
          .getUserInfo()
          .then(() => {
            // 触发事件通知父组件
            emit("refresh:user");
          })
          .catch((error) => {
            ElMessage.error("更新用户信息失败: " + error);
          });
      });
    }
  });
};

const close = () => {
  // 跳转首页
  router.push("/");
};
</script>
