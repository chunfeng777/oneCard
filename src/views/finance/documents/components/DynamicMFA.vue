<template>
  <div>
    <!-- 未绑定账号流程 -->
    <el-dialog
      title="动态口令认证"
      v-model="dialogVisible"
      v-if="!accountBound"
      @close="handleDialogClose"
      @open="handleDialogOpen"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <el-steps :active="activeStep" finish-status="success">
        <el-step title="下载应用" />
        <el-step title="绑定账号" />
        <el-step title="验证账号" />
      </el-steps>

      <!-- 步骤内容 -->
      <div v-if="activeStep === 0" class="step-content">
        <p>
          当前账号未绑定令牌APP，请前往各应用市场下载并安装令牌APP，推荐下载Google身份验证器进行认证操作。
        </p>
        <div style="text-align: center">
          <img
            src="@/assets/images/R-C.png"
            style="width: 100px; height: 100px; border-radius: 10px"
          />
        </div>
      </div>

      <div v-if="activeStep === 1" class="step-content">
        <p>请使用令牌APP进行扫码：</p>
        <strong style="color: red"
          >一定要扫码绑定，如果因为刷新导致未扫码，请联系管理员！</strong
        >
        <div class="qrcode-container">
          <img
            v-if="qrCodeUrl"
            :src="qrCodeUrl"
            alt="QR Code"
            style="margin: 0 auto"
          />
          <div v-if="!qrCodeUrl" class="error">
            二维码加载失败，请
            <a href="javascript:void(0);" @click="generateQRCode">点击重试</a>
          </div>
        </div>
      </div>

      <div v-if="activeStep === 2" class="step-content">
        <el-form class="login-dialog" auto-complete="on">
          <el-form-item
            prop="code"
            style="width: 50%; margin: 20px auto; text-align: center"
          >
            <el-input v-model="userCode" placeholder="请输入动态口令" />
          </el-form-item>
          <div
            v-if="verifyMessage"
            :class="verifySuccess ? 'success' : 'error'"
          >
            {{ verifyMessage }}
          </div>
        </el-form>
      </div>

      <!-- 操作按钮 -->
      <div class="dialog-footer" style="text-align: right">
        <el-button v-if="activeStep > 0" @click="prevStep">上一步</el-button>
        <el-button v-if="activeStep < 2" type="primary" @click="nextStep">
          下一步
        </el-button>
        <el-button v-if="activeStep === 2" type="primary" @click="verifyCode">
          验证
        </el-button>
      </div>
    </el-dialog>

    <!-- 已绑定账号流程 -->
    <el-dialog
      title="动态口令认证"
      v-model="dialogDynamicPasswordVisible"
      width="30%"
      v-if="accountBound"
      @close="handleDialogClose"
    >
      <div class="info" style="width: 70%; margin: 0 auto">
        <el-form class="login-dialog" auto-complete="on" label-position="left">
          <el-form-item prop="code">
            <el-input v-model="userCode" placeholder="请输入动态口令" />
          </el-form-item>
          <div
            v-if="verifyMessage"
            :class="verifySuccess ? 'success' : 'error'"
          >
            {{ verifyMessage }}
          </div>
          <el-button
            :loading="loading"
            type="primary"
            style="width: 100%; margin-top: 10px; margin-bottom: 30px"
            @click="verifyCode"
            >验证</el-button
          >
        </el-form>
      </div>
      <!-- 添加按钮 -->
      <template #footer>
        <el-link :underline="false" @click="openFirstDialog" type="primary"
          ><el-icon><Right /></el-icon>重新绑定</el-link
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import QRCode from "qrcode"; // 引入 qrcode 库
import OrgAPI from "@/api/org";
const props = defineProps({
  accountBound: {
    type: Boolean,
    required: true,
  },
  currentDownloadFile: {
    type: Object,
    required: true,
  },
});
// console.log(props.accountBound, "动态密码");
const emit = defineEmits(["success", "close", "checkAndShowMFA"]);

const dialogVisible = ref(true); // 第一个弹窗控制
const dialogDynamicPasswordVisible = ref(false); // 第二个弹窗控制
const activeStep = ref(0);
const qrCodeUrl = ref(""); // 用于存储二维码的 URL
const userCode = ref(""); // 用于存储用户输入的验证码
const verifyMessage = ref(""); // 用于显示验证码验证的提示信息
const verifySuccess = ref(false); // 验证成功与否
const loading = ref(false); // 验证按钮的加载状态

const handleDialogOpen = () => {
  // 移除 generateQRCode 调用
};

// 请求后端获取secretKey生成二维码和密钥
const generateQRCode = async () => {
  try {
    const response = await OrgAPI.getSecretKey();
    // console.log(response, "二维码");
    if (response) {
      // 生成二维码图片的 Data URL
      const qrCodeDataURL = await QRCode.toDataURL(response);
      qrCodeUrl.value = qrCodeDataURL; // 将 Data URL 赋值给 qrCodeUrl
    }
  } catch (error) {
    console.error("二维码生成失败：", error);
  }
};

// 验证用户输入的验证码
const verifyCode = async () => {
  if (userCode.value.length !== 6) {
    verifyMessage.value = "请输入有效的6位验证码！";
    verifySuccess.value = false;
    return;
  }

  try {
    loading.value = true; // 显示加载状态
    // 使用 GET 请求，将 userCode 作为参数传递
    const response = await OrgAPI.checkCode({ code: userCode.value });

    // console.log(response, "验证码");

    if (response) {
      verifyMessage.value = "验证成功！";
      verifySuccess.value = true;
      // 触发 success 事件 通知父组件下载文件
      emit("success");
    } else {
      verifyMessage.value = "验证码无效，请重试！";
      verifySuccess.value = false;
    }
  } catch (error) {
    console.error("验证码验证失败：", error);
    verifyMessage.value = "验证失败，请重试！";
    verifySuccess.value = false;
  } finally {
    loading.value = false; // 隐藏加载状态
  }
};

// 步骤切换
const nextStep = () => {
  if (activeStep.value === 0) {
    generateQRCode(); // 在进入第二步时生成二维码
  }
  activeStep.value++; // 前往下一步
};

const prevStep = () => {
  activeStep.value--; // 返回上一步
};

// 重新绑定
const openFirstDialog = () => {
  OrgAPI.deleteMfa().then(() => {
    dialogDynamicPasswordVisible.value = false; // 关闭当前弹窗
    // 通知父组件 检查是否绑定账号并显示相应的弹窗
    // props.currentDownloadFile：点击的文件的数据
    emit("checkAndShowMFA", props.currentDownloadFile);
    // dialogVisible.value = true; // 打开第一个弹窗
    // activeStep.value = 0; // 重置到第一个步骤
  });
};

// 关闭对话框时的处理
const handleDialogClose = () => {
  // 重置所有状态
  dialogVisible.value = false;
  dialogDynamicPasswordVisible.value = false;
  activeStep.value = 0; // 重置步骤
  userCode.value = ""; // 清空验证码输入
  verifyMessage.value = ""; // 清空验证消息
  verifySuccess.value = false; // 清空验证状态
  qrCodeUrl.value = ""; // 清空二维码 URL
  emit("close"); // 通知父组件关闭
};

// 页面加载时根据 accountBound 设置弹窗显示
onMounted(() => {
  if (props.accountBound) {
    dialogDynamicPasswordVisible.value = true;
    dialogVisible.value = false;
  } else {
    dialogVisible.value = true;
    dialogDynamicPasswordVisible.value = false;
  }
});

// 监听 currentDownloadFile 的变化
watch(
  () => props.currentDownloadFile,
  (newVal) => {
    console.log("currentDownloadFile changed:", newVal);
  }
);
</script>

<style scoped>
.step-content {
  margin: 20px 0;
  text-align: center;
}

.auth-app-logo {
  width: 100px;
  height: 100px;
  margin: 20px auto;
}

.qrcode-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  margin: 20px auto;
  background-color: #f9f9f9;
  border: 1px solid #dcdcdc;
  border-radius: 4px;
}

.success {
  font-weight: bold;
  color: green;
}

.error {
  font-weight: bold;
  color: red;
}
</style>
