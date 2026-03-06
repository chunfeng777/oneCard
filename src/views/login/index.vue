<template>
  <div class="login-container">
    <!-- 顶部 -->
    <div class="absolute-lt flex-x-end p-3 w-full">
      <el-switch
        v-model="isDark"
        inline-prompt
        :active-icon="Moon"
        :inactive-icon="Sunny"
        @change="toggleTheme"
      />
      <lang-select class="ml-2 cursor-pointer" />
    </div>

    <el-card class="!border-none !bg-transparent !rounded-4% w-100 <sm:w-85">
      <div class="text-center relative">
        <h2>{{ defaultSettings.title }}</h2>
        <el-tag class="ml-2 absolute-rt">{{ defaultSettings.version }}</el-tag>
      </div>

      <!-- 登录表单 -->
      <el-form
        v-if="loginForm.type === 'login-form'"
        ref="loginFormRef"
        :model="loginData"
        :rules="loginRules"
        class="login-form"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <div class="flex-y-center w-full">
            <svg-icon icon-class="user" class="mx-2" />
            <el-input
              ref="username"
              v-model="loginData.username"
              :placeholder="$t('login.username')"
              name="username"
              size="large"
              class="h-[48px]"
            />
          </div>
        </el-form-item>

        <!-- 密码 -->
        <el-tooltip
          :visible="isCapslock"
          :content="$t('login.capsLock')"
          placement="right"
        >
          <el-form-item prop="password">
            <div class="flex-y-center w-full">
              <svg-icon icon-class="lock" class="mx-2" />
              <el-input
                v-model="loginData.password"
                :placeholder="$t('login.password')"
                type="password"
                name="password"
                @keyup="checkCapslock"
                @keyup.enter="handleLogin"
                size="large"
                class="h-[48px] pr-2"
                show-password
              />
            </div>
          </el-form-item>
        </el-tooltip>

        <!-- 验证码 -->
        <!-- <el-form-item prop="captchaCode">
          <div class="flex-y-center w-full">
            <svg-icon icon-class="captcha" class="mx-2" />
            <el-input
              v-model="loginData.captchaCode"
              auto-complete="off"
              size="large"
              class="flex-1"
              :placeholder="$t('login.captchaCode')"
              @keyup.enter="handleLogin"
            />

            <el-image
              @click="getCaptcha"
              :src="captchaBase64"
              class="rounded-tr-md rounded-br-md cursor-pointer h-[48px]"
            />
          </div>
        </el-form-item> -->

        <!-- 登录滑块验证码 -->
        <Vcode :show="isShow" @success="onSuccess" @close="onClose" />

        <!-- 登录按钮 -->
        <el-button
          :loading="loading"
          type="primary"
          size="large"
          class="w-full"
          @click.prevent="handleLogin"
          >{{ $t("login.login") }}
        </el-button>

        <!-- 账号密码提示 -->
        <div class="mt-5 text-sm flex justify-between">
          <span @click="loginForm.type = 'sigin-form'">用户注册</span>
          <span @click="loginForm.type = 'reset1-form'">忘记密码</span>
        </div>
      </el-form>

      <!-- 注册表单 -->
      <el-form
        v-if="loginForm.type === 'sigin-form'"
        ref="siginFormRef"
        :model="siginData"
        :rules="siginRules"
        class="sigin-form"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <div class="flex-y-center w-full">
            <svg-icon icon-class="user" class="mx-2" />
            <el-input
              ref="username"
              v-model="siginData.username"
              :placeholder="$t('login.username')"
              name="username"
              size="large"
              class="h-[48px]"
              @blur="checkName"
            />
          </div>
        </el-form-item>

        <!-- 密码 -->
        <el-tooltip
          :visible="isCapslock"
          :content="$t('login.capsLock')"
          placement="right"
        >
          <el-form-item prop="password">
            <div class="flex-y-center w-full">
              <svg-icon icon-class="lock" class="mx-2" />
              <el-input
                v-model="siginData.password"
                :placeholder="$t('login.password')"
                type="password"
                name="password"
                @keyup="checkCapslock"
                @keyup.enter="handleSigin"
                size="large"
                class="h-[48px] pr-2"
                show-password
              />
            </div>
          </el-form-item>
        </el-tooltip>

        <!-- 验证密码 -->
        <el-tooltip
          :visible="isCapslock"
          :content="$t('login.capsLock')"
          placement="right"
        >
          <el-form-item prop="confirmPassword">
            <div class="flex-y-center w-full">
              <svg-icon icon-class="lock" class="mx-2" />
              <el-input
                v-model="siginData.confirmPassword"
                placeholder="确认密码"
                type="password"
                name="password"
                @keyup="checkCapslock"
                @keyup.enter="handleSigin"
                size="large"
                class="h-[48px] pr-2"
                show-password
              />
            </div>
          </el-form-item>
        </el-tooltip>

        <!-- 邮箱 -->
        <el-form-item prop="email">
          <div class="flex-y-center w-full">
            <svg-icon icon-class="email" class="mx-2" />
            <el-input
              ref="email"
              v-model="siginData.email"
              placeholder="请输入邮箱"
              name="email"
              size="large"
              class="h-[48px]"
            />
          </div>
        </el-form-item>

        <!-- 验证码 -->
        <el-form-item prop="captcha">
          <div class="flex-y-center w-full">
            <svg-icon icon-class="captcha" class="mx-2" />
            <el-input
              v-model="siginData.captcha"
              auto-complete="off"
              size="large"
              class="flex-1"
              :placeholder="$t('login.captchaCode')"
              @keyup.enter="handleSigin"
            />

            <el-button
              v-if="!isEmailBtn"
              @click.prevent="postEmailCode"
              class="rounded-tr-md rounded-br-md cursor-pointer h-[48px]"
              >发送邮箱验证码
            </el-button>
            <el-button
              v-if="isEmailBtn"
              class="rounded-tr-md rounded-br-md cursor-pointer h-[48px]"
              >{{ emailTime }}秒
            </el-button>
          </div>
        </el-form-item>

        <!-- 登录按钮 -->
        <el-button
          :loading="loading"
          type="primary"
          size="large"
          class="w-full"
          @click.prevent="handleSigin"
          >注 册
        </el-button>

        <!-- 账号密码提示 -->
        <div class="mt-5 text-sm flex justify-between">
          <span @click="loginForm.type = 'login-form'">用户登入</span>
        </div>
      </el-form>

      <!-- 忘记密码 -->
      <el-form
        v-if="loginForm.type === 'reset1-form'"
        ref="resetFormRef"
        :model="resetData"
        :rules="resetRules"
        class="reset1-form"
        @submit.prevent
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <div class="flex-y-center w-full">
            <svg-icon icon-class="user" class="mx-2" />
            <el-input
              ref="username"
              v-model="resetData.username"
              :placeholder="$t('login.username')"
              name="username"
              size="large"
              class="h-[48px]"
            />
          </div>
        </el-form-item>

        <!-- 登录按钮 -->
        <el-button
          :loading="loading"
          type="primary"
          size="large"
          class="w-full"
          @click.prevent="reset1Psw"
          >下一步
        </el-button>

        <!-- 返回 -->
        <div class="mt-5 text-sm flex justify-between">
          <span @click="loginForm.type = 'login-form'">用户登入</span>
        </div>
      </el-form>
      <el-form
        v-if="loginForm.type === 'reset2-form'"
        ref="resetFormRef"
        :model="resetData"
        :rules="resetRules"
        class="reset1-form"
      >
        <!-- 密码 -->
        <el-tooltip
          :visible="isCapslock"
          :content="$t('login.capsLock')"
          placement="right"
        >
          <el-form-item prop="password">
            <div class="flex-y-center w-full">
              <svg-icon icon-class="lock" class="mx-2" />
              <el-input
                v-model="resetData.password"
                placeholder="新密码"
                type="password"
                name="password"
                @keyup="checkCapslock"
                @keyup.enter="reset2Psw"
                size="large"
                class="h-[48px] pr-2"
                show-password
              />
            </div>
          </el-form-item>
        </el-tooltip>

        <!-- 验证密码 -->
        <el-tooltip
          :visible="isCapslock"
          :content="$t('login.capsLock')"
          placement="right"
        >
          <el-form-item prop="newPassword">
            <div class="flex-y-center w-full">
              <svg-icon icon-class="lock" class="mx-2" />
              <el-input
                v-model="resetData.newPassword"
                placeholder="确认新密码"
                type="password"
                name="password"
                @keyup="checkCapslock"
                @keyup.enter="reset2Psw"
                size="large"
                class="h-[48px] pr-2"
                show-password
              />
            </div>
          </el-form-item>
        </el-tooltip>

        <!-- 验证码 -->
        <el-form-item prop="captcha">
          <div class="flex-y-center w-full">
            <svg-icon icon-class="captcha" class="mx-2" />
            <el-input
              v-model="resetData.captcha"
              auto-complete="off"
              size="large"
              class="flex-1"
              :placeholder="$t('login.captchaCode')"
              @keyup.enter="reset2Psw"
            />
          </div>
        </el-form-item>

        <!-- 登录按钮 -->
        <el-button
          :loading="loading"
          type="primary"
          size="large"
          class="w-full"
          @click.prevent="reset2Psw"
          >重置密码
        </el-button>
        <!-- 返回 -->
        <div class="mt-5 text-sm flex justify-between">
          <span @click="loginForm.type = 'login-form'">用户登入</span>
        </div>
      </el-form>
    </el-card>

    <!-- ICP备案 -->
    <div class="absolute bottom-1 text-[10px] text-center" v-show="icpVisible">
      <p>深圳市百川云创技术有限公司</p>
      <!-- <p>皖ICP备20006496号-3</p> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore, useUserStore, useDictStore } from "@/store";
import AuthAPI from "@/api/auth";
import { Sunny, Moon } from "@element-plus/icons-vue";
import { LoginData, SiginData, ResetData } from "@/api/auth/model";
import { LocationQuery, LocationQueryValue, useRoute } from "vue-router";
import router from "@/router";
import defaultSettings from "@/settings";
import { ThemeEnum } from "@/enums/ThemeEnum";
// 滑块验证码插件
import Vcode from "vue3-puzzle-vcode";

// 自定义背景图片
// import img01 from "@/assets/images/excel.png";
// import img02 from "@/assets/images/exe.png";

// const imgs = ref([img01, img02]);

// 控制滑块验证码显示
const isShow = ref(false);

// Stores
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const dictStore = useDictStore();

// Internationalization
const { t } = useI18n();

// Reactive states
const isDark = ref(settingsStore.theme === ThemeEnum.DARK);
const icpVisible = ref(true);
const loading = ref(false); // 按钮loading
const isCapslock = ref(false); // 是否大写锁定
const captchaBase64 = ref(); // 验证码图片Base64字符串
const loginFormRef = ref(ElForm); // 登录表单ref
const siginFormRef = ref(ElForm); // 注册表单ref
const resetFormRef = ref(ElForm); // 重置表单ref
const isEmailBtn = ref(false);
const emailTime = ref(60);
const { height } = useWindowSize();

const loginData = ref<LoginData>({
  username: "",
  password: "",
});

const siginData = ref<SiginData>({
  username: "",
  password: "",
  confirmPassword: "",
  captcha: "",
  checkName: "",
  email: "",
});

const resetData = ref<ResetData>({
  username: "",
  password: "",
  newPassword: "",
  captcha: "",
});

// 表单对象
const loginForm = reactive({
  type: "login-form",
});

const loginRules = computed(() => {
  return {
    username: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.username.required"),
      },
    ],
    password: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.password.required"),
      },
      {
        min: 6,
        message: t("login.message.password.min"),
        trigger: "blur",
      },
    ],
    captchaCode: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.captchaCode.required"),
      },
    ],
  };
});

const siginRules = computed<any>(() => {
  return {
    username: [
      {
        required: true,
        trigger: "blur",
        message: "请输入用户名",
      },
    ],
    password: [
      {
        required: true,
        trigger: "blur",
        message: "请输入密码",
      },
      {
        min: 6,
        message: "密码不能少于6位",
        trigger: "blur",
      },
    ],
    confirmPassword: [
      {
        required: true,
        trigger: "blur",
        validator: pwdAgainCheck,
      },
    ],
    email: [
      {
        required: true,
        message: "请输入您的电子邮件",
        trigger: "blur",
      },
      {
        type: "email",
        message: "请输入有效的电子邮件地址",
        trigger: ["blur", "change"],
      },
    ],
    captcha: [
      {
        required: true,
        trigger: "blur",
        message: "请输入验证码",
      },
    ],
  };
});

const resetRules = computed<any>(() => {
  return {
    username: [
      {
        required: true,
        trigger: "blur",
        message: "请输入用户名",
      },
    ],
    password: [
      {
        required: true,
        trigger: "blur",
        message: "请输入密码",
      },
      {
        min: 6,
        message: "密码不能少于6位",
        trigger: "blur",
      },
    ],
    newPassword: [
      {
        required: true,
        trigger: "blur",
        validator: pwdAgainCheck,
      },
    ],
    captcha: [
      {
        required: true,
        trigger: "blur",
        message: "请输入验证码",
      },
    ],
  };
});

const pwdAgainCheck = async (rule: any, value: any, callback: any) => {
  if (value.length < 1) {
    return callback(new Error("重复密码不能为空！"));
  } else if (siginData.value.password != siginData.value.confirmPassword) {
    return callback(new Error("两次输入密码不一致！"));
  } else {
    callback();
  }
};

/** 获取验证码 */
function postEmailCode() {
  siginFormRef.value.validateField(["email", "username"], (valid: boolean) => {
    if (valid && !siginData.value.checkName) {
      AuthAPI.postEmailCode(siginData.value).then((res) => {
        ElMessage({
          message: "邮件已发送，请注意查收",
          type: "success",
        });
        isEmailBtn.value = true;
        const emailBtnTimer = setInterval(function () {
          if (emailTime.value > 1) {
            emailTime.value--;
          } else if (emailTime.value == 1) {
            isEmailBtn.value = false;
            emailTime.value = 60;
            clearInterval(emailBtnTimer);
          }
        }, 1000);
      });
    }
  });
}

/** 获取验证码 */
// function getCaptcha() {
//   AuthAPI.getCaptcha().then((data) => {
//     loginData.value.captchaKey = data.captchaKey;
//     captchaBase64.value = data.captchaBase64;
//   });
// }

/** 登录 */
const route = useRoute();
async function handleLogin() {
  loginFormRef.value.validate((valid: boolean) => {
    if (valid) {
      // 显示验证码组件
      isShow.value = true;
    }
  });
}

const onClose = () => {
  isShow.value = false;
};
const onSuccess = async () => {
  onClose(); // 验证成功，手动关闭模态框
  loading.value = true;
  try {
    await userStore.login(loginData.value);
    const query: LocationQuery = route.query;
    const redirect = (query.redirect as LocationQueryValue) ?? "/";
    const otherQueryParams = Object.keys(query).reduce(
      (acc: any, cur: string) => {
        if (cur !== "redirect") {
          acc[cur] = query[cur];
        }
        return acc;
      },
      {}
    );
    // 需要在路由跳转前加载字典数据，否则会出现字典数据未加载完成导致页面渲染异常
    await dictStore.loadDictionaries();
    router.push({ path: redirect, query: otherQueryParams });
  } catch {
    // getCaptcha();
  } finally {
    loading.value = false;
  }
};

/** 注册 */
function handleSigin() {
  siginFormRef.value.validate((valid: boolean) => {
    if (valid) {
      AuthAPI.register(siginData.value).then(() => {
        ElMessage({
          message: "注册成功",
          type: "success",
        });
        siginFormRef.value.resetFields();
        loginForm.type = "login-form";
      });
    }
  });
}

/** 主题切换 */
const toggleTheme = () => {
  const newTheme =
    settingsStore.theme === ThemeEnum.DARK ? ThemeEnum.LIGHT : ThemeEnum.DARK;
  settingsStore.changeTheme(newTheme);
};

/** 根据屏幕宽度切换设备模式 */
watchEffect(() => {
  if (height.value < 600) {
    icpVisible.value = false;
  } else {
    icpVisible.value = true;
  }
});

/** 检查输入大小写 */
function checkCapslock(event: KeyboardEvent) {
  // 防止浏览器密码自动填充时报错
  if (event instanceof KeyboardEvent) {
    isCapslock.value = event.getModifierState("CapsLock");
  }
}

/** 检查重名 */
function checkName() {
  if (siginData.value.username.length < 1) {
    return;
  }
  AuthAPI.checkName(siginData.value.username).then((res) => {
    siginData.value.checkName = res;
    if (res) {
      ElMessage({
        message: "该用户名已存在",
        type: "warning",
      });
    }
  });
}

/** 重置密码 */
function reset1Psw() {
  resetFormRef.value.validateField(["username"], (valid: boolean) => {
    if (valid) {
      AuthAPI.resetPswCheck(resetData.value).then(() => {
        ElMessage({
          message: "邮件已发送，请注意查收",
          type: "success",
        });
        loginForm.type = "reset2-form";
      });
    }
  });
}

function reset2Psw() {
  resetFormRef.value.validate((valid: boolean) => {
    if (valid) {
      AuthAPI.resetPsw(resetData.value).then(() => {
        ElMessage({
          message: "密码重置成功",
          type: "success",
        });
        resetFormRef.value.resetFields();
        resetData.value.username = "";
        loginForm.type = "login-form";
      });
    }
  });
}

onMounted(() => {
  // getCaptcha();
});
</script>

<style lang="scss" scoped>
html.dark .login-container {
  background: url("@/assets/images/login-bg-dark.jpg") no-repeat center right;
}

.login-container {
  overflow-y: auto;
  background: url("@/assets/images/login-bg.jpg") no-repeat center right;

  @apply wh-full flex-center;

  .login-form,
  .sigin-form,
  .reset1-form,
  .reset2-form {
    padding: 30px 10px;
  }
}

.el-form-item {
  background: var(--el-input-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 5px;
}

:deep(.el-input) {
  .el-input__wrapper {
    padding: 0;
    background-color: transparent;
    box-shadow: none;

    &.is-focus,
    &:hover {
      box-shadow: none !important;
    }

    input:-webkit-autofill {
      /* 通过延时渲染背景色变相去除背景颜色 */
      transition: background-color 1000s ease-in-out 0s;
    }
  }
}
</style>
@/api/auth/model
