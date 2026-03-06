<template>
  <div class="space-usage-progress-bar">
    <div class="progress-bar-container">
      <el-progress
        :percentage="usagePercentage"
        :show-text="false"
        status="active"
        class="progress-bar"
      />
      <div class="percentage-info">
        <span>{{ usagePercentage }}%</span>
      </div>
    </div>
    <div class="usage-total-info">
      <span>{{ useSpace }} / {{ totalSpace }}</span>
      <el-button circle type="primary" link @click="refreshSpaces">
        <i-ep-Refresh />
      </el-button>
    </div>
  </div>
</template>

<script setup>
import UploadAPI from "@/api/upload";
const totalSpace = ref(0);
const useSpace = ref(0);
const totalSpaceBytes = ref(0);
const useSpaceBytes = ref(0);
// 我的存储空间
const spaces = () => {
  UploadAPI.meSpaces().then((res) => {
    totalSpaceBytes.value = res.totalSpace;
    useSpaceBytes.value = res.useSpace;
    totalSpace.value = formatFileSize(totalSpaceBytes.value);
    useSpace.value = formatFileSize(useSpaceBytes.value);
    // 将数据传递到父组件
    emit("update:spaceInfo", {
      spaceUsed: useSpace.value,
      totalSpace: totalSpace.value,
    });
  });
};
const formatFileSize = (bytes) => {
  const k = 1024;
  const sizes = ["KB", "MB", "GB", "TB"];

  // 特殊处理 bytes 为 0 的情况
  if (bytes === 0) {
    return "0";
  }

  if (bytes < k) {
    // 对于小于1KB的文件大小，显示为零点几KB
    const size = (bytes / k).toFixed(2);
    // 检查 size 是否为 0.00，如果是则返回 "0"
    return size === "0.00" ? "0" : `${size} KB`;
  }

  const i = Math.floor(Math.log(bytes) / Math.log(k)) - 1;
  const size = (bytes / Math.pow(k, i + 1)).toFixed(2); // 保留两位小数
  // 检查 size 是否为 0.00，如果是则返回 "0"
  return size === "0.00" ? "0" : `${size} ${sizes[i]}`;
};

const usagePercentage = computed(() => {
  const percentage = totalSpaceBytes.value
    ? (useSpaceBytes.value / totalSpaceBytes.value) * 100
    : 0;

  // 获取 fileSize 用于判断
  const fileSize = formatFileSize(useSpaceBytes.value);

  // 如果 fileSize 不为 "0"，则向上取整百分比到整数后再除以 100，保留两位小数
  const finalPercentage =
    fileSize !== "0"
      ? Math.ceil(percentage * 100) / 100
      : percentage === 0
      ? 0
      : parseFloat(percentage.toFixed(2));
  return finalPercentage === 0 ? "0" : finalPercentage.toFixed(2);
});

// 刷新存储空间
const refreshSpaces = () => {
  spaces();
};
// 定义 emit 事件
const emit = defineEmits(["update:spaceInfo"]);

onMounted(() => {
  spaces();
});
</script>

<style scoped>
.space-usage-progress-bar {
  width: 220px;
  margin: 0 10px;
}
.progress-bar-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-bar {
  width: 100%; /* 确保进度条宽度足够 */
}

.percentage-info {
  margin-left: 8px;
}

.usage-total-info {
  display: flex;
  justify-content: space-between;
}
</style>