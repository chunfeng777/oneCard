<template>
  <div>
    <div class="content">
      <el-card v-for="dept in deptList" :key="dept.deptId" class="dept-card">
        <template #header>
          <div>
            <div class="dept-name">{{ dept.deptName }}</div>
          </div>
        </template>
        <div class="user-list">
          <el-scrollbar v-if="dept.users.length > 5" style="max-height: 300px">
            <div>
              <div v-for="user in dept.users" :key="user.id">
                <el-card
                  class="cardList"
                  shadow="always"
                  @click="handleUserClick(user)"
                  >{{ user.nickname }}</el-card
                >
              </div>
            </div>
          </el-scrollbar>
          <div v-else>
            <div v-for="user in dept.users" :key="user.id">
              <el-card
                class="cardList"
                shadow="always"
                @click="handleUserClick(user)"
                >{{ user.nickname }}</el-card
              >
            </div>
          </div>
        </div>
      </el-card>
    </div>
    <!-- 对话框 -->
    <el-dialog v-model="dialogVisible" title="详情" fullscreen>
      <div class="dialog-header">
        <div class="dialog-header-left">
          <span>{{ data?.deptName }}</span>
          <span>{{ data?.number }}</span>
          <span>{{ data?.realName }}</span>
        </div>
        <DateToggle
          :selectedDate="selectedDate"
          @date-change="handleDateChange"
        />
      </div>
      <el-divider> 工作内容与总结 </el-divider>
      <el-form v-if="data" :model="data" ref="formRef">
        <el-form-item label="内容" prop="reportDailyBS">
          <el-table :data="data?.reportDailyBS" border>
            <el-table-column prop="startTime" label="目标">
              <template #default="{ row }">
                <el-input
                  v-model="row.workObjective"
                  disabled
                  type="textarea"
                />
              </template>
            </el-table-column>

            <el-table-column prop="startTime" label="内容">
              <template #default="{ row }">
                <el-input v-model="row.workContent" disabled type="textarea" />
              </template>
            </el-table-column>

            <el-table-column
              prop="plannedEndTime"
              label="计划结束时间"
              width="250"
            >
              <template #default="{ row }">
                <el-date-picker
                  v-model="row.plannedEndTime"
                  type="datetime"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  disabled
                />
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="140">
              <template #default="{ row }">
                <el-select v-model="row.status" disabled>
                  <el-option label="已完成" :value="1" />
                  <el-option label="未完成" :value="0" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              prop="deadlineTime"
              label="截止完成时间"
              width="250"
            >
              <template #default="{ row }">
                <el-date-picker
                  v-model="row.deadlineTime"
                  type="datetime"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  disabled
                />
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="总结" prop="workSummary">
          <el-input
            v-model="data.workSummary"
            type="textarea"
            :rows="5"
            disabled
          />
        </el-form-item>
      </el-form>
      <!-- <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="dialogVisible = false">
            确定
          </el-button>
        </div>
      </template> -->
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import UserAPI from "@/api/user";
import DateToggle from "./components/DateToggle.vue";
import DailyAPI from "@/api/daily";
import { Dept } from "@/api/user/model";
import { DailyData } from "@/api/daily/model";
const data = ref<DailyData | null>(null);

const deptList = ref<Dept[]>([]);

// 控制对话框的显示和隐藏 （默认为隐藏）
const dialogVisible = ref(false);
const startTime = ref(null);
const selectedDate = ref("");
const userId = ref();

const handleUserClick = async (user: any) => {
  userId.value = user.id;

  const res = startTime.value
    ? await DailyAPI.queryDaily(userId.value, startTime.value)
    : await DailyAPI.queryDaily(userId.value);

  data.value = res;

  // selectedDate.value = res.startTime;
  // 如果 res.startTime 为空，则获取当前时间
  selectedDate.value = res.startTime || new Date().toISOString().split("T")[0]; // 获取当前日期，格式为 YYYY-MM-DD
  // console.log(selectedDate.value);

  dialogVisible.value = true;
};

const handleDateChange = (date: string) => {
  DailyAPI.queryDaily(userId.value, date).then((res) => {
    data.value = res;
    // console.log(res);
  });
};

const deptData = async () => {
  const res = await UserAPI.getAllDeptWithUsers();
  deptList.value = res;
};
onMounted(() => {
  deptData();
});
</script>

<style lang="scss" scoped>
.content {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  padding: 20px;
}

.dept-card {
  height: 400px; // 设置卡片高度
}

.user-list {
  height: 320px; // 设置用户列表高度
  overflow-y: auto; // 添加垂直滚动
}

.dept-name {
  display: flex;
  justify-content: center;
}

.cardList {
  gap: 4px;
  width: 100%;
  margin-bottom: 10px;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  span {
    margin: 0 30px 0 0;
  }
}
</style>
