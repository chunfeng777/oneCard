<template>
  <el-upload
    class="file-upload"
    with-credentials
    :data="params"
    :before-upload="beforeAvatarUpload"
    :before-remove="beforeRemove"
    show-file-list
    :limit="1"
    :on-exceed="handleExceed"
    multiple
    v-model:file-list="fileList"
    :http-request="customRequest"
  >
    <el-button round size="small">
      <el-icon><Link /></el-icon>
      选择文件
    </el-button>
    <template #tip>
      <div class="el-upload__tip">添加附件 | 单个附件不超过10MB</div>
    </template>
  </el-upload>
</template>

<script setup>
import OrgAPI from "@/api/org";
import SparkMD5 from "spark-md5";
import axios from "axios";
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);
const fileList = ref(props.modelValue);
const reset = () => {
  emit("update:modelValue", []);
};
const dialogImageUrl = ref("");
const dialogVisible = ref(false);
const params = ref({
  isImg: false,
});

// 计算MD5
// function calculateFileMd5(file) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     const spark = new SparkMD5.ArrayBuffer();

//     reader.onload = (e) => {
//       spark.append(e.target.result);
//       resolve(spark.end());
//     };

//     reader.onerror = reject;

//     reader.readAsArrayBuffer(file);
//   });
// }

// // 上传文件到预签名 URL
// const customRequest = async (request) => {
//   const { file, onSuccess, onError } = request;

//   // 确保 file 是一个对象且具有必要的属性
//   if (typeof file === "object" && file instanceof File) {
//     const fileMd5 = await calculateFileMd5(file);
//     const initData = {
//       fileMd5,
//       fullFileName: file.name,
//       fileSize: file.size,
//       isPrivate: false,
//     };

//     // 初始化
//     const initResponse = await OrgAPI.fileInit(initData);
//     const fileKey = initResponse.fileKey;
//     // 检查初始化响应中的 isDone
//     if (initResponse.isDone) {
//       // 如果 isDone 为 true，直接调用  上传完成接口
//       handleSuccess({ fileKey }, file, fileList.value);
//     } else {
//       // 否则，获取预签名 URL 并上传文件
//       const preSignedUrl = initResponse.preSignedUrl;

//       if (!preSignedUrl) {
//         throw new Error("预签名 URL 无效");
//       }

//       const uploadResponse = await uploadFile(
//         preSignedUrl,
//         file,
//         file.type,
//         fileMd5
//       );

//       // 上传完成后，调用
//       handleSuccess({ fileKey }, file, fileList.value);
//     }
//   }
// };

// // 上传文件到预签名 URL
// const uploadFile = async (url, file, fileMimeType, fileMd5) => {
//   return axios.put(url, file, {
//     headers: [
//       {
//         "Content-MD5": fileMd5,
//       },
//       { "Content-Type": fileMimeType },
//     ],
//   });
// };
const beforeAvatarUpload = async (file) => {
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    ElMessage.error("附件大小不能超过10MB!");
    return false;
  }
  return isLt10M;
};
// const uploadFileList = [];
// // 上传成功后的处理函数
// const handleSuccess = async (response, file, fileList) => {
//   // ElMessage.success(`${file.name} 上传成功`);
//   // 上传完成
//   const complete = await OrgAPI.fileComplete(response.fileKey);

//   const { url, isImage, fileKey, name, size } = complete.attachmentVO;
//   const updatedFileList = fileList.map((f) => {
//     if (f.name == name) {
//       f.url = url || null;
//       f.fileKey = fileKey;
//       f.isImage = isImage;
//     }
//     return f;
//   });
//   fileList.value = updatedFileList;
//   // 更新组件的 fileList
//   emit("update:modelValue", updatedFileList);

//   // 检查 complete 中的 isComplete 状态
//   if (!complete.isComplete) {
//     ElMessage.error(`文件 ${file.name} 上传失败，请重试`);
//   }
// };

const fileName = ref("");
const fileUrl = ref("");
const isImage = ref();

const customRequest = async (options) => {
  const { file } = options;
  console.log("file", file);
  // 限制最大上传文件大小为 100MB
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB 转换为字节数

  // 检查文件大小
  if (file.size > MAX_FILE_SIZE) {
    ElMessage.error("文件大小超过最大限制（100MB）");
    return; // 如果文件太大，停止上传
  }

  try {
    // 创建 FormData 对象并将文件添加到其中
    const formData = new FormData();
    formData.append("file", file);

    // 打印 FormData 的内容
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }

    // 调用接口发送文件
    const res = await OrgAPI.fileUpload(formData); // 直接调用 fileUpload 上传文件
    fileName.value = res.name;
    fileUrl.value = res.url;
    isImage.value = res.isImage;

    ElMessage.success("文件上传成功");

    const updatedFileList = fileList.value.map((f) => {
      console.log("f", f);
      if (f.name == fileName.value) {
        f.url = fileUrl.value || null;
        f.isImage = isImage;
      }
      return f;
    });
    fileList.value = updatedFileList;
    console.log("fileList", fileList.value);
    // 更新组件的 fileList
    emit("update:modelValue", updatedFileList);
  } catch (error) {
    // console.log("上传失败", error);
    ElMessage.error("文件上传失败");
  }
};

const handleRemove = (_, fileList) => {
  handleUpdateValue(fileList);
};

// const handleUpdateValue = (fileList) => {
//   const files = fileList.map((file) => ({
//     name: file.name,
//     url: url.value || "",
//     size: file.size,
//     fileKey: fileKey.value,
//     isImage: isImage.value,
//   }));
//   emit("update:modelValue", files);
// };

const handlePictureCardPreview = (file) => {
  dialogImageUrl.value = file.url;
  dialogVisible.value = true;
};
// 处理图片超出限制的情况
const handleExceed = () => {
  ElMessage.warning("最多只能上传1个附件");
};
// 监听 value 的变化来重置组件
watch(
  () => props.modelValue,
  (newValue) => {
    fileList.value = Array.isArray(newValue)
      ? newValue.map((file) => ({ ...file }))
      : [];
  }
);
</script>
<style lang="scss" scoped>
:deep(.el-upload-list) {
  width: 300px;
}
</style>
