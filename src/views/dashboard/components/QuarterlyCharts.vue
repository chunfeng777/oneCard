<template>
  <el-card>
    <template #header>
      <div class="title">
        季度统计
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
import { ref, onMounted, onActivated, markRaw } from "vue";

// 定义组件的 props 默认值和类型检查
const props = defineProps({
  id: {
    type: String,
    default: "QuarterlyCharts", // 默认图表 ID
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
// 初始化图表配置选项
const options = {
  legend: {
    data: ["收入", "支出"], // 图例数据
  },
  tooltip: {
    trigger: "axis", // 提示框触发方式
    axisPointer: {
      type: "shadow", // 坐标轴指示器类型
    },
  },
  dataset: {
    source: [], // 数据源，初始为空数组
  },
  xAxis: {
    type: "category", // 类目轴 ，x 轴
    // name: "月份",
    // nameLocation: "middle", // 名称位置
    // nameGap: 25, // 名称与轴线之间的距离
  },
  yAxis: {
    type: "value", // 数值轴 ，y 轴
    // name: "金额",
    // nameLocation: "middle", // 名称位置
    // nameGap: 35, // 名称与轴线之间的距离
  },
  series: [
    {
      name: "收入", // 系列名称
      type: "bar", // 柱状图类型
      itemStyle: {
        color: "green", // 收入柱子的颜色
      },
    },
    {
      name: "支出",
      type: "bar",
      itemStyle: {
        color: "blue", // 支出柱子的颜色
      },
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
  // 获取月度统计数据并更新图表
  quarterStatistics();
});
// 当组件激活时调整图表大小
onActivated(() => {
  if (chart.value) {
    chart.value.resize();
  }
});
// 异步函数，用于获取月度统计数据并更新图表数据源
const quarterStatistics = async () => {
  try {
    // 调用 API 获取月度统计数据
    const res: any = await ExpensesAPI.quarterStatistics();
    // 定义月份数组
    const quarters = [
      // "第一季度(1-3月)",
      // "第二季度(4-6月)",
      // "第三季度(7-9月)",
      // "第四季度(10-12月)",
      "第一季度",
      "第二季度",
      "第三季度",
      "第四季度",
    ];
    // 根据 API 返回的数据生成新的数据源
    const sourceData = quarters.map((quarter, index) => {
      const data = res.find((item: any) => item.quarter === index + 1);
      return {
        quarter,
        收入: data ? data.totalIncome : 0, // 如果有数据则取收入，否则为 0
        支出: data ? data.totalExpense : 0, // 如果有数据则取支出，否则为 0
      };
    });
    // 更新图表的数据源
    chart.value.setOption({
      dataset: {
        source: sourceData,
      },
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
      link.download = `季度统计.png`;
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
  justify-content: space-between;

  .download {
    cursor: pointer;

    &:hover {
      color: #409eff;
    }
  }
}
</style>
