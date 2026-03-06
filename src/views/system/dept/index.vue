<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item :label="$t('dept.keyword')" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="$t('dept.departmentName')"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item :label="$t('dept.departmentStatus')" prop="status">
          <el-select
            v-model="queryParams.status"
            :placeholder="$t('dept.all')"
            clearable
            class="!w-[100px]"
          >
            <el-option :value="1" :label="$t('dept.normal')" />
            <el-option :value="0" :label="$t('dept.disable')" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button class="filter-item" type="primary" @click="handleQuery">
            <i-ep-search />
            {{ $t("dept.search") }}
          </el-button>
          <el-button @click="resetQuery">
            <i-ep-refresh />{{ $t("dept.reset") }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never" class="table-container">
      <template #header>
        <el-button
          v-hasPerm="['sys:dept:add']"
          type="success"
          @click="openDialog(0, undefined)"
          ><i-ep-plus />{{ $t("dept.new") }}</el-button
        >
        <el-button
          v-hasPerm="['sys:dept:delete']"
          type="danger"
          :disabled="ids.length === 0"
          @click="handleDelete()"
          ><i-ep-delete />{{ $t("dept.delete") }}
        </el-button>
      </template>

      <el-table
        v-loading="loading"
        :data="deptList"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column
          prop="name"
          :label="$t('dept.departmentName')"
          min-width="200"
        />
        <el-table-column prop="status" :label="$t('dept.status')" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status == 1" type="success">{{
              $t("dept.normal")
            }}</el-tag>
            <el-tag v-else type="info">{{ $t("dept.disable") }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="sort" :label="$t('dept.sort')" width="100" />

        <el-table-column
          :label="$t('dept.operate')"
          fixed="right"
          align="left"
          width="200"
        >
          <template #default="scope">
            <el-button
              v-hasPerm="['sys:dept:add']"
              type="primary"
              link
              size="small"
              @click.stop="openDialog(scope.row.id, undefined)"
              ><i-ep-plus />{{ $t("dept.new") }}
            </el-button>
            <el-button
              v-hasPerm="['sys:dept:edit']"
              type="primary"
              link
              size="small"
              @click.stop="openDialog(scope.row.parentId, scope.row.id)"
              ><i-ep-edit />{{ $t("dept.edit") }}
            </el-button>
            <el-button
              v-hasPerm="['sys:dept:delete']"
              type="primary"
              link
              size="small"
              @click.stop="handleDelete(scope.row.id)"
            >
              <i-ep-delete />{{ $t("dept.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="600px"
      @closed="closeDialog"
    >
      <el-form
        ref="deptFormRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item :label="$t('dept.superiorDepartment')" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :placeholder="$t('dept.selectSuperiorDepartment')"
            :data="deptOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>
        <el-form-item :label="$t('dept.departmentName')" prop="name">
          <el-input
            v-model="formData.name"
            :placeholder="$t('dept.pleaseEnterDepartmentName')"
          />
        </el-form-item>
        <el-form-item label="部门负责人" prop="managerId" label-width="100">
          <el-select
            v-model="formData.managerId"
            placeholder="请选择部门负责人"
            clearable
            filterable
            popper-append-to-body
            style="width: 100%"
            popper-class="single-select-loadmore"
          >
            <el-option
              v-for="item in deptHeads"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('dept.showSort')" prop="sort">
          <el-input-number
            v-model="formData.sort"
            controls-position="right"
            style="width: 100px"
            :min="0"
          />
        </el-form-item>
        <el-form-item :label="$t('dept.departmentStatus')">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">{{ $t("dept.normal") }}</el-radio>
            <el-radio :label="0">{{ $t("dept.disable") }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">
            {{ $t("dept.confirm") }}
          </el-button>
          <el-button @click="closeDialog"> {{ $t("dept.cancel") }} </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Dept",
  inheritAttrs: false,
});

import DeptAPI from "@/api/dept";
import UserAPI from "@/api/user";
import { UserQuery, UserPageVO, User } from "@/api/user/model";
import { DeptVO, DeptForm, DeptQuery } from "@/api/dept/model";

const queryFormRef = ref(ElForm);
const deptFormRef = ref(ElForm);

const { t } = useI18n();

const loading = ref(false);
const ids = ref<number[]>([]);
const dialog = reactive({
  title: "",
  visible: false,
});

const queryParams = reactive<DeptQuery>({});
const deptList = ref<DeptVO[]>();
const deptHeads = ref<Array<{ value: string | number; label: string }>>([]); // 存储部门负责人列表
const deptOptions = ref<OptionType[]>();

const Params = reactive<UserQuery>({
  pageNum: 1,
  pageSize: 10,
});
const total = ref(0);

const formData = reactive<DeptForm>({
  status: 1,
  parentId: 0,
  sort: 1,
  managerId: null,
});

const rules = reactive({
  parentId: [
    {
      required: true,
      message: t("dept.message.parentId.required"),
      trigger: "blur",
    },
  ],
  name: [
    {
      required: true,
      message: t("dept.message.name.required"),
      trigger: "blur",
    },
  ],
  managerId: [
    {
      required: true,
      message: "部门负责人不能为空",
      trigger: "blur",
    },
  ],
  sort: [
    {
      required: true,
      message: t("dept.message.sort.required"),
      trigger: "blur",
    },
  ],
});
// const rules = computed(() => {
//   return {
//     parentId: [{ required: true, message: t('dept.message.parentId.required'), trigger: "blur" }],
//     name: [{ required: true, message: t('dept.message.name.required'), trigger: "blur" }],
//     sort: [{ required: true, message: t('dept.message.sort.required'), trigger: "blur" }],
//   };
// });

// // 监听下拉框的滚动事件
// const onLoadmore = () => {
//   Params.pageNum++;
//   if (deptHeads.value.length >= total.value) {
//     return;
//   }
//   loadDeptHeads();
// };
// 加载部门负责人列表的方法
const loadDeptHeads = () => {
  UserAPI.getUserList().then((data) => {
    console.log(data);
    deptHeads.value = [
      ...data.map((user: User) => ({
        value: user.id !== undefined ? user.id : "undefined",
        label: user.nickname !== undefined ? user.nickname : "undefined",
      })),
    ];
    console.log(deptHeads.value);
  });
  // UserAPI.getPage(Params).then((data) => {
  //   // 防止关闭之后继续请求加载更多
  //   if (deptHeads.value.length >= total.value) {
  //     return;
  //   }
  //   deptHeads.value = [
  //     ...deptHeads.value,
  //     ...data.list.map((user: UserPageVO) => ({
  //       value: user.id !== undefined ? user.id : "undefined",
  //       label: user.nickname !== undefined ? user.nickname : "undefined",
  //     })),
  //   ];
  //   total.value = data.total;
  // });
};
/** 查询 */
function handleQuery() {
  loading.value = true;
  DeptAPI.getList(queryParams).then((data) => {
    deptList.value = data;
    loading.value = false;
  });
}

/**重置查询 */
function resetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

/** 行复选框选中记录选中ID集合 */
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

/** 获取部门下拉数据  */
async function loadDeptOptions() {
  DeptAPI.getOptions().then((data) => {
    deptOptions.value = [
      {
        value: 0,
        label: t("dept.topDept"),
        children: data,
      },
    ];
  });
}

/**
 * 打开弹窗
 *
 * @param parentId 父部门ID
 * @param deptId 部门ID
 */
async function openDialog(parentId?: number, deptId?: number) {
  await loadDeptOptions();
  dialog.visible = true;
  if (deptId) {
    dialog.title = t("dept.modifyDept");
    DeptAPI.getFormData(deptId).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = t("dept.newDept");
    formData.parentId = parentId ?? 0;
  }
}

/** 表单提交 */
function handleSubmit() {
  deptFormRef.value.validate((valid: any) => {
    if (valid) {
      const deptId = formData.id;
      loading.value = true;
      if (deptId) {
        DeptAPI.update(deptId, formData)
          .then(() => {
            ElMessage.success(t("dept.successModify"));
            closeDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        DeptAPI.add(formData)
          .then(() => {
            ElMessage.success(t("dept.addSuccessfully"));
            closeDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

/** 删除部门 */
function handleDelete(deptId?: number) {
  const deptIds = [deptId || ids.value].join(",");

  if (!deptIds) {
    ElMessage.warning(t("dept.message.remove.check"));
    return;
  }

  ElMessageBox.confirm(
    `${t("dept.Confirm_selected_data_items")}?`,
    t("dept.message.remove.warn"),
    {
      confirmButtonText: t("dept.confirm"),
      cancelButtonText: t("dept.cancel"),
      type: "warning",
    }
  ).then(() => {
    DeptAPI.deleteByIds(deptIds).then(() => {
      ElMessage.success(t("dept.message.remove.successDelete"));
      resetQuery();
    });
  });
}

/** 关闭弹窗 */
function closeDialog() {
  dialog.visible = false;
  resetForm();
}

/** 重置表单  */
function resetForm() {
  deptFormRef.value.resetFields();
  deptFormRef.value.clearValidate();

  formData.id = undefined;
  formData.parentId = 0;
  formData.status = 1;
  formData.sort = 1;
}

onMounted(() => {
  handleQuery();
  loadDeptHeads();
});
</script>
@/api/dept/model
