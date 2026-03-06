<template>
  <div>
    <div class="workBtn">
      <el-button type="primary" @click="openNewExpense"
        ><i-ep-plus />新建</el-button
      >
      <div class="search">
        <div style="width: 200px">
          <el-input
            v-model="pageQuery.development"
            placeholder="请输入开发负责人"
            @click="openOrgPicker('开发负责人', 'development')"
          />
        </div>
        <div style="width: 200px">
          <el-input
            v-model="pageQuery.acceptanceManager"
            placeholder="请输入验收审核负责人"
            @click="openOrgPicker('验收审核负责人', 'acceptanceManager')"
          />
        </div>
        <div>
          <Dict
            v-model="pageQuery.acceptanceStatus"
            placeholder="选择验收审核状态"
            code="acceptanceStatus"
          />
        </div>
        <div>
          <el-input v-model="pageQuery.keywords" placeholder="请输入需求名称" />
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
        <el-table-column fixed prop="requirementName" label="需求名称" />
        <el-table-column prop="demanderName" label="需求负责人" />
        <el-table-column label="预计完成时间">
          <template #default="scope">
            {{ scope.row.completionTime }}
          </template>
        </el-table-column>
        <el-table-column prop="developmentName" label="开发负责人" />
        <el-table-column prop="requirementModule" label="需求所属模块" />
        <el-table-column prop="acceptanceStatus" label="验收审核状态">
          <template #default="scope">
            <DictLabel
              v-model="scope.row.acceptanceStatus"
              code="acceptanceStatus"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作">
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
      <DevDrawer
        v-model="isDrawerVisible"
        :reportData="selectedReportData"
        @submit-success="findAll"
      />
      <!-- 汇报详情抽屉，传递选中的报告数据 -->
      <DevDetails
        v-model="isDrawerDetails"
        :reportData="selectedReportData"
        @submit-success="findAll"
      />
      <!-- 组织架构选择器 -->
      <w-org-picker
        ref="orgPicker"
        :selected="selectedOrg"
        :multiple="multiple"
        type="user"
        @ok="selectOk"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import DevelopmentAPI from "@/api/development";
import DeptAPI from "@/api/dept";
import DevDrawer from "./components/DevDrawer.vue";
import DevDetails from "./components/DevDetails.vue";
import WOrgPicker from "@/views/wflow/common/WOrgPicker.vue";
import dayjs from "dayjs";
const deptList = ref<OptionType[]>(); // 部门列表

// const formatTime = (time: any) => {
//   if (!time) return "";
//   return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
// };

// 定义控制新建汇报抽屉显示的状态
const isDrawerVisible = ref(false);
// 周报详情抽屉显示状态
const isDrawerDetails = ref(false);

const tableData = ref([]);
const pageQuery = reactive({
  keywords: "",
  acceptanceStatus: "",
  development: "",
  acceptanceManager: "",
  pageNum: 1,
  pageSize: 10,
});
const head = reactive({
  developmentName: "",
  acceptanceManagerName: "",
});
const total = ref();

// 控制组织架构选择器
const orgPicker = ref();
const orgPickerTitle = ref("");
const selectedOrg = ref<User[]>([]);
const multiple = ref(false);
const selectedField = ref<string>(""); // 新增字段，用于标识选择的负责人类型

// 打开组织架构选择器
const openOrgPicker = (title: string, field: string) => {
  orgPickerTitle.value = title;
  selectedField.value = field; // 设置选择的负责人类型
  // 根据选择的字段设置 selectedOrg
  if (field === "acceptanceManager") {
    selectedOrg.value = pageQuery.acceptanceManager
      ? [
          {
            id: pageQuery.acceptanceManager,
            name: head.acceptanceManagerName,
            avatar: "",
            type: "user",
          },
        ]
      : [];
  } else if (field === "development") {
    selectedOrg.value = pageQuery.development
      ? [
          {
            id: pageQuery.development,
            name: head.developmentName,
            avatar: "",
            type: "user",
          },
        ]
      : [];
  }
  orgPicker.value?.open();
};

interface User {
  id: string;
  name: string;
  avatar: string;
  type: string;
}

// 关闭组织架构选择器
const selectOk = (data: User[]) => {
  selectedOrg.value = data;
  if (selectedOrg.value.length > 0) {
    if (selectedField.value === "acceptanceManager") {
      pageQuery.acceptanceManager = selectedOrg.value[0]?.id || "";
      head.acceptanceManagerName = selectedOrg.value[0]?.name || "";
    } else if (selectedField.value === "development") {
      pageQuery.development = selectedOrg.value[0]?.id || "";
      head.developmentName = selectedOrg.value[0]?.name || "";
    }
  } else {
    if (selectedField.value === "acceptanceManager") {
      pageQuery.acceptanceManager = "";
      head.acceptanceManagerName = "";
    } else if (selectedField.value === "development") {
      pageQuery.development = "";
      head.developmentName = "";
    }
  }
  selectedOrg.value = []; // 清空已选择的组织数据
  orgPicker.value?.close();
};

// 获取部门下拉列表
// const getDeptList = () => {
//   DeptAPI.getOptions().then((data) => {
//     deptList.value = data;
//   });
// };

// 当前选中的汇报数据 （详情）
const selectedReportData = ref({});

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
    const response = await DevelopmentAPI.detailsDevelopment(reportId);
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
  const response = await DevelopmentAPI.detailsDevelopment(Id);

  selectedReportData.value = response;
  isDrawerVisible.value = true; // 打开详情抽屉
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
    await DevelopmentAPI.delDevelopment(id);
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
  pageQuery.development = "";
  // pageQuery.developmentName = "";
  pageQuery.acceptanceManager = "";
  // pageQuery.acceptanceManagerName = "";
  pageQuery.acceptanceStatus = "";
  pageQuery.keywords = "";

  findAll();
};

// 获取表格数据
const findAll = () => {
  DevelopmentAPI.developmentPage(pageQuery).then((res: any) => {
    tableData.value = res.list;
    total.value = res.total;
  });
};
onMounted(() => {
  findAll();
  // getDeptList();
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
