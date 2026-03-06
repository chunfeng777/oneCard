<template>
  <div class="w-form-designer">
    <el-card class="form-group-cards">
      <div class="btn">
        <div>
          <el-button type="primary" @click="navigateTo"
            ><i-ep-Plus />新建表单</el-button
          >
          <el-button type="success" @click="showAddGroupModal"
            ><i-ep-Plus />新建分组</el-button
          >
        </div>
        <span class="text"
          >分组内表单流程可拖拽排序，拖拽分组名右侧<i-ep-Rank />可对分组排序</span
        >
      </div>
      <vue-draggable
        v-model="groupList"
        :options="{ animation: 200, group: 'group-name', ghostClass: 'ghost' }"
        @end="onDragEnd"
        :disabled="!isDraggingEnabled"
      >
        <el-card
          v-for="(group, index) in groupList"
          :key="index"
          class="group-card"
          ><template #header>
            <div class="card-header">
              <div>
                <span>{{ group.group_name }}</span>
                <!-- <el-button link @click="toggleDrag"
                  ><i-ep-Rank
                    :style="{ color: isDraggingEnabled ? 'green' : 'gray' }"
                /></el-button> -->
                <el-button
                  link
                  @mouseover="enableDrag"
                  @mouseleave="disableDrag"
                >
                  <i-ep-Rank
                    :style="{ color: isDraggingEnabled ? 'green' : 'gray' }"
                  />
                </el-button>
              </div>

              <div>
                <el-button link @click="showModefigGroupModal(group)"
                  ><i-ep-edit />修改</el-button
                >
                <el-button link @click="deleteGroup(group)"
                  ><i-ep-delete />删除</el-button
                >
              </div>
            </div>
          </template>
          <div class="btnCreate" v-if="group.items.length === 0">
            <!-- <el-button @click="navigateTo()"><i-ep-plus />创建新表单</el-button> -->
          </div>
          <div class="form-cards-container" v-else>
            <vue-draggable
              v-model="group.items"
              :options="{
                animation: 200,
                group: 'items',
                ghostClass: 'ghost',
              }"
              @end="onDragEnd"
            >
              <div
                :body-style="{ padding: '10px' }"
                class="form-card"
                v-for="item in group.items"
                :key="item.templateId"
              >
                <el-row>
                  <el-col :span="6">
                    <div class="form-card-box">
                      <iconify
                        :icon="item.icon.name"
                        class="w-process-icon"
                        :style="{
                          background: item.icon.bgc,
                          color: item.icon.color,
                        }"
                      />
                      <el-text>{{ item.formName }}</el-text>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="form-card-box">
                      <el-text style="margin-top: 8px">{{
                        item.remark
                      }}</el-text>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="form-card-box">
                      <el-text style="margin-top: 8px"
                        >更新于: {{ item.updated }}</el-text
                      >
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="form-card-box">
                      <div style="margin-top: 8px">
                        <el-button type="primary" @click="handleEdit(item)" link
                          ><i-ep-edit />编辑</el-button
                        >
                        <el-button
                          type="danger"
                          @click="handleStatus(item)"
                          link
                          v-if="item.isStop === false"
                          ><i-ep-Close />停用</el-button
                        >
                        <el-button
                          type="primary"
                          @click="handleStatus(item)"
                          link
                          v-else
                          ><i-ep-Check />启用</el-button
                        >
                        <!-- 删除 -->
                        <el-button
                          type="primary"
                          @click="handleDelete(item)"
                          link
                          ><i-ep-delete />删除</el-button
                        >
                        <!-- 移动 -->
                        <el-popover
                          trigger="click"
                          placement="left"
                          :width="400"
                        >
                          <div class="radio-container">
                            <div
                              v-for="it in groupList"
                              :key="it.id"
                              class="radio-group"
                            >
                              <el-radio-group v-model="selectedGroupId">
                                <el-radio :value="it.id" size="large" border>{{
                                  it.group_name
                                }}</el-radio>
                              </el-radio-group>
                            </div>
                          </div>
                          <div class="submit-container">
                            <el-button
                              type="primary"
                              @click="handlePromotion(item)"
                            >
                              提交
                            </el-button>
                          </div>
                          <template #reference>
                            <el-button type="primary" link
                              ><i-ep-Promotion />移动</el-button
                            >
                          </template>
                        </el-popover>
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </vue-draggable>
          </div>
        </el-card>
      </vue-draggable>
    </el-card>
    <!-- 新增分组弹框 -->
    <el-dialog
      title="新增分组"
      v-model="addGroupDialogVisible"
      width="30%"
      :before-close="handleClose"
    >
      <el-form :model="Gform">
        <span>请输入要添加的组名</span>
        <el-form-item>
          <el-input v-model="Gform.name" placeholder="请输入分组名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addGroupDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addGroup"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 修改分组弹框 -->
    <el-dialog
      title="修改分组"
      v-model="modefiyGroupDialogVisible"
      width="30%"
      :before-close="handleClose"
    >
      <el-form :model="Gform" :rules="rules" ref="modifyGroupFormRef">
        <span>请输入新的组名</span>
        <el-form-item prop="name">
          <el-input v-model="Gform.name" placeholder="请输入分组名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="modefiyGroupDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="modefiyGroup(modifyGroupFormRef)">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { VueDraggable } from "vue-draggable-plus";
import { useRouter } from "vue-router";
import { useGroupManagement } from "@/views/wflow/admin/component/AddGroup";
import OrgAPI from "@/api/org";
const router = useRouter();

// 目标分组Id
const selectedGroupId = ref(null);
const isDraggingEnabled = ref(false);
// const toggleDrag = () => {
//   isDraggingEnabled.value = !isDraggingEnabled.value;
// };
const enableDrag = () => {
  isDraggingEnabled.value = true;
};

const disableDrag = () => {
  isDraggingEnabled.value = false;
};
// 结构新增分组的方法
const {
  groupList,
  addGroupDialogVisible,
  modefiyGroupDialogVisible,
  Gform,
  rules,
  modifyGroupFormRef,
  dialog,
  showAddGroupModal,
  showModefigGroupModal,
  findAllGroup,
  addGroup,
  modefiyGroup,
  deleteGroup,
} = useGroupManagement();
const navigateTo = () => {
  // console.log(group);
  router.push("/wflow/admin");
};
// 修改表单
const handleEdit = (item) => {
  const { templateId } = item;
  router.push({
    path: "/wflow/admin",
    query: {
      groupId: templateId,
    },
  });
};
// 修改表单状态
const handleStatus = (item) => {
  const { templateId, isStop } = item;
  let message = isStop ? "确定要启用？" : "确定要停用？";
  let successMessage = isStop ? "启用流程成功" : "停用流程成功";
  ElMessageBox.confirm(message, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    OrgAPI.editStatus(templateId, !isStop).then((rsp) => {
      ElMessage.success(successMessage);
      findAllGroup();
    });
  });
};

// 移动表单
const handlePromotion = (item) => {
  const { templateId } = item;
  const groupId = selectedGroupId.value;
  if (!groupId) {
    ElMessage.error("请选择分组");
    return;
  }
  // 移动
  OrgAPI.moveForm(templateId, groupId).then((rsp) => {
    ElMessage.success("移动到新分组成功");
    findAllGroup();
  });
};
// 删除
const handleDelete = (item) => {
  const { templateId } = item;
  ElMessageBox.confirm("确定要删除吗？", "删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    OrgAPI.deleteForm(templateId).then((rsp) => {
      ElMessage.success("删除成功");
      findAllGroup();
    });
  });
};
// 表单分组排序
const onDragEnd = async () => {
  const sortedGroups = groupList.value.map((item) => ({
    ...item,
    items: item.items.map((subItem) => ({
      ...subItem,
      icon: JSON.stringify(subItem.icon), // 将每个子项的icon字段转换为JSON字符串
    })),
  }));
  // console.log(sortedGroups);

  OrgAPI.sortGroup(sortedGroups).then((rsp) => {
    ElMessage.success("排序成功");
    findAllGroup();
  });
};

onMounted(() => {
  findAllGroup();
});
</script>
<style scoped>
.form-group-cards {
  gap: 10px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.btn .text {
  font-size: 14px;
  color: #e7c054;
}

.group-card {
  margin-bottom: 10px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-card {
  padding: 10px;
  border: 1px solid #f1f1f1;
  border-radius: 8px;
}

.form-card-box {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 为按钮容器添加样式 */
.form-card-box > div {
  display: flex;
  gap: 10px; /* 按钮之间的间距 */
  align-items: center;
}

.radio-container {
  display: flex;
  flex-wrap: wrap; /* 如果有太多项目，可以换行 */
  gap: 10px; /* 项目之间的间距 */
}

.submit-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px; /* 可选：与上方的单选框保持一些间距 */
}

.btnCreate {
  text-align: center;
}
</style>
