<script setup>
import { computed, ref } from "vue";
import OrgAPI from "@/api/org";
// import { ApiResponse } from "@/api/org/model";
import { useGroupManagement } from "./component/AddGroup";
const props = defineProps({
  modelValue: Object,
  isEdit: Boolean,
  originalName: String,
});
const form = ref();

defineExpose({ validate });

const _value = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});

// 定义流程类型选项数组
const options = [
  { label: "报销", value: "BX" },
  { label: "借款", value: "JK" },
  { label: "备用金", value: "BYJ" },
  { label: "转正", value: "ZZ" },
  { label: "离职", value: "LZ" },
];
// 结构新增分组的方法
const {
  groupList,
  addGroupDialogVisible,
  Gform,
  showAddGroupModal,
  findAllGroup,
  addGroup,
} = useGroupManagement();

// const groupList = ref([]);
// const addGroupDialogVisible = ref(false);
// // 表单数据对象，分组名称
// const Gform = ref({
//   name: "",
// });
// const showAddGroupModal = () => {
//   addGroupDialogVisible.value = true;
// };
// // 获取流程分组列表
// const group = () => {
//   OrgAPI.getGroup().then((rsp) => {
//     groupList.value = rsp;
//   });
// };
// // 新增分组
// const addGroup = () => {
//   OrgAPI.addGroup(Gform.value.name).then((rsp) => {
//     // 添加成功，关闭对话框并清空表单数据
//     addGroupDialogVisible.value = false;
//     Gform.value.name = "";
//     ElMessage.success("新增分组成功");
//     // 获取分组列表
//     group();
//   });
// };
function validate() {
  return new Promise((resolve, reject) => {
    form.value
      .validate()
      .then(() => resolve())
      .catch((err) => {
        reject(Object.keys(err).map((v) => err[v][0].message));
      });
  });
}

const rules = {
  name: [
    { required: true, message: "请设置流程表单名称", trigger: "blur" },
    { min: 2, max: 20, message: "流程表单名称长度在2~20", trigger: "blur" },
    {
      validator: validateUniqueName,
      trigger: "blur",
    },
  ],
  groupId: [{ required: true, message: "请设置流程表单分组", trigger: "blur" }],
  processCode: [{ required: true, message: "请设置流程编号", trigger: "blur" }],
};
// 自定义规则
function validateUniqueName(rule, value, callback) {
  if (!groupList.value || !Array.isArray(groupList.value)) {
    return callback(new Error("分组列表未正确加载"));
  }

  const selectedGroupId = _value.value.groupId;

  const originalName = props.originalName;
  const newName = value;
  const isEdit = props.isEdit;
  // console.log(selectedGroupId, originalName, newName, isEdit);

  if (isEdit && originalName == newName) {
    callback();
    return;
  }

  for (const group of groupList.value) {
    if (
      group.id === selectedGroupId &&
      group.items.some((item) => item.formName === value)
    ) {
      callback(new Error("同分组流程表单名称不能相同"));
      return;
    }
  }
  callback();
}

const iconList = [
  "bi:people-fill",
  "gridicons:multiple-users",
  "icon-park-solid:appointment",
  "icon-park-solid:people",
  "fluent:people-add-24-filled",
  "material-symbols:person-cancel-rounded",
  "ph:coffee-fill",
  "ph:sneaker-move-fill",
  "solar:money-bag-bold",
  "healthicons:money-bag",
  "solar:wallet-money-bold",
  "f7:money-yen-circle-fill",
  "entypo:aircraft",
  "entypo:aircraft-take-off",
  "mingcute:bus-2-fill",
  "mingcute:car-fill",
  "mingcute:train-fill",
  "fluent:handshake-20-filled",
  "icon-park-solid:buy",
  "mingcute:hand-card-fill",
  "icon-park-solid:time",
  "mdi:gift",
  "bxs:map",
  "ph:fingerprint-fill",
  "mdi:customer-service",
  "icon-park-solid:general-branch",
  "bx:bxs-purchase-tag",
  "mdi:notebook-edit",
  "simple-icons:opsgenie",
  "streamline:business-user-curriculum-solid",
  "fa6-solid:business-time",
  "mdi:google-my-business",
  "mdi:qqchat",
  "mdi:wechat",
  "bxs:message-square-detail",
  "mingcute:send-plane-fill",
  "tabler:mail-filled",
  "material-symbols:folder-open",
  "icon-park-solid:computer",
  "material-symbols:laptop-mac-outline",
  "fluent:phone-vibrate-20-filled",
  "fluent:form-28-filled",
  "file-icons:omnigraffle",
  "material-symbols:assignment-turned-in",
  "mingcute:card-refund-fill",
  "mingcute:wechat-miniprogram-fill",
  "whh:phonebookalt",
  "ri:database-2-fill",
  "ph:bank-fill",
  "material-symbols:school",
  "iconamoon:smiling-face-fill",
  "solar:sad-circle-bold",
  "ri:hearts-fill",
  "mdi:qrcode-scan",
  "fluent:calendar-cancel-16-filled",
  "ion:videocam",
  "material-symbols:play-circle",
  "jam:unsplash",
  "ph:film-reel-fill",
  "icon-park-solid:noodles",
  "dashicons:food",
  "fluent:food-cake-16-filled",
  "mdi:food",
  "material-symbols:delete",
  "material-symbols:edit-document",
  "material-symbols:chart-data",
  "ph:chart-pie-slice-fill",
];
onMounted(() => {
  findAllGroup();
});
</script>

<template>
  <el-main class="w-designer-base">
    <el-form ref="form" :rules="rules" :model="_value" label-position="top">
      <el-form-item prop="icon" label="设置图标">
        <iconify
          :icon="_value.icon.name"
          class="w-process-icon"
          :style="{ background: _value.icon.bgc, color: _value.icon.color }"
        />
        <div style="margin: 0 40px">
          <el-text>选择背景色：</el-text>
          <el-color-picker v-model="_value.icon.bgc" />
        </div>
        <div style="display: flex; align-items: center">
          <el-text>选择图标：</el-text>
          <el-popover placement="bottom-start" width="402" trigger="click">
            <div class="w-icons">
              <iconify
                class="w-icons-ico"
                @click="_value.icon.name = ico"
                :icon="ico"
                v-for="ico in iconList"
                :key="ico"
              />
              <div
                style="width: 31px; height: 0"
                v-for="(i, index) in 12"
                :key="index"
              ></div>
            </div>
            <template #reference>
              <iconify
                class="w-p-icon"
                style="padding: 0"
                :icon="_value.icon.name"
              />
            </template>
          </el-popover>
        </div>
      </el-form-item>
      <el-form-item prop="name" required label="流程名称">
        <el-input v-model="_value.name" placeholder="请设置流程名" />
      </el-form-item>
      <el-form-item prop="processCode" required label="流程编号">
        <el-input v-model="_value.processCode" placeholder="请设置流程编号" />
      </el-form-item>
      <el-form-item prop="processType" label="流程类型">
        <el-select v-model="_value.processType" placeholder="请选择流程类型">
          <!-- 使用 v-for 遍历 options 数组 -->
          <el-option
            v-for="option in options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="groupId" required label="流程分组">
        <el-select
          style="width: calc(100% - 140px); padding-right: 20px"
          v-model="_value.groupId"
          placeholder="请选择流程分组"
        >
          <el-option
            :value="group.id"
            :label="group.group_name"
            v-for="(group, index) in groupList"
            :key="index"
          />
        </el-select>
        <el-button
          style=" float: right;width: 120px"
          type="primary"
          icon="plus"
          @click="showAddGroupModal"
          >新建分组</el-button
        >
      </el-form-item>
      <el-form-item label="备注说明">
        <el-input
          v-model="_value.remark"
          show-word-limit
          maxlength="128"
          :rows="3"
          type="textarea"
          placeholder="流程备注说明信息"
        />
      </el-form-item>
    </el-form>
    <!-- 新增分组弹框 -->
    <el-dialog
      title="新增分组"
      v-model="addGroupDialogVisible"
      width="30%"
      :before-close="handleClose"
    >
      <el-form :model="Gform">
        <el-form-item label="分组名称">
          <el-input v-model="Gform.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addGroupDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addGroup"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
  </el-main>
</template>

<style lang="scss" scoped>
.w-designer-base {
  width: 650px;
  min-height: calc(100vh - 100px);
  margin: 0 auto;
  background-color: white;
  border-radius: 5px;
}

.w-p-icon {
  font-size: 20px;
  color: var(--el-color-info);
  cursor: pointer;
}

.w-icons {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-height: 400px;
  padding: 2px;
  overflow: auto;

  .w-icons-ico {
    width: 25px;
    height: 25px;
    padding: 3px;
    cursor: pointer;
    border-radius: 2px;

    &:hover {
      box-shadow: 0 0 3px 0 #9b9595;
    }
  }
}
</style>
