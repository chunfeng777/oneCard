<template>
  <div class="content">
    <div class="header">
      <span>用户昵称</span>
      <el-input
        placeholder="请输入用户昵称"
        class="input"
        v-model="searchQuery"
      />
      <!-- <span>状态</span>
      <el-select placeholder="请选择状态" class="select" v-model="statusFilter">
        <el-option label="正常" value="正常" />
        <el-option label="禁用" value="禁用" />
      </el-select> -->
      <el-button type="primary" @click="search">搜索</el-button>
      <el-button type="success" @click="openDialog">新增</el-button>
    </div>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column label="头像">
        <template #default="{ row }">
          <img
            :src="row.user.avatar || defaultAvatar"
            style="height: 40px; border-radius: 50%"
          />
        </template>
      </el-table-column>
      <el-table-column prop="user.nickname" label="昵称" />
      <el-table-column prop="user.email" label="邮箱" />
      <el-table-column label="已用空间/总空间">
        <template #default="{ row }">
          {{ row.useSpace }} / {{ row.totalSpace }}
        </template>
      </el-table-column>
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-tag :type="getTagType(row.status)">
            {{ row.status === 1 ? "正常" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button type="text" @click="modifSize(row)">修改空间值</el-button>
          <el-button type="text" @click="modifStatus(row)">修改状态</el-button>
          <el-button type="text" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination
      class="pagination"
      v-if="total > 0"
      v-model:total="total"
      v-model:page="params.pageNum"
      v-model:limit="params.pageSize"
      @pagination="findAll"
    />
    <!-- 新增弹窗 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="30%"
      @close="resetForm"
    >
      <el-form :model="form">
        <el-form-item label="用户ID">
          <el-input v-model="form.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="总空间">
          <el-input
            v-model.number="form.totalSpace"
            placeholder="请输入初始空间大小"
            type="number"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="正常" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="initSpaces">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import UploadAPI from "@/api/upload";
import { Space, spacesReq, initSpacesReq } from "@/api/upload/model";
import defaultAvatar from "/src/assets/images/default-avatar.png";
// 用户表格数据
const tableData = ref<Space[]>([]);
// 昵称搜索
const searchQuery = ref("");
// const statusFilter = ref("");
// 删除的ids
const ids: string[] = [];
// 根据状态返回不同类型
const getTagType = (status: any) => {
  return status === 1 ? "success" : "danger";
};
const total = ref(0);
const params = ref<spacesReq>({
  keywords: "",
  pageNum: 1,
  pageSize: 10,
});
const dialogVisible = ref(false);
const dialogTitle = ref("新增");
const form = ref<initSpacesReq>({
  userId: 0,
  totalSpace: 0,
  status: true,
});
// 打开弹窗
const openDialog = () => {
  dialogVisible.value = true;
};
// 重置表单数据
const resetForm = () => {
  form.value = {
    userId: 0,
    totalSpace: 0,
    status: true,
  };
};
// 所有用户数据
const findAll = () => {
  UploadAPI.pageUser(params.value).then((res: any) => {
    tableData.value = res.list;
    total.value = res.total;
  });
};

//搜索
const search = () => {
  tableData.value = tableData.value.filter((item: any) => {
    const matchesNickname = item.user.nickname.includes(searchQuery.value);
    // const matchesStatus =
    //   statusFilter.value === "" || item.status === statusFilter.value;
    // return matchesNickname && matchesStatus;
    return matchesNickname;
  });
};
// 搜索
// const search = () => {
//   if (!searchQuery.value && !statusFilter.value) {
//     // 如果没有提供任何搜索条件，直接显示所有数据
//     displayData.value = [...tableData.value];
//     return;
//   }

// 删除
const handleDelete = (row: any) => {
  console.log(row);
  const id = row.id;
  ElMessageBox.confirm(`确认删除选中的用户？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    UploadAPI.deleteSpaces(id).then((res) => {
      ElMessage({
        type: "success",
        message: `用户已被成功删除`,
      });
      // 刷新数据
      findAll();
    });
  });
};
// 修改用户存储空间状态
const modifStatus = (row: any) => {
  // 新状态
  const newStatus = row.status === 1 ? 0 : 1;
  // 当前状态
  const currentStatusText = row.status === 1 ? "正常" : "禁用";
  // 新状态的显示文字
  const newStatusText = newStatus === 1 ? "正常" : "禁用";
  console.log(currentStatusText);
  console.log(newStatus);

  ElMessageBox.confirm(
    `当前状态为【${currentStatusText}】确认将状态更改为【${newStatusText}】？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(() => {
    UploadAPI.statusSpaces(row.id, newStatus).then((res) => {
      ElMessage({
        type: "success",
        message: `状态已成功更改为【${newStatusText}】`,
      });
      // 更新数据或刷新界面
      findAll();
    });
  });
};
// 修改用户存储空间大小
const modifSize = (row: any) => {
  const currentSize = row.totalSpace; // 获取当前存储空间大小

  ElMessageBox.prompt(
    `当前存储空间大小为【${currentSize}】，请输入新的存储空间大小`,
    "修改存储空间大小",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputValue: currentSize.toString(),
      inputPlaceholder: "输入新的存储空间大小",
      inputPattern: /^[0-9]+(\.[0-9]+)?$/, // 确保输入为正整数
      inputErrorMessage: "请输入有效的数字",
    }
  ).then(({ value }) => {
    const newSize = Number(value);

    if (isNaN(newSize) || newSize <= 0) {
      ElMessage({
        type: "error",
        message: "请输入一个有效的存储空间大小",
      });
      return;
    }

    UploadAPI.modifiedSpaces(row.id, newSize).then((res) => {
      ElMessage({
        type: "success",
        message: `存储空间大小已成功更改为【${newSize}】`,
      });
      // 更新数据或刷新界面
      findAll();
    });
  });
};
// 新增用户存储空间
const initSpaces = () => {
  const data: initSpacesReq = {
    userId: form.value.userId,
    totalSpace: form.value.totalSpace,
    status: form.value.status,
  };

  UploadAPI.init(data).then(() => {
    ElMessage.success("新增用户成功");
    dialogVisible.value = false;
    resetForm();
    findAll();
  });
};

onMounted(() => {
  // 初始显示所有用户数据
  findAll();
});
</script>

<style scoped>
.content {
  padding: 20px;
}

.header {
  display: flex;
  gap: 10px;
  align-items: center;
  height: 80px;
  padding-left: 20px;
  margin-bottom: 20px;
  background-color: #fff;
}

.input,
.select {
  width: 200px;
}

.el-button {
  margin-left: 10px;
}
.dialog-footer {
  text-align: right;
}
.pagination {
  background-color: #fff;
  border: 1px solid #ffffff;
}
</style>
