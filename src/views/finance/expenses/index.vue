<template>
  <div>
    <div class="workBtn">
      <el-button type="primary" @click="openNewExpense"
        ><i-ep-plus />新建</el-button
      >
      <div class="search">
        <div style="width: 200px">
          <el-tree-select
            v-model="pageQuery.deptId"
            placeholder="请选择部门"
            :data="deptList"
            filterable
            check-strictly
            class="s_select"
          />
        </div>
        <!-- <div style="width: 200px">
          <el-input
            v-model="pageQuery.keywords"
            placeholder="请输入支出费用内容"
          />
        </div> -->
        <div>
          <Dict
            v-model="pageQuery.expenseType"
            placeholder="选择费用类型"
            code="expenseType"
          />
        </div>
        <div>
          <el-date-picker
            v-model="pageQuery.year"
            type="year"
            placeholder="请选择年份"
            format="YYYY"
            value-format="YYYY"
          />
        </div>
        <div>
          <el-date-picker
            v-model="pageQuery.date"
            popper-class="picker-dateNoneYear"
            clearable
            placeholder="请输入日期"
            type="date"
            format="MM月DD日"
            value-format="MM-DD"
          />
        </div>

        <el-button type="primary" @click="searchReports"
          ><i-ep-search />搜索</el-button
        >
        <el-button @click="handleAll" type="primary" style="margin-left: -5px"
          ><i-ep-Refresh />重置</el-button
        >
      </div>
    </div>
    <div class="workList">
      <el-table
        :data="tableData"
        style="width: 100%"
        height="650"
        :header-cell-style="{ background: '#eef1f6', color: '#909399' }"
        :row-style="{ height: '61px' }"
      >
        <el-table-column fixed prop="incomeContent" label="收入内容">
          <template #default="scope">
            <div
              v-if="
                scope.row.incomeContent && scope.row.incomeContent.length > 10
              "
            >
              <el-popover
                effect="dark"
                placement="right"
                :content="scope.row.incomeContent"
              >
                <template #reference>
                  <div class="ellipsis">
                    {{ truncatedContent(scope.row.incomeContent) }}
                  </div>
                </template>
              </el-popover>
            </div>
            <div class="ellipsis" v-else>
              {{ scope.row.incomeContent || "" }}
            </div>
          </template>
        </el-table-column>
        <!-- <el-table-column fixed prop="expenseContent" label="支出费用内容" /> -->
        <el-table-column prop="expenseContent" label="支出费用内容">
          <template #default="scope">
            <div
              v-if="
                scope.row.expenseContent && scope.row.expenseContent.length > 10
              "
            >
              <el-popover
                effect="dark"
                placement="right"
                :content="scope.row.expenseContent"
              >
                <template #reference>
                  <div class="ellipsis">
                    {{ truncatedContent(scope.row.expenseContent) }}
                  </div>
                </template>
              </el-popover>
            </div>
            <div class="ellipsis" v-else>
              {{ scope.row.expenseContent }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="expenseType" label="费用类型">
          <template #default="scope">
            <DictLabel v-model="scope.row.expenseType" code="expenseType" />
          </template>
        </el-table-column>
        <el-table-column label="支付日期">
          <template #default="scope">
            {{ scope.row.paymentDate }}
          </template>
        </el-table-column>
        <el-table-column label="总价">
          <template #default="scope">
            {{ scope.row.totalPrice }}
          </template>
        </el-table-column>
        <el-table-column label="支出">
          <template #default="scope">
            {{ scope.row.expense }}
          </template>
        </el-table-column>
        <el-table-column label="收入">
          <template #default="scope">
            {{ scope.row.income }}
          </template>
        </el-table-column>
        <el-table-column label="结余">
          <template #default="scope">
            {{ scope.row.balance }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="210px">
          <template #default="scope">
            <el-button type="primary" link @click="openExpense(scope.row)">
              <i-ep-link /> 查看
            </el-button>
            <el-button type="primary" link @click="editExpense(scope.row)">
              <i-ep-edit />编辑
            </el-button>
            <el-button type="primary" link @click="delExpense(scope.row)">
              <i-ep-delete />删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="pageQuery.pageNum"
        v-model:limit="pageQuery.pageSize"
        @pagination="findAll"
      />
      <!-- 新建汇报抽屉  submitSuccess监听新建汇报提交成功事件-->
      <ExpenseDrawer
        v-model="isDrawerVisible"
        :reportData="selectedReportData"
        v-model:fileList="selectedReportData.fileList"
        @submit-success="findAll"
      />
      <!-- 汇报详情抽屉，传递选中的报告数据 -->
      <ExpenseDetails
        v-model="isDrawerDetails"
        :reportData="selectedReportData"
        @submit-success="findAll"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import ExpensesAPI from "@/api/expenses";
import DeptAPI from "@/api/dept";
import ExpenseDrawer from "./components/ExpenseDrawer.vue";
import ExpenseDetails from "./components/ExpenseDetails.vue";
import dayjs from "dayjs";
const deptList = ref<OptionType[]>(); // 部门列表
// 显示前面10个字符
const truncatedContent = (content: string) => {
  return content.length > 10 ? content.substring(0, 10) + "..." : content;
};

const formatTime = (time: any) => {
  if (!time) return "";
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};

// 定义控制新建汇报抽屉显示的状态
const isDrawerVisible = ref(false);
// 周报详情抽屉显示状态
const isDrawerDetails = ref(false);

const tableData = ref([]);
const pageQuery = reactive({
  // keywords: "",
  deptId: "",
  year: "",
  date: "",
  expenseType: "",
  pageNum: 1,
  pageSize: 10,
});
const total = ref();

// 获取部门下拉列表
const getDeptList = () => {
  DeptAPI.getOptions().then((data) => {
    deptList.value = data;
  });
};

// 当前选中的汇报数据 （详情）
const selectedReportData: any = ref({});

// 打开新建汇报抽屉
const openNewExpense = () => {
  // 清空选中的汇报数据
  selectedReportData.value = {};
  // 打开新建汇报抽屉
  isDrawerVisible.value = true;
};

// 打开汇报详情抽屉并设置选中的汇报数据
const openExpense = async (scoped: any) => {
  const reportId = scoped.id;
  try {
    // 调用接口获取详情数据
    const response = await ExpensesAPI.detailsExpense(reportId);
    // console.log("获取的详情数据:", response); // 添加日志
    // selectedReportData.value = response; // 将接口返回的详情数据赋值给 selectedReportData
    // isDrawerDetails.value = true; // 打开详情抽屉
    if (response) {
      selectedReportData.value = response; // 将接口返回的详情数据赋值给 selectedReportData
      isDrawerDetails.value = true; // 打开详情抽屉
    } else {
      ElMessage.error("获取汇报详情失败，数据为空");
    }
  } catch (error) {
    console.error("获取汇报详情失败:", error);
  }
};

// 编辑
const editExpense = async (scoped: any) => {
  const Id = scoped.id;
  // 调用接口获取详情数据
  try {
    const response = await ExpensesAPI.detailsExpense(Id);

    if (response) {
      selectedReportData.value = response;
      isDrawerVisible.value = true; // 打开详情抽屉
    } else {
      ElMessage.error("获取汇报详情失败，数据为空");
    }
  } catch (error) {
    console.error("获取汇报详情失败:", error);
  }
};

// 删除
const delExpense = async (scoped: any) => {
  const id = scoped.id;
  try {
    await ElMessageBox.confirm("确定删除吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await ExpensesAPI.delExpense(id);
    ElMessage.success("删除成功");
    await findAll();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败，请重试");
    }
  }
};

// 搜索
const searchReports = () => {
  pageQuery.pageNum = 1;
  findAll();
};

// 重置（清空所有数据）
const handleAll = () => {
  tableData.value = [];
  // pageQuery.keywords = "";
  pageQuery.deptId = "";
  pageQuery.year = "";
  pageQuery.date = "";
  pageQuery.expenseType = "";

  findAll();
};

// 获取表格数据
const findAll = () => {
  ExpensesAPI.expensePage(pageQuery).then((res: any) => {
    tableData.value = res.list;
    total.value = res.total;
  });
};
onMounted(() => {
  findAll();
  getDeptList();
});
</script>
<style scoped lang="scss">
.workBtn {
  display: flex;
  padding: 20px 0 0 20px;
}

.workList {
  padding: 20px;
}

.search {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-left: 20px;
}
</style>
