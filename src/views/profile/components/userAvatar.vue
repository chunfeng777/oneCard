<template>
  <div>
    <div class="user-info-head" @click="editCropper">
      <img :src="options.img" title="点击上传头像" class="img-circle img-lg" />
    </div>
    <el-dialog
      :title="title"
      v-model="open"
      width="800px"
      append-to-body
      @opened="modalOpened"
      @close="closeDialog"
    >
      <el-row>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <vue-cropper
            ref="cropper"
            :img="options.img"
            :info="true"
            :autoCrop="options.autoCrop"
            :autoCropWidth="options.autoCropWidth"
            :autoCropHeight="options.autoCropHeight"
            :fixedBox="options.fixedBox"
            :outputType="options.outputType"
            @real-time="realTime"
            v-if="visible"
          />
        </el-col>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <div class="avatar-upload-preview">
            <img :src="previews.url" :style="previews.img" />
          </div>
        </el-col>
      </el-row>
      <br />
      <el-row>
        <el-col :lg="2" :sm="3" :xs="3">
          <el-upload
            action="#"
            :http-request="requestUpload"
            :show-file-list="false"
            :before-upload="beforeUpload"
          >
            <el-button>
              选择
              <el-icon><UploadFilled /></el-icon>
            </el-button>
          </el-upload>
        </el-col>
        <el-col :lg="{ span: 1, offset: 2 }" :sm="2" :xs="2">
          <el-button @click="changeScale(1)"><i-ep-plus /></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :sm="2" :xs="2">
          <el-button @click="changeScale(-1)"><i-ep-minus /></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :sm="2" :xs="2">
          <el-button @click="rotateLeft"><i-ep-refresh-left /></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :sm="2" :xs="2">
          <el-button @click="rotateRight"><i-ep-refresh-right /></el-button>
        </el-col>
        <el-col :lg="{ span: 2, offset: 6 }" :sm="2" :xs="2">
          <el-button type="primary" @click="uploadImg">提 交</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import "vue-cropper/dist/index.css";
import { VueCropper } from "vue-cropper";
import { useUserStore } from "@/store/modules/user";
import UserAPI from "@/api/user";
const userStore = useUserStore();
console.log(userStore.user);
// import { uploadAvatar } from "@/api/system/user";

const open = ref(false);
const visible = ref(false);
const title = "修改头像";
const options = ref({
  img: userStore.user.avatar,
  autoCrop: true,
  autoCropWidth: 200,
  autoCropHeight: 200,
  fixedBox: true,
  outputType: "png",
  filename: "avatar",
});
const previews = ref({});
const cropper = ref(null);
const selectedFile = ref(null);

const editCropper = () => {
  open.value = true;
};

const modalOpened = () => {
  visible.value = true;
  nextTick(() => {
    console.log("Cropper instance after modal opened:", cropper.value);
  });
};

const refresh = () => {
  cropper.value.refresh();
};
// 覆盖默认的上传行为
const requestUpload = () => {};

const rotateLeft = () => {
  cropper.value.rotateLeft();
};

const rotateRight = () => {
  cropper.value.rotateRight();
};

const changeScale = (num = 1) => {
  if (cropper.value) {
    console.log(`Changing scale by ${num}`);
    cropper.value.changeScale(num);
  } else {
    console.error("Cropper instance is not initialized.");
  }
};

const beforeUpload = (file) => {
  if (!file.type.startsWith("image/")) {
    ElMessage.error("文件格式错误，请上传图片。");
    return false;
  }
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error("文件过大，请上传小于5MB的图片。");
    return false;
  }

  const reader = new FileReader();
  reader.onload = () => {
    options.value.img = reader.result;
    options.value.filename = file.name;
  };
  reader.readAsDataURL(file);
  selectedFile.value = file;
};

const uploadImg = async () => {
  cropper.value.getCropBlob(async (data) => {
    if (data) {
      // 获取文件后缀
      const fileExtension =
        options.value.filename.split(".").pop() || options.value.outputType;

      // 将 Blob 转换为 File 对象，并设置带有后缀的文件名
      const fileWithName = new File([data], `avatar.${fileExtension}`, {
        type: data.type,
      });
      // const fileWithName = new File([data], options.value.filename, {
      //   type: data.type,
      // });
      console.log("Selected file:", fileWithName);
      console.log("Selected file type:", fileWithName.name);
      const formData = new FormData();
      formData.append("file", fileWithName);
      formData.append("userId", userStore.user.userId.toString());

      try {
        const response = await UserAPI.uploadAvatar(formData);
        if (response) {
          ElMessage.success("头像修改成功");
          userStore.user.avatar = response;
          options.value.img = response;
          open.value = false;
        } else {
          ElMessage.error("头像修改失败");
        }
      } catch (error) {
        console.error("Upload failed:", error);
        ElMessage.error("修改头像失败，请重试");
      }
    } else {
      ElMessage.error("无法获取裁剪后的图片");
    }
  });
};

const realTime = (data) => {
  previews.value = data;
};

const closeDialog = () => {
  options.value.img = userStore.user.avatar;
  visible.value = false;
};

onMounted(() => {});

onBeforeUnmount(() => {});
</script>

<style scoped lang="scss">
.user-info-head {
  position: relative;
  display: inline-block;
  height: 120px;
}

.img-lg {
  width: 120px;
  height: 120px;
}

.img-circle {
  border-radius: 50%;
}

img {
  overflow-clip-margin: content-box;
  overflow: clip;
}

.user-info-head:hover::after {
  position: absolute;
  inset: 0;
  font-size: 24px;
  font-style: normal;
  line-height: 110px;
  color: #eee;
  cursor: pointer;
  content: "+";
  background: rgb(0 0 0 / 50%);
  border-radius: 50%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.avatar-upload-preview {
  position: relative;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  overflow: hidden;
  border-radius: 50%;
  box-shadow: 0 0 4px #ccc;
  transform: translate(-50%, -50%);
}
</style>
