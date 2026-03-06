<template>
  <div class="top_date">
    <el-icon @click="prevDate" class="cursor-pointer"><ArrowLeft /></el-icon>
    <el-date-picker
      v-model="currentDate"
      type="date"
      format="YYYY-MM-DD"
      @change="handleDateChange"
      :disabled-date="disabledDate"
      placeholder="选择日期"
    />
    <el-icon
      :disabled="!isNextDateAvailable"
      :class="{ disabled: !isNextDateAvailable }"
      @click="nextDate"
      class="cursor-pointer"
      ><ArrowRight
    /></el-icon>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import dayjs from "dayjs";

const props = defineProps({
  selectedDate: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(["dateChange"]);

// const currentDate = ref<Date | null>(null);
const currentDate = ref<any>(null);
const latestDate = ref<any>(null); // 保存最新时间
const isNextDateAvailable = ref<boolean>(true); // 控制 ArrowRight 图标的显示

onMounted(() => {
  currentDate.value = new Date(props.selectedDate);
  latestDate.value = new Date(props.selectedDate); // 初始化最新时间
  checkNextDateAvailability(); // 更新日期时也检查可用性
});

watch(
  () => props.selectedDate,
  (newDate) => {
    currentDate.value = new Date(newDate);
    latestDate.value = new Date(newDate); // 更新最新时间
    checkNextDateAvailability(); // 更新日期时也检查可用性
    // console.log(currentDate.value);
  }
);

// 前一天
const prevDate = () => {
  // console.log(currentDate.value);
  const newDate = new Date(currentDate.value);
  newDate.setDate(newDate.getDate() - 1);
  currentDate.value = newDate;
  // console.log(currentDate.value);
  emit("dateChange", formatTime(currentDate.value));
  checkNextDateAvailability();
};

// 后一天
const nextDate = () => {
  const newDate = new Date(currentDate.value);
  newDate.setDate(newDate.getDate() + 1);
  currentDate.value = newDate;
  // console.log(currentDate.value);
  emit("dateChange", formatTime(currentDate.value));
  checkNextDateAvailability();
};

// 选择指定的日期
const handleDateChange = (date: Date) => {
  currentDate.value = date; // 更新为选择的日期
  emit("dateChange", formatTime(currentDate.value));
  checkNextDateAvailability();
};

// 检查下一个日期是否可用
const checkNextDateAvailability = () => {
  // console.log(currentDate.value);
  // console.log(latestDate.value);
  if (currentDate.value && latestDate.value) {
    const nextDate = new Date(currentDate.value);
    nextDate.setDate(nextDate.getDate() + 1);
    isNextDateAvailable.value = nextDate <= latestDate.value; // 如果下一个日期在最新日期之前，则可用
    // console.log(isNextDateAvailable.value);
  }
};

// 禁用日期的函数
const disabledDate = (date: Date) => {
  return date > latestDate.value; // 返回是否禁用该日期
};

const formatTime = (time: Date | null) => {
  if (!time) return "";
  return dayjs(time).format("YYYY-MM-DD");
};
</script>

<style lang="scss" scoped>
.top_date {
  display: flex;
  align-items: center;
}

/* 设置背景色为透明 */
:deep(.el-input__wrapper) {
  background-color: transparent;
  box-shadow: none;
}

:deep(.el-input__prefix) {
  display: none;
}

:deep(.el-input__suffix) {
  display: none;
}

:deep(.el-input) {
  width: 95px;
}

:deep(.el-input__inner) {
  padding: 0;
  color: black;
  border: none;
}

/* 添加禁用状态样式 */
.disabled {
  pointer-events: none; /* 禁用点击事件 */
  opacity: 0.5; /* 改变透明度 */
}
</style>
