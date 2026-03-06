<template>
  <div>
    <div class="workBtn">
      <el-button type="primary" @click="openNew"><i-ep-plus />新建</el-button>
      <div class="search">
        <div style="width: 200px">
          <el-input
            v-model="pageQuery.receivingCurrency"
            placeholder="请输入收款币种"
          />
        </div>
        <div style="width: 200px">
          <el-input
            v-model="pageQuery.customerAbbreviation"
            placeholder="请输入客户简称"
          />
        </div>
        <div style="width: 200px">
          <el-input
            v-model="pageQuery.paymentCustomerCompanyName"
            placeholder="请输入付款客户公司名"
          />
        </div>
        <!-- <div>
          <Dict placeholder="选择费用类型" code="expenseType" />
        </div> -->

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
        <el-table-column
          fixed
          prop="paymentCustomerCompanyName"
          label="付款公司"
        >
          <template #default="scope">
            <div class="elli">
              {{ scope.row.paymentCustomerCompanyName }}
            </div>
          </template>
        </el-table-column>

        <!-- <el-table-column
          fixed
          prop="paymentCustomerCompanyName"
          label="付款公司"
        >
          <template #default="scope">
            <div v-if="scope.row.paymentCustomerCompanyName.length > 10">
              <el-popover
                effect="dark"
                placement="right"
                :content="scope.row.paymentCustomerCompanyName"
              >
                <template #reference>
                  <div class="ellipsis">
                    {{ truncatedContent(scope.row.paymentCustomerCompanyName) }}
                  </div>
                </template>
              </el-popover>
            </div>
            <div class="ellipsis" v-else>
              {{ scope.row.paymentCustomerCompanyName }}
            </div>
          </template>
        </el-table-column> -->
        <el-table-column label="客户简称">
          <template #default="scope">
            {{ scope.row.customerAbbreviation }}
          </template>
        </el-table-column>
        <el-table-column label="到款日期">
          <template #default="scope">
            {{ scope.row.paymentArrivalDate }}
          </template>
        </el-table-column>

        <el-table-column label="到款金额">
          <template #default="scope">
            {{ scope.row.bankPaymentAmount }}
          </template>
        </el-table-column>
        <el-table-column label="收款币种">
          <template #default="scope">
            {{ scope.row.receivingCurrency }}
          </template>
        </el-table-column>
        <el-table-column label="收款银行名称">
          <template #default="scope">
            {{ scope.row.receivingBankName }}
          </template>
        </el-table-column>
        <el-table-column label="收款人">
          <template #default="scope">
            {{ scope.row.payee }}
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
      <!-- 新建汇报抽屉  submitSuccess监听新建汇报提交成功事件-->
      <contractDrawer
        v-model="isDrawerVisible"
        :reportData="selectedReportData"
        @submit-success="findAll"
      />
      <!-- 汇报详情抽屉，传递选中的报告数据 -->
      <contractDetails
        v-model="isDrawerDetails"
        :reportData="selectedReportData"
        @submit-success="findAll"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import ContractAPI from "@/api/contract";

import DeptAPI from "@/api/dept";
import contractDrawer from "./components/contractDrawer.vue";
import contractDetails from "./components/contractDetails.vue";
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
  receivingCurrency: "",
  customerAbbreviation: "",
  paymentCustomerCompanyName: "",
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

// 打开新建汇报抽屉
const openNew = () => {
  // 清空选中的汇报数据
  selectedReportData.value = {};
  // 打开新建汇报抽屉
  isDrawerVisible.value = true;
};

// 打开汇报详情抽屉并设置选中的汇报数据
const openContract = async (scoped: any) => {
  const reportId = scoped.id;
  try {
    // 调用接口获取详情数据
    const response = await ContractAPI.detailsContract(reportId);
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
const editContract = async (scoped: any) => {
  const Id = scoped.id;
  // 调用接口获取详情数据
  const response = await ContractAPI.detailsContract(Id);

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
    await ContractAPI.delContract(id);
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
  pageQuery.receivingCurrency = "";
  pageQuery.customerAbbreviation = "";
  pageQuery.paymentCustomerCompanyName = "";

  findAll();
};

// 获取表格数据
const findAll = () => {
  ContractAPI.contractPage(pageQuery).then((res: any) => {
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
