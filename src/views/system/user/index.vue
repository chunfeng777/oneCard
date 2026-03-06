<!-- 用户管理 -->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 用户列表 -->
      <el-col :lg="24" :xs="24">
        <div class="search-container">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item :label="$t('user.keyword')" prop="keywords">
              <el-input
                v-model="queryParams.keywords"
                :placeholder="$t('user.keywordValue')"
                clearable
                style="width: 200px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item :label="$t('user.status')" prop="status">
              <el-select
                v-model="queryParams.status"
                :placeholder="$t('user.all')"
                clearable
                class="!w-[100px]"
              >
                <el-option :label="$t('user.enable')" value="1" />
                <el-option :label="$t('user.disable')" value="0" />
              </el-select>
            </el-form-item>

            <el-form-item :label="$t('user.creationTime')">
              <el-date-picker
                class="!w-[240px]"
                v-model="dateTimeRange"
                type="daterange"
                range-separator="~"
                :start-placeholder="$t('user.startTime')"
                :end-placeholder="$t('user.endTime')"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleQuery"
                ><i-ep-search />{{ $t("user.search") }}</el-button
              >
              <el-button @click="resetQuery">
                <i-ep-refresh />
                {{ $t("user.reset") }}</el-button
              >
            </el-form-item>
          </el-form>
        </div>

        <el-card shadow="never" class="table-container">
          <template #header>
            <div class="flex justify-between">
              <div>
                <el-button
                  v-hasPerm="['sys:user:add']"
                  type="success"
                  @click="openDialog('user-form')"
                  ><i-ep-plus />{{ $t("user.new") }}</el-button
                >
                <el-button
                  v-hasPerm="['sys:user:delete']"
                  type="danger"
                  :disabled="removeIds.length === 0"
                  @click="handleDelete()"
                  ><i-ep-delete />{{ $t("user.delete") }}</el-button
                >
              </div>
              <!-- <div>
                <el-dropdown split-button>
                  {{ $t("user.import") }}
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="downloadTemplate">
                        <i-ep-download />{{
                          $t("user.downloadTemplate")
                        }}</el-dropdown-item
                      >
                      <el-dropdown-item @click="openDialog('user-import')">
                        <i-ep-top />{{
                          $t("user.importData")
                        }}</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-button class="ml-3" @click="handleExport"
                  ><template #icon><i-ep-download /></template
                  >{{ $t("user.export") }}</el-button
                >
              </div> -->
            </div>
          </template>

          <el-table
            v-loading="loading"
            :data="pageData"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column
              key="id"
              :label="$t('user.id')"
              align="center"
              prop="id"
              width="120"
            />
            <el-table-column
              key="username"
              :label="$t('user.username')"
              align="center"
              prop="username"
              width="220"
            />
            <el-table-column
              :label="$t('user.nickname')"
              width="220"
              align="center"
              prop="nickname"
            />

            <el-table-column
              :label="$t('user.gender')"
              width="220"
              align="center"
              prop="genderLabel"
            />

            <el-table-column
              :label="$t('user.tel')"
              align="center"
              prop="mobile"
              width="120"
            />

            <el-table-column
              :label="$t('user.status')"
              align="center"
              prop="status"
            >
              <template #default="scope">
                <el-tag :type="scope.row.status == 1 ? 'success' : 'info'">{{
                  scope.row.status == 1
                    ? `${$t("user.enable")} `
                    : `${$t("user.disable")} `
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('user.creationTime')"
              align="center"
              prop="createTime"
              width="180"
            />
            <el-table-column
              :label="$t('user.operate')"
              fixed="right"
              width="220"
            >
              <template #default="scope">
                <el-button
                  v-hasPerm="['sys:user:password:reset']"
                  type="primary"
                  size="small"
                  link
                  @click="resetPassword(scope.row)"
                  ><i-ep-refresh-left />{{
                    $t("user.resetPassword")
                  }}</el-button
                >
                <el-button
                  v-hasPerm="['sys:user:edit']"
                  type="primary"
                  link
                  size="small"
                  @click="openDialog('user-form', scope.row.id)"
                  ><i-ep-edit />{{ $t("user.edit") }}</el-button
                >
                <el-button
                  v-hasPerm="['sys:user:delete']"
                  type="primary"
                  link
                  size="small"
                  @click="handleDelete(scope.row.id)"
                  ><i-ep-delete />{{ $t("user.delete") }}</el-button
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
        v-if="dialog.type === 'user-form'"
        ref="userFormRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item :label="$t('user.username')" prop="username">
          <el-input
            v-model="formData.username"
            :readonly="!!formData.id"
            :placeholder="$t('user.message.username.required')"
          />
        </el-form-item>

        <el-form-item :label="$t('user.nickname')" prop="nickname">
          <el-input
            v-model="formData.nickname"
            :placeholder="$t('user.message.nickname.required')"
          />
        </el-form-item>

        <el-form-item :label="$t('user.gender')" prop="gender">
          <Dict
            :placeholder="$t('user.message.pleaseSelect.required')"
            v-model="formData.gender"
            code="gender"
          />
        </el-form-item>

        <el-form-item :label="$t('user.role')" prop="roleIds">
          <el-select
            v-model="formData.roleIds"
            multiple
            :placeholder="$t('user.message.pleaseSelect.required')"
          >
            <el-option
              v-for="item in roleList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('user.tel')" prop="mobile">
          <el-input
            v-model="formData.mobile"
            :placeholder="$t('user.message.tel.required')"
            maxlength="11"
          />
        </el-form-item>

        <el-form-item :label="$t('user.email')" prop="email">
          <el-input
            v-model="formData.email"
            :placeholder="$t('user.message.email.required')"
            maxlength="50"
          />
        </el-form-item>

        <el-form-item :label="$t('user.status')" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">{{ $t("user.normal") }}</el-radio>
            <el-radio :label="0">{{ $t("user.disable") }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <!-- 用户导入表单 -->
      <el-form
        v-else-if="dialog.type === 'user-import'"
        :model="importData"
        label-width="100px"
      >
        <!-- <el-form-item :label="$t('user.department')">
          <el-tree-select
            v-model="importData.deptId"
            :placeholder="$t('user.message.department.required')"
            :data="deptList"
            filterable
            check-strictly
          />
        </el-form-item> -->

        <el-form-item :label="$t('user.execl')">
          <el-upload
            ref="uploadRef"
            action=""
            drag
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            :limit="1"
            :auto-upload="false"
            :file-list="importData.fileList"
            :on-change="handleFileChange"
            :on-exceed="handleFileExceed"
          >
            <el-icon class="el-icon--upload">
              <i-ep-upload-filled />
            </el-icon>
            <div class="el-upload__text">
              {{ $t("user.dragFilesHere") }}
              <em>{{ $t("user.upload") }}</em>
            </div>
            <template #tip>
              <div>xls/xlsx files</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <!-- 弹窗底部操作按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">{{
            $t("user.confirm")
          }}</el-button>
          <el-button @click="closeDialog">{{ $t("user.cancel") }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "User",
  inheritAttrs: false,
});

import UserAPI from "@/api/user";
// import DeptAPI from "@/api/dept";
import RoleAPI from "@/api/role";

import { UserForm, UserQuery, UserPageVO } from "@/api/user/model";
import type { UploadInstance } from "element-plus";
import { genFileId } from "element-plus";
import { useUserStore } from "@/store";

const { t } = useI18n();
const userStore = useUserStore();
const queryFormRef = ref(ElForm); // 查询表单
const userFormRef = ref(ElForm); // 用户表单
const uploadRef = ref<UploadInstance>(); // 上传组件

const loading = ref(false); //  加载状态
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const queryParams = reactive<UserQuery>({
  pageNum: 1,
  pageSize: 10,
});
const dateTimeRange = ref("");
const total = ref(0); // 数据总数
const pageData = ref<UserPageVO[]>(); // 用户分页数据
// const deptList = ref<OptionType[]>(); // 部门下拉数据源
const roleList = ref<OptionType[]>(); // 角色下拉数据源

watch(dateTimeRange, (newVal) => {
  if (newVal) {
    queryParams.startTime = newVal[0];
    queryParams.endTime = newVal[1];
  }
});

// 弹窗对象
const dialog = reactive({
  visible: false,
  type: "user-form",
  width: 800,
  title: "",
});

// 用户表单数据
const formData = reactive<UserForm>({
  status: 1,
});

// 用户导入数据
const importData = reactive({
  deptId: undefined,
  file: undefined,
  fileList: [],
});

// 校验规则
const rules = reactive({
  username: [
    {
      required: true,
      message: t("user.message.rules.username"),
      trigger: "blur",
    },
  ],
  nickname: [
    {
      required: true,
      message: t("user.message.rules.nickname"),
      trigger: "blur",
    },
  ],
  deptId: [
    {
      required: true,
      message: t("user.message.rules.deptId"),
      trigger: "blur",
    },
  ],
  roleIds: [
    {
      required: true,
      message: t("user.message.rules.roleIds"),
      trigger: "blur",
    },
  ],
  email: [
    {
      pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
      message: t("user.message.rules.email"),
      trigger: "blur",
    },
  ],
  mobile: [
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: t("user.message.rules.tel"),
      trigger: "blur",
    },
  ],
});

/** 查询 */
function handleQuery() {
  loading.value = true;
  UserAPI.getPage(queryParams)
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
  dateTimeRange.value = "";
  queryParams.pageNum = 1;
  queryParams.deptId = undefined;
  queryParams.startTime = undefined;
  queryParams.endTime = undefined;
  handleQuery();
}

/** 行选中 */
function handleSelectionChange(selection: any) {
  removeIds.value = selection.map((item: any) => item.id);
}

/** 重置密码 */
function resetPassword(row: { [key: string]: any }) {
  if (
    userStore.user.userId !== row.id &&
    userStore.user.roles.indexOf("ADMIN") == -1 &&
    userStore.user.roles.indexOf("ROOT") == -1
  ) {
    ElMessage.warning(t("user.message.password.notallow"));
    return;
  }
  ElMessageBox.prompt(
    t("user.message.password.user") +
      row.username +
      t("user.message.password.newPassword"),
    t("user.resetPassword"),
    {
      confirmButtonText: t("user.confirm"),
      cancelButtonText: t("user.cancel"),
      inputPattern: /^.{6,}$/, // 正则表达式，匹配至少6位的字符串
      inputErrorMessage: "密码长度不能小于6位", // 输入错误时的提示信息
    }
  ).then(({ value }) => {
    UserAPI.updatePassword(row.id, value).then(() => {
      ElMessage.success(t("user.message.password.resetSuccessful") + value);
    });
  });
}

/** 加载角色下拉数据源 */
async function loadRoleOptions() {
  RoleAPI.getOptions().then((data) => {
    roleList.value = data;
  });
}

// /** 加载部门下拉数据源 */
// async function loadDeptOptions() {
//   DeptAPI.getOptions().then((data) => {
//     deptList.value = data;
//   });
// }

/**
 * 打开弹窗
 *
 * @param type 弹窗类型  用户表单：user-form | 用户导入：user-import
 * @param id 用户ID
 */
async function openDialog(type: string, id?: number) {
  dialog.visible = true;
  dialog.type = type;

  if (dialog.type === "user-form") {
    // 用户表单弹窗
    // await loadDeptOptions();
    await loadRoleOptions();
    if (id) {
      dialog.title = t("user.message.userForm.modifyUser");
      UserAPI.getFormData(id).then((data) => {
        Object.assign(formData, { ...data });
      });
    } else {
      dialog.title = t("user.message.userForm.addUser");
    }
  } else if (dialog.type === "user-import") {
    // 用户导入弹窗
    dialog.title = t("user.message.userForm.importUsers");
    dialog.width = 600;
    // loadDeptOptions();
  }
}

/**
 * 关闭弹窗
 *
 * @param type 弹窗类型  用户表单：user-form | 用户导入：user-import
 */
function closeDialog() {
  dialog.visible = false;
  if (dialog.type === "user-form") {
    userFormRef.value.resetFields();
    userFormRef.value.clearValidate();

    formData.id = undefined;
    formData.status = 1;
  } else if (dialog.type === "user-import") {
    importData.file = undefined;
    importData.fileList = [];
  }
}

/** 表单提交 */
const handleSubmit = useThrottleFn(() => {
  if (dialog.type === "user-form") {
    userFormRef.value.validate((valid: any) => {
      if (valid) {
        // 创建一个新的对象，不包括 createTime
        //
        const {
          id,
          status,
          username,
          nickname,
          mobile,
          gender,
          avatar,
          email,
          deptId,
          deptName,
          roleIds,
          roleNames,
        } = formData;
        const formDataToSubmit = {
          id,
          status,
          username,
          nickname,
          mobile,
          gender,
          avatar,
          email,
          deptId,
          deptName,
          roleIds,
          roleNames,
        };
        const userId = formDataToSubmit.id;

        loading.value = true;
        if (userId) {
          UserAPI.update(userId, formDataToSubmit)
            .then(() => {
              ElMessage.success(t("user.message.userForm.modification"));
              closeDialog();
              resetQuery();
            })
            .finally(() => (loading.value = false));
        } else {
          UserAPI.add(formDataToSubmit)
            .then(() => {
              ElMessage.success(t("user.message.userForm.addition"));
              closeDialog();
              resetQuery();
            })
            .finally(() => (loading.value = false));
        }
      }
    });
  } else if (dialog.type === "user-import") {
    if (!importData?.deptId) {
      ElMessage.warning(t("user.message.userImport.department"));
      return false;
    }
    if (!importData?.file) {
      ElMessage.warning(t("user.message.userImport.excel"));
      return false;
    }
    UserAPI.import(importData?.deptId, importData?.file).then((data) => {
      ElMessage.success(t("user.message.userImport.import"));
      closeDialog();
      resetQuery();
    });
  }
}, 3000);

/** 删除用户 */
function handleDelete(id?: number) {
  const userIds = [id || removeIds.value].join(",");
  if (!userIds) {
    ElMessage.warning(t("user.message.remove.check"));
    return;
  }

  ElMessageBox.confirm(
    t("user.message.remove.deletion"),
    t("user.message.remove.warn"),
    {
      confirmButtonText: t("user.confirm"),
      cancelButtonText: t("user.cancel"),
      type: "warning",
    }
  ).then(function () {
    UserAPI.deleteByIds(userIds).then(() => {
      ElMessage.success(t("user.message.remove.successDelete"));
      resetQuery();
    });
  });
}

/** 下载导入模板 */
function downloadTemplate() {
  UserAPI.downloadTemplate().then((response: any) => {
    const fileData = response.data;
    const fileName = decodeURI(
      response.headers["content-disposition"].split(";")[1].split("=")[1]
    );
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";

    const blob = new Blob([fileData], { type: fileType });
    const downloadUrl = window.URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);
    downloadLink.click();

    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(downloadUrl);
  });
}

/** Excel文件 Change */
function handleFileChange(file: any) {
  importData.file = file.raw;
}

/** Excel文件 Exceed  */
function handleFileExceed(files: any) {
  uploadRef.value!.clearFiles();
  const file = files[0];
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
  importData.file = file;
}

/** 导出用户 */
function handleExport() {
  UserAPI.export(queryParams).then((response: any) => {
    const fileData = response.data;
    const fileName = decodeURI(
      response.headers["content-disposition"].split(";")[1].split("=")[1]
    );
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";

    const blob = new Blob([fileData], { type: fileType });
    const downloadUrl = window.URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);
    downloadLink.click();

    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(downloadUrl);
  });
}

onMounted(() => {
  handleQuery();
});
</script>
