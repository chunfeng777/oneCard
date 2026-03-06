<template>
  <div>
    <div class="search">
      <el-input
        class="s_input"
        placeholder="请输入客户名称"
        v-model="pageQuery.keywords"
      />
      <el-button @click="handleSearch" type="primary"
        ><i-ep-Search />搜索</el-button
      >
      <el-button @click="handleAll" type="primary"
        ><i-ep-Refresh />重置</el-button
      >
    </div>
    <div class="followUp">
      <el-table
        :data="tableData"
        style="width: 100%"
        height="650"
        :header-cell-style="{ background: '#eef1f6', color: '#909399' }"
        :row-style="{ height: '61px' }"
      >
        <el-table-column fixed prop="name" label="客户名称" />
        <el-table-column prop="followWay" label="跟进方式" />
        <el-table-column label="跟进时间">
          <template #default="scope">{{
            formatTime(scope.row.followTime)
          }}</template>
        </el-table-column>
        <el-table-column prop="communicationContent" label="沟通内容" />
        <el-table-column prop="currentStage" label="当前阶段" />
        <el-table-column prop="salesLead" label="销售机会" />
        <el-table-column label="下次跟进时间">
          <template #default="scope">{{
            formatTime(scope.row.nextFollowTime)
          }}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button type="primary" @click="info(row)" link
              ><i-ep-Link />详情</el-button
            >
            <el-button type="primary" @click="upd(row)" link
              ><i-ep-edit />编辑</el-button
            >
            <el-button type="primary" @click="del(row)" link
              ><i-ep-delete />删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="pageQuery.pageNum"
        v-model:limit="pageQuery.pageSize"
        @pagination="getFollowRecords"
      />
    </div>

    <!-- 详情 -->
    <el-dialog
      v-model="showDialog"
      title="跟进详情"
      width="1000px"
      append-to-body
    >
      <el-descriptions :column="3" class="customerDescriptions">
        <el-descriptions-item label="客户名称:">{{
          formInline.name
        }}</el-descriptions-item>
        <el-descriptions-item label="跟进方式:">{{
          formInline.followWay
        }}</el-descriptions-item>
        <el-descriptions-item label="	跟进时间:">{{
          formatTime(formInline.followTime)
        }}</el-descriptions-item>
        <el-descriptions-item label="沟通内容:">{{
          formInline.communicationContent
        }}</el-descriptions-item>
        <el-descriptions-item label="	当前阶段:">{{
          formInline.currentStage
        }}</el-descriptions-item>
        <el-descriptions-item label="销售机会:">{{
          formInline.salesLead
        }}</el-descriptions-item>
        <el-descriptions-item label="下次跟进时间:">{{
          formatTime(formInline.nextFollowTime)
        }}</el-descriptions-item>
        <el-descriptions-item label="创建人名称:">{{
          formInline.createName
        }}</el-descriptions-item>
        <el-descriptions-item label="创建时间:">{{
          formatTime(formInline.createTime)
        }}</el-descriptions-item>
        <el-descriptions-item label="更新时间:">{{
          formatTime(formInline.updateTime)
        }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    <!-- 编辑 -->
    <el-dialog
      v-model="showDialogUpd"
      title="修改跟进信息"
      width="1000px"
      append-to-body
    >
      <el-form
        :model="formInline"
        class="demo-form-inline"
        ref="ruleFormRef"
        :rules="rules"
      >
        <el-form-item label="客户名称" prop="name">
          <el-input
            v-model="formInline.name"
            placeholder="客户名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="跟进方式" prop="followWay">
          <el-input
            v-model="formInline.followWay"
            placeholder="跟进方式"
            clearable
          />
        </el-form-item>
        <el-form-item label="跟进时间" prop="followTime">
          <el-date-picker
            type="date"
            v-model="formInline.followTime"
            placeholder="跟进时间"
            clearable
          />
        </el-form-item>
        <el-form-item label="沟通内容" prop="communicationContent">
          <el-input
            type="textarea"
            v-model="formInline.communicationContent"
            placeholder="沟通内容"
            clearable
          />
        </el-form-item>
        <el-form-item label="当前阶段" prop="currentStage">
          <el-input
            v-model="formInline.currentStage"
            placeholder="当前阶段"
            clearable
          />
        </el-form-item>

        <el-form-item label="销售机会" prop="salesLead">
          <el-input
            v-model="formInline.salesLead"
            placeholder="销售机会"
            clearable
          />
        </el-form-item>
        <el-form-item label="下次跟进时间" prop="nextFollowTime">
          <el-date-picker
            type="date"
            v-model="formInline.nextFollowTime"
            placeholder="下次跟进时间"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDialogUpd = false">取消</el-button>
          <el-button type="primary" @click="submitForm()">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import CustomerAPI from "@/api/customer";
import dayjs from "dayjs";

// 时间格式化
const formatTime = (time: any) => {
  if (!time) return "";
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};

// 详情
const showDialog = ref(false);
const formInline = reactive({
  id: null,
  name: "",
  followWay: "",
  followTime: "",
  communicationContent: "",
  currentStage: "",
  salesLead: "",
  nextFollowTime: "",
  createName: "",
  createTime: "",
  updateTime: "",
});

// 编辑
const showDialogUpd = ref(false);

const tableData = reactive([]);
const total = ref(0);
const pageQuery = reactive({
  keywords: "",
  pageNum: 1,
  pageSize: 10,
});

// 搜索按钮的防抖处理
let searchTimeout: ReturnType<typeof setTimeout>;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pageQuery.pageNum = 1; // 搜索时重置到第一页
    getFollowRecords();
  }, 300); // 300ms 防抖时间
};

// 清空（获取所有数据）
const handleAll = () => {
  tableData.length = 0;
  pageQuery.keywords = "";
  getFollowRecords();
};

const ruleFormRef = ref(ElForm);

const rules = reactive({
  name: [{ required: true, message: "请输入客户名称", trigger: "blur" }],
  followWay: [{ required: true, message: "请输入跟进方式", trigger: "blur" }],
  followTime: [{ required: true, message: "请输入跟进时间", trigger: "blur" }],
  communicationContent: [
    { required: true, message: "请输入沟通内容", trigger: "blur" },
  ],
  currentStage: [
    { required: true, message: "请输入当前阶段", trigger: "blur" },
  ],
  salesLead: [{ required: true, message: "请输入销售机会", trigger: "blur" }],
  nextFollowTime: [
    { required: true, message: "请输入下次跟进时间", trigger: "blur" },
  ],
  // createName: [
  //   { required: true, message: "请输入创建人名称", trigger: "change" },
  // ],
  // createTime: [{ required: true, message: "请输入创建时间", trigger: "blur" }],
  // updateTime: [{ required: true, message: "请输入更新时间", trigger: "blur" }],
});

// 客户跟进记录表分页列表
const getFollowRecords = () => {
  CustomerAPI.getFollowRecords(pageQuery).then((res: any) => {
    tableData.length = 0;
    tableData.push(...res.list);
    total.value = res.total;
  });
};

// 跟进记录详情
const info = (row: any) => {
  showDialog.value = true;
  CustomerAPI.getInfoRecords(row.id).then((res: any) => {
    Object.assign(formInline, res);
  });
};
// 删除跟进记录
const del = (row: any) => {
  // 弹出确认框
  ElMessageBox.confirm("确认删除该记录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    // 用户点击确认后执行删除操作
    CustomerAPI.DelFollowRecords(row.id)
      .then((res: any) => {
        ElMessage.success("删除成功");
        // 刷新跟进记录数据
        getFollowRecords();
      })
      .catch((error) => {
        // 如果删除请求失败，显示错误信息
        ElMessage.error("删除失败，请稍后再试");
      });
  });
};

// 打开修改跟进记录弹窗
const upd = (row: any) => {
  showDialogUpd.value = true;
  CustomerAPI.getInfoRecords(row.id).then((res: any) => {
    Object.assign(formInline, res);
  });
};
// 打开修改跟进记录弹窗
const submitForm = () => {
  const id = formInline.id;
  CustomerAPI.UpdFollowRecords(id, formInline).then((res: any) => {
    ElMessage.success("修改成功");
    // 关闭弹窗
    showDialogUpd.value = false;
    getFollowRecords();
  });
};

onMounted(() => {
  getFollowRecords();
});
</script>
<style scoped>
:deep(
  .el-descriptions__body
    .el-descriptions__table:not(.is-bordered)
    .el-descriptions__cell
) {
  padding-bottom: 50px !important;
}

.customerDescriptions {
  padding-top: 30px;
}

.search {
  display: flex;
  padding: 20px 0 0 20px;
}

.s_input {
  width: 260px;
  margin-right: 5px;
}

.followUp {
  padding: 20px;
}
</style>
