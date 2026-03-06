<template>
  <div class="contentBox">
    <div class="topBox">
      <!-- 上传组件 -->
      <el-upload
        class="file-upload"
        with-credentials
        :before-upload="beforeAvatarUpload"
        :show-file-list="false"
        :limit="5"
        :on-exceed="handleExceed"
        multiple
        :http-request="customRequest"
      >
        <el-button type="success">
          <el-icon><Link /></el-icon>
          上传文件
        </el-button>
      </el-upload>
      <div class="searchBox">
        <el-input
          v-model="pageQuery.keywords"
          style="width: 200px"
          placeholder="请输入文件名"
        />
        <el-button type="primary" @click="handleQuery"
          ><i-ep-search />搜索</el-button
        >
      </div>
    </div>

    <!-- 文件列表 -->
    <div class="tableBox">
      <el-table
        :data="tableData"
        style="width: 100%"
        height="650"
        @row-click="handleRowClick"
        :header-cell-style="{ background: '#eef1f6', color: '#909399' }"
        :row-style="{ height: '61px' }"
      >
        <el-table-column prop="fileName" label="文件名" />
        <el-table-column prop="createTime" label="上传时间" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button type="danger" @click="handleDelete(row)" link
              ><el-icon><Delete /></el-icon>删除</el-button
            >
            <el-button type="primary" @click="checkAndShowMFA(row)" link
              ><el-icon><Download /></el-icon>下载</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="pageQuery.pageNum"
        v-model:limit="pageQuery.pageSize"
        @pagination="getAdministrationFiles"
      />
      <!--  MFA 组件 -->
      <DynamicMFA
        v-if="showDynamicMFA"
        :account-bound="accountBound"
        :current-download-file="currentDownloadFile"
        @success="handleMFASuccess"
        @close="showDynamicMFA = false"
        @check-and-show-m-f-a="checkAndShowMFA"
      />
    </div>
  </div>
</template>
<script setup>
import AdministrativeAPI from "@/api/administrative";
import OrgAPI from "@/api/org";
import DynamicMFA from "/src/views/finance/documents/components/DynamicMFA.vue"; // MFA 组件
const tableData = reactive([]);
const total = ref();
const pageQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
});

// 控制 MFA 显示
const showDynamicMFA = ref(false);
const accountBound = ref(false); // 用于判断是否绑定账号，默认为 false
const currentDownloadFile = ref(null); // 当前下载文件
// 搜索
const handleQuery = () => {
  pageQuery.pageNum = 1; // 重置页码
  getAdministrationFiles();
};
// 查询所有文件列表
const getAdministrationFiles = () => {
  AdministrativeAPI.getAdministrationFiles(pageQuery).then((res) => {
    // 清空现有数组
    tableData.length = 0;
    // 使用 push 添加新数据
    tableData.push(...res.list);
    total.value = res.total;
  });
};

// 上传文件到阿里云 OSS
const customRequest = async (options) => {
  const { file } = options;
  // console.log(file);

  // 限制最大上传文件大小为 100MB
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB 转换为字节数

  // 检查文件大小
  if (file.size > MAX_FILE_SIZE) {
    ElMessage.error("文件大小超过最大限制（100MB）");
    return; // 如果文件太大，停止上传
  }

  try {
    // 创建 FormData 对象并将文件添加到其中
    const formData = new FormData();
    formData.append("file", file);

    // 打印 FormData 的内容
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }

    // 调用接口发送文件
    await AdministrativeAPI.fileOss(formData); // 直接调用 fileOss 上传文件

    ElMessage.success("文件上传成功");
    getAdministrationFiles();
  } catch (error) {
    ElMessage.error("文件上传失败");
  }
};

// 删除
const handleDelete = async (row) => {
  await ElMessageBox.confirm(`确定要删除【${row.fileName}】吗?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  });
  await AdministrativeAPI.administrationFilesDelete(row.id);
  ElMessage.success("删除成功");
  getAdministrationFiles();
};

// 检查是否绑定账号并显示相应的弹窗
const checkAndShowMFA = async (row) => {
  try {
    const response = await OrgAPI.financeFilesCheck(); // 调用接口
    // console.log(response, "检查账号绑定状态");

    if (response === "用户已绑定") {
      // 如果已绑定，直接显示第二个弹窗
      accountBound.value = true;
      // currentDownloadFile.value = row; // 保存当前下载文件信息
      // showDynamicMFA.value = true; // 显示 DynamicMFA 组件
    } else {
      // 如果未绑定，显示第一个弹窗
      accountBound.value = false;
      // currentDownloadFile.value = row; // 保存当前下载文件信息
      // showDynamicMFA.value = true; // 显示 DynamicMFA 组件
    }
    currentDownloadFile.value = row; // 保存当前下载文件信息
    showDynamicMFA.value = true; // 显示 DynamicMFA 组件
  } catch (error) {
    console.error("检查账号绑定状态失败：", error);
  }
};

// MFA 验证成功后下载文件
const handleMFASuccess = async () => {
  const row = currentDownloadFile.value;
  console.log(row, "row");
  const fileUrl = row.fileUrl;

  try {
    // 使用 fetch API 下载文件
    const downloadResponse = await fetch(fileUrl);
    const blob = await downloadResponse.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = row.fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 0);

    ElMessage.success("文件下载成功");
  } catch (error) {
    ElMessage.error("文件下载失败");
  }

  // 隐藏 MFA 组件
  showDynamicMFA.value = false;
};

onMounted(() => {
  getAdministrationFiles();
});
</script>
<style scoped lang="scss">
.contentBox {
  padding: 20px;
}

.topBox {
  display: flex;
  gap: 10px;
}
</style>
