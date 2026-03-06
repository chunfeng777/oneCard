<template>
  <el-card>
    <template #header>
      <div class="title">
        年度统计
        <el-tooltip effect="dark" content="点击试试下载" placement="bottom">
          <i-ep-download class="download" @click="downloadEchart" />
        </el-tooltip>
      </div>
    </template>

    <div :id="id" :class="className" :style="{ height, width }"></div>
  </el-card>
</template>

<script setup lang="ts">
import ExpensesAPI from "@/api/expenses";
import * as echarts from "echarts";
import { ref, onMounted, onActivated, markRaw } from "vue";

const props = defineProps({
  id: {
    type: String,
    default: "AnnualCharts",
  },
  className: {
    type: String,
    default: "",
  },
  width: {
    type: String,
    default: "200px",
    required: true,
  },
  height: {
    type: String,
    default: "200px",
    required: true,
  },
});

const currentYear = new Date().getFullYear().toString();
// const years = ["2021", "2022", "2023", "2024", "2025"];
let years: string[] = [];
// const defaultYearIndex =
//   years.indexOf(currentYear) !== -1 ? years.indexOf(currentYear) : 0;
let defaultYearIndex = 0; // 默认选中第一个年份

const options = {
  legend: {
    data: ["收入", "支出"],
  },
  tooltip: {
    trigger: "axis",
    showContent: true,
  },
  dataset: {
    source: [],
  },
  xAxis: {
    type: "category",
    data: [] as string[], // 动态设置 xAxis 数据
  },
  yAxis: { gridIndex: 0 },
  grid: { top: "55%" },
  series: [
    {
      type: "line",
      smooth: true,
      seriesLayoutBy: "row",
      emphasis: { focus: "series" },
      itemStyle: {
        color: "green",
      },
    },
    {
      type: "line",
      smooth: true,
      seriesLayoutBy: "row",
      emphasis: { focus: "series" },
      itemStyle: {
        color: "blue",
      },
    },
    {
      type: "pie",
      id: "pie",
      radius: "30%",
      center: ["50%", "25%"],
      emphasis: {
        focus: "self",
      },
      label: {
        formatter: `{b}: {@${years[defaultYearIndex]}} ({d}%)`,
      },
      encode: {
        itemName: "product",
        value: defaultYearIndex + 1,
        tooltip: defaultYearIndex + 1,
      },
      itemStyle: {
        color: function (params: any) {
          if (params.name === "收入") {
            return "green";
          } else if (params.name === "支出") {
            return "blue";
          }
          return "#ccc"; // 默认颜色
        },
      },
    },
  ],
};

const chart = ref<any>("");

// 异步函数，用于获取年度统计数据并更新图表数据源
const annualStatistics = async () => {
  try {
    // 调用 API 获取年度统计数据
    const res: any = await ExpensesAPI.annualStatistics();
    // console.log("获取到的数据:", res);
    // 生成年份数组
    const years = res.map((item: any) => item.year.toString());
    console.log("生成的年份数组:", years); // 添加调试信息
    // 确保年份按升序排列
    years.sort((a: string, b: string) => parseInt(a) - parseInt(b));

    // 更新默认选中的年份索引
    defaultYearIndex =
      years.indexOf(currentYear) !== -1 ? years.indexOf(currentYear) : 0;

    // 生成数据源
    const sourceData = [
      ["product", ...years],
      [
        "收入",
        ...years.map((year: string) => {
          const data = res.find((item: any) => item.year.toString() === year);
          return data ? data.totalIncome : 0;
        }),
      ],
      [
        "支出",
        ...years.map((year: string) => {
          const data = res.find((item: any) => item.year.toString() === year);
          return data ? data.totalExpense : 0;
        }),
      ],
    ];

    console.log("处理后的数据:", sourceData);

    // 初始化图表
    chart.value = markRaw(
      echarts.init(document.getElementById(props.id) as HTMLDivElement)
    );

    // 设置默认选中的年份
    const defaultMarkLineData = [
      {
        xAxis: defaultYearIndex,
        lineStyle: {
          color: "red",
          type: "dashed",
        },
        label: {
          show: false, // 隐藏标签
        },
      },
    ];

    // 更新图表
    chart.value.setOption({
      ...options,
      xAxis: {
        type: "category",
        data: years, // 动态设置 xAxis 数据
      },
      dataset: {
        source: sourceData,
      },
      series: [
        ...options.series.slice(0, 2).map((series, index) => ({
          ...series,
          markLine: {
            data: defaultMarkLineData,
          },
        })),
        // options.series[2],
        {
          ...options.series[2],
          label: {
            formatter: `{b}: {@${years[defaultYearIndex]}} ({d}%)`,
          },
          encode: {
            itemName: "product",
            value: defaultYearIndex + 1,
            tooltip: defaultYearIndex + 1,
          },
        },
      ],
    });

    // 监听 resize
    window.addEventListener("resize", () => {
      chart.value?.resize();
    });

    // 监听 updateAxisPointer
    chart.value.on("updateAxisPointer", (event: any) => {
      const xAxisInfo = event.axesInfo[0];
      if (xAxisInfo) {
        const dimension = xAxisInfo.value + 1;
        // 检查 dimension 是否在有效范围内
        if (dimension < 1 || dimension > years.length) {
          console.error("索引超出有效范围");
          return;
        }
        const markLineData = [
          {
            xAxis: xAxisInfo.value,
            lineStyle: {
              color: "red",
              type: "dashed",
            },
            label: {
              show: false, // 隐藏标签
            },
          },
        ];

        chart.value.setOption({
          series: [
            ...options.series.slice(0, 2).map((series, index) => ({
              ...series,
              markLine: {
                data: markLineData,
              },
            })),
            {
              id: "pie",
              label: {
                formatter: `{b}: {@${years[dimension - 1]}} ({d}%)`,
              },
              encode: {
                value: dimension,
                tooltip: dimension,
              },
              itemStyle: {
                color: function (params: any) {
                  if (params.name === "收入") {
                    return "green";
                  } else if (params.name === "支出") {
                    return "blue";
                  }
                  return "#ccc"; // 默认颜色
                },
              },
            },
          ],
        });
      }
    });
  } catch (error) {
    console.error("获取统计数据失败", error);
  }
};

onMounted(() => {
  // 调用 annualStatistics 函数获取数据并更新图表
  annualStatistics();
});

onActivated(() => {
  if (chart.value) {
    chart.value.resize();
  }
});

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
      link.download = `年度统计.png`;
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
