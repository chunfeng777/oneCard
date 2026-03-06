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
    <div class="disuseCustomer">
      <el-table
        :data="tableData"
        style="width: 100%"
        height="650"
        :header-cell-style="{ background: '#eef1f6', color: '#909399' }"
        :row-style="{ height: '61px' }"
      >
        <el-table-column
          fixed
          prop="customerName"
          label="客户名称"
          width="160px"
        />
        <!-- <el-table-column prop="id" label="客户编号" /> -->
        <el-table-column prop="customerSource" label="客户来源" width="160px" />
        <el-table-column prop="customerLevel" label="客户等级" width="160px" />
        <el-table-column prop="industry" label="所属行业" width="160px" />
        <!-- <el-table-column prop="customerIntroduction" label="客户介绍" /> -->
        <el-table-column prop="contactPerson" label="联系人" width="160px" />
        <el-table-column prop="phone" label="联系电话" width="160px" />
        <el-table-column label="性别" width="160px">
          <template #default="scope">
            {{ Number(scope.row.gender) === 1 ? "男" : "女" }}
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="160px" />
        <!-- <el-table-column prop="wechatNumber" label="微信号" /> -->
        <!-- <el-table-column prop="customerStatus" label="客户状态" /> -->
        <!-- <el-table-column prop="customerIntention" label="客户意向" /> -->
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button type="primary" @click="handleRecovery(row)" link
              ><i-ep-RefreshRight />拉回列表</el-button
            >
            <el-button type="primary" @click="handleDel(row)" link
              ><i-ep-delete />彻底删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="pageQuery.pageNum"
        v-model:limit="pageQuery.pageSize"
        @pagination="getCustomerPage"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import CustomerAPI from "@/api/customer";
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
    getCustomerPage();
  }, 300); // 300ms 防抖时间
};

// 清空（获取所有数据）
const handleAll = () => {
  tableData.length = 0;
  pageQuery.keywords = "";
  getCustomerPage();
};

// 废弃客户分页列表
const getCustomerPage = () => {
  CustomerAPI.customerPageDeleted(pageQuery).then((res: any) => {
    tableData.length = 0;
    tableData.push(...res.list);
    total.value = res.total;
    // console.log(res);
  });
};
// 废弃列表移回客户列表
const handleRecovery = (row: any) => {
  // 弹出确认框
  ElMessageBox.confirm("确定要把该客户拉回客户列表吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    // 用户点击确认后执行恢复操作
    CustomerAPI.customerRecovery(row.id)
      .then((res: any) => {
        ElMessage.success("拉回客户列表成功");
        // 刷新客户数据
        getCustomerPage();
      })
      .catch((error) => {
        // 如果恢复请求失败，显示错误信息
        ElMessage.error("拉回失败，请稍后再试");
      });
  });
};

// 彻底删除
const handleDel = (row: any) => {
  // 弹出确认框
  ElMessageBox.confirm("确定要彻底删除该客户吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    // 用户点击确认后才执行删除操作
    CustomerAPI.customerDel(row.id)
      .then((res) => {
        ElMessage.success("删除成功");
        // 刷新客户数据
        getCustomerPage();
      })
      .catch((error) => {
        // 如果删除请求失败，显示错误信息
        ElMessage.error("删除失败，请稍后再试");
      });
  });
};

onMounted(() => {
  getCustomerPage();
});
</script>
<style scoped>
.search {
  display: flex;
  padding: 20px 0 0 20px;
}

.s_input {
  width: 260px;
  margin-right: 5px;
}

.disuseCustomer {
  padding: 20px;
}
</style>
