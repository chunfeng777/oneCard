<template>
  <div>
    <div>
      <el-card v-for="item in formGroup" :key="item" class="pro-card">
        <template #header>
          <div class="card-header">
            <span>{{ item.group_name }}</span>
          </div>
        </template>

        <div class="pro-content">
          <div
            class="image-and-text-group"
            v-for="it in item.items"
            :key="it"
            @click="openDialog(it)"
          >
            <el-tooltip effect="dark" placement="right" :content="it.formName">
              <template #content>
                {{ it.formName }}
              </template>
              <iconify
                :icon="it.icon.name"
                class="w-process-icon"
                :style="{
                  background: it.icon.bgc,
                  color: it.icon.color,
                }"
              />
            </el-tooltip>
            <span class="process-name">{{ truncatedName(it.formName) }}</span>
          </div>
        </div>
      </el-card>
    </div>
    <el-dialog
      style="min-width: 800px"
      destroy-on-close
      v-model="dialogVisible"
      :title="`发起 - ${processTitle}`"
    >
      <sponsor-process ref="sponsorProcess" v-model="processDetail" />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitDialog"> 提交 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import OrgAPI from "@/api/org";
import SponsorProcess from "./component/SponsorProcess.vue";
import { useUserStore } from "@/store/modules/user";
const dialogVisible = ref(false);
const formGroup = ref([]);
const processDetail = ref(null);
const sponsorProcess = ref();
const processTitle = ref(null);
const userStore = useUserStore();
const employeeNum = userStore.user.employeeNum;
// console.log("用户绑定的员工编号:", employeeNum);
const truncatedName = (name) => {
  return name.length > 5 ? name.substring(0, 5) + "..." : name;
};

const getCurrentMonthDay = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${month}${day}`;
};
// console.log("当前日期:", getCurrentMonthDay());
const openDialog = (it) => {
  processDetail.value = it.templateId;
  processTitle.value = it.formName; // 拿到模板名称

  dialogVisible.value = true;
};
// 查询所有表单分组
const getFormGroup = () => {
  OrgAPI.getFormGroup().then((rsp) => {
    // 解析 JSON 字符串并更新 formGroup
    const parsedFormGroup = rsp.map((item) => ({
      ...item,
      items: item.items.map((it) => ({
        ...it,
        icon: JSON.parse(it.icon),
      })),
    }));
    formGroup.value = parsedFormGroup;
  });
};
function checkProcessUsers(processData) {
  // 递归遍历 process 数据
  function traverse(node) {
    // 确保节点是对象且不为 null
    if (typeof node === "object" && node !== null) {
      // 检查当前节点是否符合条件
      if (
        (node.type === "Approval" || node.type === "Cc") &&
        node.props.ruleType === "ROOT_SELECT"
      ) {
        return true; // 满足条件
      }

      // 检查并遍历 branch 属性中的每个节点
      if (node.branch) {
        if (Array.isArray(node.branch)) {
          for (let branch of node.branch) {
            // 如果 branch 是数组
            if (Array.isArray(branch)) {
              for (let subNode of branch) {
                const result = traverse(subNode);
                if (result === true) return true; // 发现符合条件的节点则返回 true
              }
            } else {
              // 递归遍历单个节点
              const result = traverse(branch);
              if (result === true) return true; // 发现符合条件的节点则返回 true
            }
          }
        }
      }
    }
    return false; // 不满足条件
  }

  // 开始遍历数据
  return traverse(processData);
}

// 提交 开始流程
const submitDialog = () => {
  const formData = [];
  const processCode = sponsorProcess.value.processDetail.processCode;
  // console.log("processCode流程编号:", processCode);

  const currentMonthDay = getCurrentMonthDay(); //获取当前日期
  const combinedString = `${employeeNum}${processCode}${currentMonthDay}`; //拼接字符串
  // console.log("拼接后的字符串:", combinedString);

  const isId = isIdMatch(
    sponsorProcess.value.processccUsers,
    sponsorProcess.value.processUsers
  );
  if (!isId) {
    ElMessage.error("请完善流程选项!");
    return;
  }

  if (sponsorProcess.value) {
    sponsorProcess.value.$refs.formRef.validate((valid) => {
      if (valid) {
        console.log("submit!");
        // 执行你在 sponsorProcess 里的逻辑
        sponsorProcess.value.formData.components.forEach((item) => {
          const value = sponsorProcess.value.formData[item.key];
          if (value) {
            formData.push({
              id: item.key,
              value,
            });
          }
        });
        const designData = {
          processDefinitionId:
            sponsorProcess.value.processDetail.processDefinitionId,
          formData: formData,
          processUsers: sponsorProcess.value.processUsers,
          processNumber: combinedString,
          processType: sponsorProcess.value.processDetail.processType,
        };

        OrgAPI.startProcess(designData).then((rsp) => {
          ElMessage.success("提交成功");
          dialogVisible.value = false;
        });
      } else {
        console.log("error submit!");
      }
    });
  }
};

const isIdMatch = (arr1, arr2) => {
  return arr1.every((item) => {
    return arr2.some((i) => i.nodeId === item.nodeId);
  });
};

onMounted(() => {
  getFormGroup();
});
</script>
<style scoped>
.pro-card {
  margin: 10px;
  border-radius: 10px;
}

.pro-content {
  display: flex; /* 设置为横向布局 */
  flex-wrap: wrap;
  gap: 1rem; /* 设置两个组之间的间距 */
}

.image-and-text-group {
  display: flex;
  flex-direction: column; /* 设置为垂直排列 */
  gap: 0.5rem; /* 图片与文本之间的间距 */
  align-items: center; /* 水平居中对齐 */
  width: 100px;
}

.process-name {
  font-size: 14px;
  color: #5c5959;
}
</style>
