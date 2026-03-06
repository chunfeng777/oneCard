<!-- 用户管理 -->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 部门树 -->
      <el-col :lg="4" :xs="24" class="mb-[12px]">
        <dept-tree v-model="queryParams.deptId" @node-click="handleQuery" />
      </el-col>

      <!-- 用户列表 -->
      <el-col :lg="20" :xs="24">
        <div class="search-container">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="关键字" prop="keywords">
              <el-input
                v-model="queryParams.keywords"
                placeholder="岗位名称"
                clearable
                style="width: 200px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item label="状态" prop="status">
              <el-select
                v-model="queryParams.status"
                placeholder="全部"
                clearable
                class="!w-[100px]"
              >
                <el-option label="正常" value="1" />
                <el-option label="禁用" value="0" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleQuery"
                ><i-ep-search />搜索</el-button
              >
              <el-button @click="resetQuery">
                <i-ep-refresh />
                重置</el-button
              >
            </el-form-item>
          </el-form>
        </div>

        <el-card shadow="never" class="table-container">
          <template #header>
            <div class="flex justify-between">
              <div>
                <el-button
                  v-hasPerm="['sys:positions:add']"
                  type="success"
                  @click="openDialog('positions-form')"
                  ><i-ep-plus />新增</el-button
                >
                <el-button
                  v-hasPerm="['sys:positions:delete']"
                  type="danger"
                  :disabled="removeIds.length === 0"
                  @click="handleDelete()"
                  ><i-ep-delete />删除</el-button
                >
              </div>
            </div>
          </template>

          <el-table
            v-loading="loading"
            :data="pageData"
            @selection-change="handleSelectionChange"
            border
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column
              key="id"
              label="职位编号"
              align="center"
              prop="id"
              width="100"
            />
            <el-table-column
              key="name"
              label="职位名称"
              align="center"
              prop="name"
            />
            <el-table-column
              label="部门名称"
              width="200"
              align="center"
              prop="deptName"
            />

            <el-table-column
              label="状态"
              align="center"
              prop="status"
              width="100"
            >
              <template #default="scope">
                <el-tag :type="scope.row.status == 1 ? 'success' : 'info'">{{
                  scope.row.status == 1 ? "正常" : "禁用"
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="	显示顺序"
              align="center"
              prop="sort"
              width="80"
            />
            <el-table-column label="操作" fixed="right" width="220">
              <template #default="scope">
                <el-button
                  v-hasPerm="['sys:positions:edit']"
                  type="primary"
                  link
                  size="small"
                  @click="openDialog('positions-form', scope.row.id)"
                  ><i-ep-edit />编辑</el-button
                >
                <el-button
                  v-hasPerm="['sys:positions:delete']"
                  type="primary"
                  link
                  size="small"
                  @click="handleDelete(scope.row.id)"
                  ><i-ep-delete />删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-if="total > 0"
            v-model:total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="handleQuery"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      :width="dialog.width"
      append-to-body
      @close="closeDialog"
    >
      <!-- 用户新增/编辑表单 -->
      <el-form
        v-if="dialog.type === 'positions-form'"
        ref="positionsFormRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
        class="el-dialog-div"
      >
        <el-form-item label="职位名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入职位名称" />
        </el-form-item>

        <el-form-item label="所属部门" prop="deptId">
          <el-tree-select
            v-model="formData.deptId"
            placeholder="请选择所属部门"
            :data="deptList"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            controls-position="right"
            style="width: 100px"
            :min="0"
          />
        </el-form-item>
      </el-form>

      <!-- 弹窗底部操作按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Positions",
  inheritAttrs: false,
});

import PositionsAPI from "@/api/positions";
import DeptAPI from "@/api/dept";
import RoleAPI from "@/api/role";

import {
  PositionsForm,
  PositionsQuery,
  PositionsPageVO,
} from "@/api/positions/model";

const queryFormRef = ref(ElForm); // 查询表单
const positionsFormRef = ref(ElForm); // 用户表单

const loading = ref(false); //  加载状态
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const queryParams = reactive<PositionsQuery>({
  pageNum: 1,
  pageSize: 10,
});
const total = ref(0); // 数据总数
const pageData = ref<PositionsPageVO[]>(); // 用户分页数据
const deptList = ref<OptionType[]>(); // 部门下拉数据源
const roleList = ref<OptionType[]>(); // 角色下拉数据源

// 弹窗对象
const dialog = reactive({
  visible: false,
  type: "positions-form",
  width: 800,
  title: "",
});

// 用户表单数据
const formData = reactive<PositionsForm>({
  status: 1,
  sort: 1,
});

// 校验规则
const rules = reactive({
  name: [{ required: true, message: "职位名称不能为空", trigger: "blur" }],
  deptId: [{ required: true, message: "所属部门不能为空", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "blur" }],
});

/** 查询 */
function handleQuery() {
  loading.value = true;
  PositionsAPI.getPage(queryParams)
    .then((data) => {
      console.log("handleQuery", data);
      pageData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 重置查询 */
function resetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  queryParams.deptId = undefined;
  handleQuery();
}

/** 行选中 */
function handleSelectionChange(selection: any) {
  removeIds.value = selection.map((item: any) => item.id);
}

/** 加载角色下拉数据源 */
async function loadRoleOptions() {
  RoleAPI.getOptions().then((data) => {
    roleList.value = data;
  });
}

/** 加载部门下拉数据源 */
async function loadDeptOptions() {
  DeptAPI.getOptions().then((data) => {
    deptList.value = data;
  });
}

/**
 * 打开弹窗
 *
 * @param type 弹窗类型  positions-form | positions-import
 * @param id 用户ID
 */
async function openDialog(type: string, id?: number) {
  dialog.visible = true;
  dialog.type = type;

  if (dialog.type === "positions-form") {
    // 用户表单弹窗
    await loadDeptOptions();
    await loadRoleOptions();
    if (id) {
      dialog.title = "修改职位信息";
      PositionsAPI.getFormData(id).then((data) => {
        Object.assign(formData, { ...data });
      });
    } else {
      dialog.title = "新增职位";
    }
  }
}

/**
 * 关闭弹窗
 *
 * @param type 弹窗类型  用户表单：positions-form | 用户导入：positions-import
 */
function closeDialog() {
  dialog.visible = false;
  if (dialog.type === "positions-form") {
    positionsFormRef.value.resetFields();
    positionsFormRef.value.clearValidate();

    formData.id = undefined;
    formData.status = 1;
  }
}

/** 表单提交 */
const handleSubmit = useThrottleFn(() => {
  if (dialog.type === "positions-form") {
    positionsFormRef.value.validate((valid: any) => {
      if (valid) {
        const positionsId = formData.id;
        loading.value = true;
        if (positionsId) {
          PositionsAPI.update(positionsId, formData)
            .then(() => {
              ElMessage.success("修改职位成功");
              closeDialog();
              resetQuery();
            })
            .finally(() => (loading.value = false));
        } else {
          PositionsAPI.add(formData)
            .then(() => {
              ElMessage.success("新增职位成功");
              closeDialog();
              resetQuery();
            })
            .finally(() => (loading.value = false));
        }
      }
    });
  }
}, 3000);

/** 删除员工 */
function handleDelete(id?: number) {
  const positionsIds = [id || removeIds.value].join(",");
  if (!positionsIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除职位?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(function () {
    PositionsAPI.deleteByIds(positionsIds).then(() => {
      ElMessage.success("删除成功");
      resetQuery();
    });
  });
}

onMounted(() => {
  handleQuery();
});
</script>
