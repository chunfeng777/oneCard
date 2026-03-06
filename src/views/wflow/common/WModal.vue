<template>
  <div>
    <el-dialog
      v-model="visible"
      :title="modalTitle"
      width="500px"
      @close="handleClose"
    >
      <el-form>
        <!-- 文本区域输入框 -->
        <el-form-item>
          <el-input
            ref="textarea"
            type="textarea"
            v-model="inputValue"
            :placeholder="inputPlaceholder"
            maxlength="255"
            rows="4"
            show-word-limit
            @input="adjustTextareaHeight"
          />
        </el-form-item>
        <!-- 图片上传组件 -->
        <el-form-item>
          <image-upload v-model="imageFiles" :key="uploadKey" />
        </el-form-item>
        <!-- 文件上传组件 -->
        <el-form-item>
          <file-upload v-model="fileFiles" :key="uploadKey" />
        </el-form-item>
        <!-- 签名 -->
        <el-form-item
          v-if="
            (props.type === 'approve' || props.type === 'reject') &&
            shouldShowSignatureButton
          "
        >
          <el-button @click="toggleSignature"
            ><i-ep-EditPen />点击签字</el-button
          >
          <div v-if="showSignature">
            <p>请使用鼠标签字：</p>
            <vue-esign
              class="signature-box"
              ref="esign"
              :width="800"
              :height="300"
              :isCrop="isCrop"
              :lineWidth="lineWidth"
              :lineColor="lineColor"
              v-model:bgColor="bgColor"
            />
            <div class="signature-controls">
              <el-button size="mini" @click="clearSignature"
                >清空画板</el-button
              >
              <el-button size="mini" type="primary" @click="handleSignatureEnd"
                >确认签名</el-button
              >
            </div>
          </div>
        </el-form-item>
        <!-- 显示签名预览 -->
        <el-form-item v-if="signatureData">
          <div>
            <p>您的签名预览：</p>
            <img :src="signatureData" class="signature-image" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="mini" @click="handleClose">取 消</el-button>
        <el-button size="mini" type="primary" @click="confirmAction"
          >确 定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import ImageUpload from "@/views/wflow/common/ImageUpload.vue";
import FileUpload from "@/views/wflow/common/FileUpload.vue";
import vueEsign from "vue-esign";
import OrgAPI from "@/api/org";
const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  show: {
    type: Boolean,
    required: true,
  },
  processInstanceId: {
    type: String,
    default: "",
  },
  taskId: {
    type: String,
    default: "",
  },
  progress: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["close", "update:value", "processCompleted"]);
// 控制对话框显示与隐藏的状态
const visible = ref(props.show);
const imageFiles = ref([]);
const fileFiles = ref([]);
const inputValue = ref("");
const textarea = ref(null);

// 通过上传组件的 key 属性强制重新渲染组件
const uploadKey = ref(0);

const esign = ref(null); // 为签名组件设置正确的 ref
const showSignature = ref(false);
const isCrop = ref(false);
const lineWidth = ref(2);
const lineColor = ref("#000000");
const bgColor = ref("#ffffff");
const signatureData = ref(""); // 用于存储签名的图像数据

const toggleSignature = () => {
  showSignature.value = !showSignature.value;
};

// 处理签名完成的逻辑
const handleSignatureEnd = () => {
  const esignInstance = esign.value;
  // console.log("签名组件实例:", esignInstance);
  if (esignInstance) {
    // 获取签名的 base64 图像数据
    esignInstance.generate().then((base64Data) => {
      // console.log("签名的 base64 数据:", base64Data);
      signatureData.value = base64Data;
      showSignature.value = false; // 关闭签名区域显示
    });
  }
};

// 是否显示签名按钮的判断
const shouldShowSignatureButton = computed(() => {
  // 判断审批人是否需要显示签字按钮
  return (
    props.progress &&
    props.progress.some((item) => item.type === "APPROVAL" && item.sign)
  );
});

// 清空签名画板
const clearSignature = () => {
  const esignInstance = esign.value;
  if (esignInstance) {
    esignInstance.reset(); // 这里调用 vue-esign 组件的 reset 方法来清空签名
  }
  signatureData.value = ""; // 清空签名数据
  showSignature.value = true; // 重新显示签名区域
};

watch(
  () => props.show,
  (newVal) => {
    visible.value = newVal;
    if (newVal) {
      nextTick(() => {
        adjustTextareaHeight(); // 打开弹窗时调整高度
      });
    } else {
      // 清空数据
      resetData();
    }
  }
);
// 标题
const modalTitle = computed(() => {
  switch (props.type) {
    case "comment":
      return "添加评论";
    case "approve":
      return "提交审批";
    case "reject":
      return "拒绝审批";
    case "revoke":
      return "撤销当前流程";
    default:
      return "";
  }
});
// 输入框提示文
const inputPlaceholder = computed(() => {
  switch (props.type) {
    case "comment":
      return "评论内容";
    case "approve":
      return "备注";
    case "reject":
      return "驳回意见";
    case "revoke":
      return "撤销原因";
    default:
      return "请输入内容";
  }
});
const handleClose = () => {
  emit("close");
  resetData(); // 清空数据
  // 增加 key，强制重新渲染上传组件
  uploadKey.value += 1;
};

// 清空数据
const resetData = () => {
  inputValue.value = "";
  imageFiles.value = [];
  fileFiles.value = [];
  signatureData.value = ""; // 重置签名数据
  showSignature.value = false;
};

const confirmAction = async () => {
  const collectedData = {
    inputText: inputValue.value, // 文本框内容
    imageFiles: imageFiles.value, // 上传的图片文件
    fileFiles: fileFiles.value, // 上传的其他文件
    signatrue: signatureData.value, // 签名的 base64 数据
  };

  console.log("收集到的数据:", collectedData); // 收集到的数据

  // 通过事件将数据传递给父组件处理
  emit("update:value", collectedData);
  const req = {
    processInstanceId: props.processInstanceId,
    taskId: props.taskId,

    attachments: [
      ...collectedData.imageFiles,
      ...collectedData.fileFiles,
      // collectedData.signatrue ? { signatrue: collectedData.signatrue } : {},
    ],
    comments: collectedData.inputText || "",
    signatrue: collectedData.signatrue,
  };

  switch (props.type) {
    case "approve":
      // 同意
      await OrgAPI.agreeBtn(req);
      ElMessage.success("审批同意成功");
      break;
    case "reject":
      // 驳回
      await OrgAPI.rollbackBtn(req);
      ElMessage.success("审批驳回成功");
      break;
    case "revoke":
      // 撤销
      await OrgAPI.revokeBtn(req);
      ElMessage.success("流程撤销成功");
      break;
    case "comment":
      // 评论
      await OrgAPI.commentsBtn(req);
      ElMessage.success("评论添加成功");
      break;
    default:
      ElMessage.error("未知操作类型");
  }
  // 关闭弹窗
  emit("close");
  // 发送事件通知父组件
  emit("processCompleted", collectedData);
};

const adjustTextareaHeight = () => {
  const el = textarea.value.$el.querySelector("textarea");
  el.style.height = "auto"; // 先将高度设置为auto，以计算文本域的内容高度
  el.style.height = `${el.scrollHeight}px`; // 设置为内容的高度
};
</script>
<style scoped>
.signature-box {
  border: 1px dashed #ccc;
}

.signature-controls {
  margin-top: 10px;
}

.signature-image {
  max-width: 100%;
  height: auto;
  border: 1px solid #ccc;
}
</style>
