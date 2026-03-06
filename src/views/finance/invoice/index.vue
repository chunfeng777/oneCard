<template>
  <div>
    <div class="workBtn">
      <el-button type="primary" @click="openNew"><i-ep-plus />新建</el-button>
      <div class="search">
        <div style="width: 240px">
          <el-input v-model="pageQuery.keywords" placeholder="请输入发票号码" />
        </div>

        <div>
          <Dict
            placeholder="发票类型"
            v-model="pageQuery.invoiceType"
            code="InvoiceType"
          />
          <!-- <DictLabel v-model="scope.row.expenseType" code="InvoiceType" /> -->
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
        <el-table-column fixed prop="invoiceProvider" label="发票提供员">
          <template #default="scope">
            <div class="elli">
              {{ scope.row.invoiceProvider }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="开具时间">
          <template #default="scope">
            {{ scope.row.invoiceDate }}
          </template>
        </el-table-column>
        <el-table-column label="发票类型" width="80px">
          <template #default="scope">
            <!-- {{ scope.row.invoiceType }} -->
            <DictLabel v-model="scope.row.invoiceType" code="InvoiceType" />
          </template>
        </el-table-column>

        <el-table-column label="金额">
          <template #default="scope">
            {{ scope.row.amount }}
          </template>
        </el-table-column>
        <el-table-column label="销售方信息名称">
          <template #default="scope">
            {{ scope.row.sellerName }}
          </template>
        </el-table-column>
        <el-table-column label="统一社会信用代码/纳税人识别号">
          <template #default="scope">
            {{ scope.row.sellerTaxCode }}
          </template>
        </el-table-column>
        <el-table-column label="是否重复" width="80px">
          <template #default="scope">
            <el-tag v-if="scope.row.duplicateCheck === 1" type="danger"
              >重复</el-tag
            >
            <el-tag v-else type="success">不重复</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="primary" link @click="openContract(scope.row)">
              <i-ep-link /> 查看
            </el-button>
            <el-button type="primary" link @click="editContract(scope.row)">
              <i-ep-edit />编辑
            </el-button>
            <el-button type="primary" link @click="delContract(scope.row)">
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
      <!-- 新建抽屉  submitSuccess监听新建提交成功事件-->
      <invoiceDrawer
        v-model="isDrawerVisible"
        :reportData="selectedReportData"
        @submit-success="findAll"
      />
      <!-- 详情抽屉，传递选中的数据 -->
      <invoiceDetails
        v-model="isDrawerDetails"
        :reportData="selectedReportData"
        @submit-success="findAll"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import InvoiceAPI from "@/api/invoice";

import DeptAPI from "@/api/dept";
import invoiceDrawer from "./components/invoiceDrawer.vue";
import invoiceDetails from "./components/invoiceDetails.vue";
import dayjs from "dayjs";
const deptList = ref<OptionType[]>(); // 部门列表

const formatTime = (time: any) => {
  if (!time) return "";
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};

// 定义控制新建抽屉显示的状态
const isDrawerVisible = ref(false);
// 详情抽屉显示状态
const isDrawerDetails = ref(false);

const tableData = ref([]);
const pageQuery = reactive({
  keywords: "",
  invoiceType: "",
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
const selectedReportData = ref({});

// 打开新建抽屉
const openNew = () => {
  // 清空选中的数据
  selectedReportData.value = {};
  // 打开新建抽屉
  isDrawerVisible.value = true;
};

// 打开详情抽屉并设置选中的数据
const openContract = async (scoped: any) => {
  const reportId = scoped.id;
  try {
    // 调用接口获取详情数据
    const response = await InvoiceAPI.detailsInvoice(reportId);
    if (response) {
      selectedReportData.value = response; // 将接口返回的详情数据赋值给 selectedReportData
      isDrawerDetails.value = true; // 打开详情抽屉
    } else {
      ElMessage.error("获取详情失败，数据为空");
    }
  } catch (error) {
    console.error("获取详情失败:", error);
  }
};

// 编辑
const editContract = async (scoped: any) => {
  const Id = scoped.id;
  // 调用接口获取详情数据
  const response = await InvoiceAPI.detailsInvoice(Id);

  selectedReportData.value = response;
  isDrawerVisible.value = true; // 打开详情抽屉
};

// 删除
const delContract = async (scoped: any) => {
  const id = scoped.id;
  try {
    await ElMessageBox.confirm("确定删除吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await InvoiceAPI.delInvoice(id);
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
  pageQuery.keywords = "";
  pageQuery.invoiceType = "";

  findAll();
};
// 获取表格数据
const findAll = () => {
  InvoiceAPI.invoicePage(pageQuery).then((res: any) => {
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
// 内容很多后面显示 ...
.elli {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
