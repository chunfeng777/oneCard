<template>
  <div>
    <div v-if="mode === 'free'">
      <el-button size="small" round
        ><el-icon><Paperclip /></el-icon>选择文件</el-button
      >
    </div>
    <div v-else>
      <el-upload
        with-credentials
        :data="uploadParams"
        show-file-list
        :limit="maxNumber"
        :before-upload="beforeUpload"
        :before-remove="beforeRemove"
        :accept="acceptFileTypes"
        :on-exceed="handleExceed"
        :on-remove="handleRemove"
        v-model:file-list="_value"
        :http-request="customRequest"
      >
        <el-button size="small" round
          ><el-icon><Paperclip /></el-icon>选择文件</el-button
        >
      </el-upload>
    </div>
  </div>
</template>

<script setup>
import FormComponentMixin from "../FormComponentMixin.ts";
import OrgAPI from "@/api/org";
import SparkMD5 from "spark-md5";
import axios from "axios";

const props = defineProps({
  ...FormComponentMixin.props,
  placeholder: {
    type: String,
    default: "请选择附件",
  },
  value: {
    type: Array,
    default: () => [],
  },
  maxSize: {
    type: Number,
    default: 10,
  },
  maxNumber: {
    type: Number,
    default: 1,
  },
  fileTypes: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([...FormComponentMixin.emits]);
const _value = computed(FormComponentMixin.computed._value(props, emit));
// const _value = computed(() => {
//   const value = FormComponentMixin.computed._value(props, emit);
//   return Array.isArray(value) ? value : [];
// });
const uploadParams = ref({});

// const fileKey = ref("");
// const url = ref("");

// 计算 `accept` 属性的值，将文件类型数组转换为逗号分隔的字符串
const acceptFileTypes = computed(() => {
  return props.fileTypes.length > 0 ? props.fileTypes.join(",") : "";
});
// 处理图片超出限制的情况
const handleExceed = () => {
  ElMessage.warning(`最多只能上传 ${props.maxNumber}个附件`);
};

// const handleRemove = (file, newFileList) => {
//   _value.value = newFileList;
//   emit("update:value", newFileList);
// };

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
// const initResponse = await OrgAPI.fileInit(initData);
//     fileKey.value = initResponse.fileKey;
//     // 检查初始化响应中的 isDone
//     if (initResponse.isDone) {
//       // 如果 isDone 为 true，直接调用上传完成接口
//       handleSuccess({ fileKey: initResponse.fileKey }, file, _value.value);
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
//       handleSuccess({ fileKey: initResponse.fileKey }, file, _value.value);
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

// // 上传成功后的处理函数
// const handleSuccess = async (response, file, _value) => {
//   // 更新文件列表中的文件对象，添加 URL 属性
//   const updatedFileList = _value.map((item) => {
//     if (item.uid === file.uid) {
//       console.log("file", file);
//       return {
//         ...item,
//         fileKey: fileKey.value, // 添加 URL 属性
//       };
//     }
//     return item;
//   });
//   _value.value = updatedFileList;
//   handleUpdateValue(updatedFileList);
//   // 上传完成
//   const complete = await OrgAPI.fileComplete(fileKey.value);
//   // const fileUrl = complete.attachmentVO.url;
//   // console.log("url", fileUrl);

//   // 检查 complete 中的 isComplete 状态
//   if (!complete.isComplete) {
//     ElMessage.error(`文件 ${file.name} 上传失败，请重试`);
//   }
// };

const fileName = ref("");
const fileUrl = ref("");

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

    ElMessage.success("文件上传成功");

    //   // 更新文件列表中的文件对象，添加 URL 属性
    const updatedFileList = _value.value.map((item) => {
      if (item.uid === file.uid) {
        // console.log("file", file);
        return {
          ...item,
          url: fileUrl.value, // 添加 URL 属性
        };
      }
      return item;
    });
    _value.value = updatedFileList;
    handleUpdateValue(updatedFileList);
  } catch (error) {
    // console.log("上传失败", error);
    ElMessage.error("文件上传失败");
  }
};

// 删除
// const handleRemove = () => {
//   OrgAPI.fileDelete(fileUrl.value)
//     .then(() => {
//       ElMessage.success("文件删除成功");
//       filename.value = "";
//       fileUrl.value = "";
//       _value.value = []; // 清空文件列表
//     })
//     .catch((error) => {
//       console.error("文件删除失败", error);
//     });
// };

// 在删除文件之前进行确认提示
const beforeRemove = () => {
  return ElMessageBox.confirm("确定要删除该文件吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 如果用户确认，返回true以继续删除
      return true;
    })
    .catch(() => {
      // 如果用户取消，返回false以阻止删除
      return false;
    });
};
// 检查文件大小和类型
const beforeUpload = (file) => {
  if (props.maxSize > 0 && file.size / 1024 / 1024 > props.maxSize) {
    ElMessage.warning(`文件大小不应超过 ${props.maxSize}MB`);
    return false;
  }
  if (props.fileTypes.length > 0 && !props.fileTypes.includes(file.type)) {
    ElMessage.warning(`只允许上传以下文件类型: ${props.fileTypes.join(", ")}`);
    return false;
  }
  return true;
};
const handleUpdateValue = (newFileList) => {
  _value.value = newFileList;
  emit("update:value", newFileList);
};
</script>

<style lang="scss" scoped>
:deep(.el-upload-list) {
  width: 300px;
}
</style>
