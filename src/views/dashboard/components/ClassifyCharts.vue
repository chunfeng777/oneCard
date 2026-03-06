<template>
  <el-card>
    <template #header>
      <div class="title">
        <div>
          支付分类统计
          <el-select
            v-model="selectedPeriod"
            @change="classifyCharts"
            placeholder="选择时间段"
          >
            <el-option
              v-for="period in timePeriods"
              :key="period.value"
              :label="period.label"
              :value="period.value"
            />
          </el-select>
        </div>
        <el-tooltip effect="dark" content="点击试试下载" placement="bottom">
          <i-ep-download class="download" @click="downloadEchart" />
        </el-tooltip>
      </div>
    </template>
    <!-- 图表容器，使用传入的 props 设置 id、类名、宽度和高度 -->
    <div :id="id" :class="className" :style="{ height, width }"></div>
  </el-card>
</template>

<script setup lang="ts">
import ExpensesAPI from "@/api/expenses";
import * as echarts from "echarts";

// 定义组件的 props 默认值和类型检查
const props = defineProps({
  id: {
    type: String,
    default: "ClassifyCharts", // 默认图表 ID
  },
  className: {
    type: String,
    default: "", // 默认类名为空字符串
  },
  width: {
    type: String,
    default: "200px",
    required: true, // 宽度是必填项
  },
  height: {
    type: String,
    default: "200px",
    required: true, // 高度是必填项
  },
});
// 选择的时间段
const selectedPeriod = ref();
// 定义时间段类型
interface TimePeriod {
  label: string;
  value: number;
}
// 动态生成时间段
const timePeriods = ref<TimePeriod[]>([]);

// 生成时间段
const generateTimePeriods = () => {
  const currentYear = new Date().getFullYear(); // 获取当前年份
  // console.log(currentYear);
  timePeriods.value = [
    {
      label: `${currentYear}年上半年`,
      value: 1,
    },
    {
      label: `${currentYear}年下半年`,
      value: 2,
    },
  ];
};

// 初始化图表配置选项
const options = {
  tooltip: {
    trigger: "item",
  },
  legend: {
    top: "5%",
    left: "center",
  },
  series: [
    {
      // name: "Access From",
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: "#fff",
        borderWidth: 2,
      },
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 40,
          fontWeight: "bold",
        },
      },
      labelLine: {
        show: false,
      },
      data: [
        { value: 0, name: "微信" },
        { value: 0, name: "公户" },
        { value: 0, name: "信用卡" },
        { value: 0, name: "支付宝" },
      ],
    },
  ],
};

// 创建一个响应式的 chart 变量，用于存储 ECharts 实例
const chart = ref<any>(null);

// 当组件挂载时初始化图表
onMounted(() => {
  // 初始化 ECharts 实例，并将其标记为原始对象以避免 Vue 的响应式系统干扰
  chart.value = markRaw(
    echarts.init(document.getElementById(props.id) as HTMLDivElement)
  );
  // 设置图表的初始配置选项
  chart.value.setOption(options);
  // 监听窗口大小变化事件，调整图表大小
  window.addEventListener("resize", () => {
    chart.value.resize();
  });
  generateTimePeriods(); // 生成时间段
  // 设置默认选中当前时间段
  const currentMonth = new Date().getMonth(); // 0-11
  selectedPeriod.value = currentMonth < 6 ? 1 : 2; // 上半年或下半年
  // 获取数据并更新图表
  classifyCharts();
});

// 当组件激活时调整图表大小
onActivated(() => {
  if (chart.value) {
    chart.value.resize();
  }
});

const classifyCharts = async () => {
  const timePeriod =
    selectedPeriod.value || (new Date().getMonth() < 6 ? "1" : "2"); // 默认选择当前时间段
  // console.log("timePeriod:", timePeriod);
  try {
    const data: any = await ExpensesAPI.classifyStatistics(timePeriod); // 直接传递时间段的代表数字
    const chartData = [
      {
        value:
          data.find((item: any) => item.expenseType === 1)?.totalExpense || 0,
        name: "微信",
      },
      {
        value:
          data.find((item: any) => item.expenseType === 4)?.totalExpense || 0,
        name: "公户",
      },
      {
        value:
          data.find((item: any) => item.expenseType === 3)?.totalExpense || 0,
        name: "信用卡",
      },
      {
        value:
          data.find((item: any) => item.expenseType === 2)?.totalExpense || 0,
        name: "支付宝",
      },
    ];
    chart.value.setOption({
      series: [
        {
          data: chartData,
        },
      ],
    });
  } catch (error) {
    console.error("获取统计数据失败", error);
  }
};

const downloadEchart = () => {
  // 获取画布图表地址信息
  const img = new Image();
  img.src = chart.value.getDataURL({
    type: "png",
    pixelRatio: 1,
    backgroundColor: "#fff",
  });
  // 当图片加载完成后，生成 URL 并下载
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const link = document.createElement("a");
      link.download = `支付分类统计.png`;
      link.href = canvas.toDataURL("image/png", 0.9);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };
};
</script>

<style lang="scss" scoped>
.title {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .download {
    cursor: pointer;

    &:hover {
      color: #409eff;
    }
  }

  .el-select {
    width: 150px;
  }
}
</style>
