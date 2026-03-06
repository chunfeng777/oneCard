<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords" :label="$t('role.keyword')">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="$t('role.roleName')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleQuery"
            ><i-ep-search />{{ $t("role.search") }}</el-button
          >
          <el-button @click="resetQuery"
            ><i-ep-refresh />{{ $t("role.reset") }}</el-button
          >
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never" class="table-container">
      <template #header>
        <el-button type="success" @click="openDialog()"
          ><i-ep-plus />{{ $t("role.new") }}</el-button
        >
        <el-button
          type="danger"
          :disabled="ids.length === 0"
          @click="handleDelete()"
          ><i-ep-delete />{{ $t("role.delete") }}</el-button
        >
      </template>

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="roleList"
        highlight-current-row
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column
          :label="$t('role.roleName')"
          prop="name"
          min-width="100"
        />
        <el-table-column
          :label="$t('role.roleCoding')"
          prop="code"
          width="150"
        />

        <el-table-column :label="$t('role.status')" align="center" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success">{{
              $t("role.normal")
            }}</el-tag>
            <el-tag v-else type="info">{{ $t("role.disable") }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('role.sort')"
          align="center"
          width="80"
          prop="sort"
        />

        <el-table-column fixed="right" :label="$t('role.operate')" width="220">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              link
              @click="openMenuDialog(scope.row)"
            >
              <i-ep-position />{{ $t("role.assignPermissions") }}
            </el-button>
            <el-button
              type="primary"
              size="small"
              link
              @click="openDialog(scope.row.id)"
            >
              <i-ep-edit />{{ $t("role.edit") }}
            </el-button>
            <el-button
              type="primary"
              size="small"
              link
              @click="handleDelete(scope.row.id)"
            >
              <i-ep-delete />{{ $t("role.delete") }}
            </el-button>
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

    <!-- 角色表单弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      @close="closeDialog"
    >
      <el-form
        ref="roleFormRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item :label="$t('role.roleName')" prop="name">
          <el-input
            v-model="formData.name"
            :placeholder="$t('role.message.name.required')"
          />
        </el-form-item>

        <el-form-item :label="$t('role.roleCoding')" prop="code">
          <el-input
            v-model="formData.code"
            :placeholder="$t('role.message.code.required')"
          />
        </el-form-item>

        <el-form-item :label="$t('role.dataPermission')" prop="dataScope">
          <el-select v-model="formData.dataScope">
            <el-option :key="0" :label="$t('role.allData')" :value="0" />
            <el-option :key="1" :label="$t('role.departmentData')" :value="1" />
            <el-option
              :key="2"
              :label="$t('role.Data_this_department')"
              :value="2"
            />
            <el-option :key="3" :label="$t('role.Personal_data')" :value="3" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('role.status')" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">{{ $t("role.normal") }}</el-radio>
            <el-radio :label="0">{{ $t("role.deactivate") }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('role.sort')" prop="sort">
          <el-input-number
            v-model="formData.sort"
            controls-position="right"
            :min="0"
            style="width: 100px"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">{{
            $t("role.confirm")
          }}</el-button>
          <el-button @click="closeDialog">{{ $t("role.cancel") }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分配菜单弹窗  -->
    <el-dialog
      v-model="menuDialogVisible"
      :title="`【${checkedRole.name}】${$t('role.assignPermissions')}`"
      width="800px"
    >
      <el-scrollbar v-loading="loading" max-height="600px">
        <el-tree
          ref="menuRef"
          node-key="value"
          show-checkbox
          :data="menuList"
          :default-expand-all="true"
        >
          <template #default="{ data }">
            {{ data.label }}
          </template>
        </el-tree>
      </el-scrollbar>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleRoleMenuSubmit">{{
            $t("role.confirm")
          }}</el-button>
          <el-button @click="menuDialogVisible = false">{{
            $t("role.cancel")
          }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import RoleAPI from "@/api/role";
import MenuAPI from "@/api/menu";

import { RolePageVO, RoleForm, RoleQuery } from "@/api/role/model";

defineOptions({
  name: "Role",
  inheritAttrs: false,
});

const { t } = useI18n();

const queryFormRef = ref(ElForm);
const roleFormRef = ref(ElForm);
const menuRef = ref(ElTree);

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<RoleQuery>({
  pageNum: 1,
  pageSize: 10,
});

const roleList = ref<RolePageVO[]>();

const dialog = reactive({
  title: "",
  visible: false,
});

const formData = reactive<RoleForm>({
  sort: 1,
  status: 1,
  code: "",
  name: "",
});

const rules = reactive({
  name: [
    {
      required: true,
      message: t("role.message.name.required"),
      trigger: "blur",
    },
  ],
  code: [
    {
      required: true,
      message: t("role.message.code.required"),
      trigger: "blur",
    },
  ],
  dataScope: [
    {
      required: true,
      message: t("role.message.dataScope.required"),
      trigger: "blur",
    },
  ],
  status: [
    {
      required: true,
      message: t("role.message.status.required"),
      trigger: "blur",
    },
  ],
});

const menuDialogVisible = ref(false);

const menuList = ref<OptionType[]>([]);

interface CheckedRole {
  id?: number;
  name?: string;
}
let checkedRole: CheckedRole = reactive({});

/** 查询 */
function handleQuery() {
  loading.value = true;
  RoleAPI.getPage(queryParams)
    .then((data) => {
      roleList.value = data.list;
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
  handleQuery();
}

/** 行checkbox 选中事件 */
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

/** 打开角色表单弹窗 */
function openDialog(roleId?: number) {
  dialog.visible = true;
  if (roleId) {
    dialog.title = t("role.modifyRole");
    RoleAPI.getFormData(roleId).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = t("role.newRole");
  }
}

/** 角色保存提交 */
function handleSubmit() {
  roleFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const roleId = formData.id;
      if (roleId) {
        RoleAPI.update(roleId, formData)
          .then(() => {
            ElMessage.success(t("role.successModify"));
            closeDialog();
            resetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        RoleAPI.add(formData)
          .then(() => {
            ElMessage.success(t("role.addSuccess"));
            closeDialog();
            resetQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

/** 关闭表单弹窗 */
function closeDialog() {
  dialog.visible = false;
  resetForm();
}

/** 重置表单 */
function resetForm() {
  roleFormRef.value.resetFields();
  roleFormRef.value.clearValidate();

  formData.id = undefined;
  formData.sort = 1;
  formData.status = 1;
}

/** 删除角色 */
function handleDelete(roleId?: number) {
  const roleIds = [roleId || ids.value].join(",");
  if (!roleIds) {
    ElMessage.warning(t("role.message.remove.check"));
    return;
  }

  ElMessageBox.confirm(
    `${t("role.Confirm_selected_data_items")}?`,
    t("role.message.remove.warn"),
    {
      confirmButtonText: t("role.confirm"),
      cancelButtonText: t("role.cancel"),
      type: "warning",
    }
  ).then(() => {
    loading.value = true;
    RoleAPI.deleteByIds(roleIds)
      .then(() => {
        ElMessage.success(t("role.message.remove.successDelete"));
        resetQuery();
      })
      .finally(() => (loading.value = false));
  });
}

// 递归函数来处理 menuList 和 children 的 label 国际化
const translateLabels = (items: any) => {
  return items.map((item: any) => ({
    ...item,
    label: t(`route.${item.label}`), // 将 label 转换为国际化文本
    children: item.children ? translateLabels(item.children) : [], // 递归处理 children
  }));
};

/** 打开分配菜单弹窗 */
async function openMenuDialog(row: RolePageVO) {
  const roleId = row.id;
  if (roleId) {
    checkedRole = {
      id: roleId,
      name: row.name,
    };
    menuDialogVisible.value = true;
    loading.value = true;

    // 获取所有的菜单
    // menuList.value = await MenuAPI.getOptions();
    const options = await MenuAPI.getOptions();
    menuList.value = translateLabels(options); // 调用递归函数
    // 回显角色已拥有的菜单
    RoleAPI.getRoleMenuIds(roleId)
      .then((data) => {
        const checkedMenuIds = data;
        checkedMenuIds.forEach((menuId) =>
          menuRef.value.setChecked(menuId, true, false)
        );
      })
      .finally(() => {
        loading.value = false;
      });
  }
}

/** 角色分配菜单保存提交 */
function handleRoleMenuSubmit() {
  const roleId = checkedRole.id;
  if (roleId) {
    const checkedMenuIds: number[] = menuRef.value
      .getCheckedNodes(false, true)
      .map((node: any) => node.value);

    loading.value = true;
    RoleAPI.updateRoleMenus(roleId, checkedMenuIds)
      .then(() => {
        ElMessage.success(t("role.Permissions_assigned_successfully"));
        menuDialogVisible.value = false;
        resetQuery();
      })
      .finally(() => {
        loading.value = false;
      });
  }
}

onMounted(() => {
  handleQuery();
});
</script>
@/api/role/model
