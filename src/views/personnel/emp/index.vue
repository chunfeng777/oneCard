<!-- 用户管理 -->
320
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
                placeholder="员工姓名/编号/手机号"
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
                <el-option label="在职" value="1" />
                <el-option label="离职" value="0" />
              </el-select>
            </el-form-item>

            <el-form-item label="创建时间">
              <el-date-picker
                class="!w-[240px]"
                v-model="dateTimeRange"
                type="daterange"
                range-separator="~"
                start-placeholder="开始时间"
                end-placeholder="截止时间"
                value-format="YYYY-MM-DD"
              />
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
                  v-hasPerm="['per:emp:add']"
                  type="success"
                  @click="openDialog('emp-form')"
                  ><i-ep-plus />新增</el-button
                >
                <el-button
                  v-hasPerm="['per:emp:delete']"
                  type="danger"
                  :disabled="removeIds.length === 0"
                  @click="handleDelete()"
                  ><i-ep-delete />删除</el-button
                >
              </div>
              <!-- <div>
                <el-dropdown split-button>
                  导入
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="downloadTemplate">
                        <i-ep-download />下载模板</el-dropdown-item
                      >
                      <el-dropdown-item @click="openDialog('emp-import')">
                        <i-ep-top />导入数据</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-button class="ml-3" @click="handleExport"
                  ><template #icon><i-ep-download /></template>导出</el-button
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
              label="员工编号"
              align="center"
              prop="employeeNum"
              width="100"
            />
            <el-table-column
              key="name"
              label="姓名"
              width="120"
              align="center"
              prop="name"
            />
            <el-table-column
              label="性别"
              width="100"
              align="center"
              prop="genderLabel"
            />

            <el-table-column
              label="部门"
              width="180"
              align="center"
              prop="deptName"
            />
            <el-table-column
              label="手机号码"
              align="center"
              prop="phone"
              width="180"
            />

            <el-table-column
              label="状态"
              align="center"
              prop="status"
              width="100"
            >
              <template #default="scope">
                <el-tag :type="scope.row.status == 1 ? 'success' : 'info'">{{
                  scope.row.status == 1 ? "在职" : "离职"
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="入职时间"
              align="center"
              prop="hireDate"
              width="200"
            />
            <el-table-column label="操作" fixed="right" width="320">
              <template #default="scope">
                <el-button
                  v-hasPerm="['per:emp:info']"
                  type="primary"
                  link
                  size="small"
                  @click="openDialog('emp-item-form', scope.row.id)"
                  ><i-ep-documentCopy />详情</el-button
                >
                <el-button
                  v-hasPerm="['per:emp:edit']"
                  type="primary"
                  link
                  size="small"
                  @click="openDialog('emp-form', scope.row.id)"
                  ><i-ep-edit />编辑</el-button
                >
                <el-button
                  v-hasPerm="['per:emp:delete']"
                  type="primary"
                  link
                  size="small"
                  @click="handleDelete(scope.row.id)"
                  ><i-ep-delete />删除</el-button
                >
                <!-- <el-button
                  v-hasPerm="['sys:employees:bind']"
                  type="primary"
                  link
                  size="small"
                  v-if="scope.row.userId == null"
                  @click="openDialog('emp-bind-user', scope.row.id)"
                  ><i-ep-user />绑定</el-button
                >
                <el-button
                  v-hasPerm="['sys:employees:bind']"
                  type="danger"
                  link
                  size="small"
                  v-else
                  @click="unBind(scope.row.id)"
                  ><i-ep-user />解除绑定</el-button
                > -->
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
        v-if="dialog.type === 'emp-form'"
        ref="empFormRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
        class="el-dialog-div"
      >
        <el-form-item label="编号" prop="employeeNum">
          <el-input
            v-model="formData.employeeNum"
            placeholder="请输入员工编号"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <!-- :readonly="!!formData.id" -->
          <el-input v-model="formData.name" placeholder="请输入员工姓名" />
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <Dict v-model="formData.gender" code="gender" />
        </el-form-item>

        <el-form-item label="所属部门" prop="deptId">
          <el-tree-select
            v-model="formData.deptId"
            placeholder="请选择所属部门"
            :data="deptList"
            filterable
            check-strictly
            :render-after-expand="false"
            @change="formData.deptId && handleDeptChange(formData.deptId, true)"
          />
        </el-form-item>
        <el-form-item label="绑定用户" prop="userId">
          <el-select
            v-model="formData.userId"
            placeholder="请选择用户绑定"
            filterable
            clearable
            popper-append-to-body
            style="width: 100%"
            ref="selectRef"
            popper-class="single-select-loadmore"
          >
            <el-option
              v-for="item in userList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="手机号码" prop="phone">
          <el-input
            v-model="formData.phone"
            placeholder="请输入手机号码"
            maxlength="11"
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="formData.email"
            placeholder="请输入邮箱"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="学历" prop="educationLevel">
          <el-input
            v-model="formData.educationLevel"
            placeholder="请输入学历"
          />
        </el-form-item>

        <el-form-item label="出生日期" prop="birthDate">
          <el-date-picker
            v-model="formData.birthDate"
            type="date"
            placeholder="请选择出生日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="入职日期" prop="hireDate">
          <el-date-picker
            v-model="formData.hireDate"
            type="date"
            placeholder="请选择入职日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <!-- <el-form-item label="职位" prop="position">
          <el-input v-model="formData.positionId" placeholder="请输入职位" />
        </el-form-item> -->
        <el-form-item label="职位" prop="positionId">
          <el-tree-select
            v-model="formData.positionId"
            placeholder="请选择部门职位"
            :data="positionsList"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item label="住址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入员工住址" />
        </el-form-item>

        <el-form-item label="银行卡号" prop="bankCardNumber">
          <el-input
            v-model="formData.bankCardNumber"
            placeholder="请输入银行卡号"
          />
        </el-form-item>

        <el-form-item label="发卡银行" prop="bankName">
          <el-input v-model="formData.bankName" placeholder="请输入发卡银行" />
        </el-form-item>

        <el-form-item label="社保号码" prop="socialInsuranceNumber">
          <el-input
            v-model="formData.socialInsuranceNumber"
            placeholder="请输入社保号码"
          />
        </el-form-item>

        <el-form-item label="身份证" prop="idNumber">
          <el-input
            v-model="formData.idNumber"
            placeholder="请输入身份证号码"
          />
        </el-form-item>
        <el-form-item label="身份地址" prop="idCardAddress">
          <el-input
            v-model="formData.idCardAddress"
            placeholder="请输入身份证地址"
          />
        </el-form-item>

        <el-form-item label="联系人" prop="emergencyContact">
          <el-input
            v-model="formData.emergencyContact"
            placeholder="请输入紧急联系人名称"
          />
        </el-form-item>
        <el-form-item label="联系电话" prop="emergencyContactPhone">
          <el-input
            v-model="formData.emergencyContactPhone"
            placeholder="请输入紧急联系人电话"
          />
        </el-form-item>
        <el-form-item label="转正时间" prop="confirmationDate">
          <el-date-picker
            v-model="formData.confirmationDate"
            type="date"
            placeholder="请选择转正时间"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="合同到期" prop="contractEndDate">
          <el-date-picker
            v-model="formData.contractEndDate"
            type="date"
            placeholder="请选择合同到期时间"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="健康状况" prop="healthStatus">
          <el-input
            v-model="formData.healthStatus"
            placeholder="请输入健康状况"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">在职</el-radio>
            <el-radio :label="0">离职</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="!formData.status"
          label="离职日期"
          prop="terminationDate"
        >
          <el-date-picker
            v-model="formData.terminationDate"
            type="date"
            placeholder="请输入员工离职日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item
          v-if="!formData.status"
          label="	离职原因"
          prop="terminationReason"
        >
          <el-input
            v-model="formData.terminationReason"
            placeholder="请输入员工离职原因"
          />
        </el-form-item>
      </el-form>

      <!-- 用户表单详情 -->
      <el-form
        v-if="dialog.type === 'emp-item-form'"
        ref="empFormRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
        v-loading="loading"
      >
        <el-descriptions class="empFormData">
          <el-descriptions-item label="编号：">
            {{ formData.employeeNum }}
          </el-descriptions-item>
          <el-descriptions-item label="姓名：">
            {{ formData.name }}
          </el-descriptions-item>
          <el-descriptions-item label="性别：">
            <DictLabel v-model="formData.gender" code="gender" />
          </el-descriptions-item>
          <el-descriptions-item label="部门：">
            {{ formData.deptName }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号码：">
            {{ formData.phone }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱：">
            {{ formData.email }}
          </el-descriptions-item>
          <el-descriptions-item label="学历：">
            {{ formData.educationLevel }}
          </el-descriptions-item>
          <el-descriptions-item label="出生日期：">
            {{ formData.birthDate }}
          </el-descriptions-item>
          <el-descriptions-item label="入职日期：">
            {{ formData.hireDate }}
          </el-descriptions-item>
          <el-descriptions-item label="职位：">
            {{ formData.positionName }}
          </el-descriptions-item>
          <el-descriptions-item label="住址：">
            {{ formData.address }}
          </el-descriptions-item>
          <el-descriptions-item label="银行卡号：">
            {{ formData.bankCardNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="发卡银行：">
            {{ formData.bankName }}
          </el-descriptions-item>
          <el-descriptions-item label="社保号码：">
            {{ formData.socialInsuranceNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="身份证：">
            {{ formData.idNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="身份证地址：">
            {{ formData.idCardAddress }}
          </el-descriptions-item>
          <el-descriptions-item label="联系人：">
            {{ formData.emergencyContact }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话：">
            {{ formData.emergencyContactPhone }}
          </el-descriptions-item>
          <el-descriptions-item label="转正时间：">
            {{ formData.confirmationDate }}
          </el-descriptions-item>
          <el-descriptions-item label="合同到期：">
            {{ formData.contractEndDate }}
          </el-descriptions-item>
          <el-descriptions-item label="健康状况：">
            {{ formData.healthStatus }}
          </el-descriptions-item>
          <el-descriptions-item label="状态：">
            <el-tag :type="formData.status == 1 ? 'success' : 'info'">{{
              formData.status == 1 ? "在职" : "离职"
            }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="!formData.status" label="离职日期：">
            {{ formData.terminationDate }}
          </el-descriptions-item>
          <el-descriptions-item v-if="!formData.status" label="离职原因：">
            {{ formData.terminationReason }}
          </el-descriptions-item>
        </el-descriptions>
      </el-form>

      <!-- 用户导入表单 -->
      <el-form
        v-else-if="dialog.type === 'emp-import'"
        :model="importData"
        label-width="100px"
      >
        <el-form-item label="部门">
          <el-tree-select
            v-model="importData.deptId"
            placeholder="请选择部门"
            :data="deptList"
            filterable
            check-strictly
          />
        </el-form-item>

        <el-form-item label="Excel文件">
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
              将文件拖到此处，或
              <em>点击上传</em>
            </div>
            <template #tip>
              <div>xls/xlsx files</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <!-- 绑定用户表格 -->
      <!-- <el-table
        v-else-if="dialog.type === 'emp-bind-user'"
        :data="userPageData"
        v-loading="loading"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column
          key="username"
          label="用户名"
          align="center"
          prop="username"
          width="200"
        />
        <el-table-column
          label="性别"
          width="200"
          align="center"
          prop="genderLabel"
        />
        <el-table-column
          label="手机号码"
          align="center"
          prop="mobile"
          width="200"
        />
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <el-tag :type="scope.row.status == 1 ? 'success' : 'info'">{{
              scope.row.status == 1 ? `启用 ` : `禁用 `
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="scope">
            <el-button
              v-hasPerm="['sys:user:delete']"
              type="primary"
              link
              size="small"
              @click="handleBind(scope.row.id)"
              >确认绑定</el-button
            >
          </template>
        </el-table-column>
      </el-table> -->
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
  name: "Emp",
  inheritAttrs: false,
});

import UserAPI from "@/api/user";
import EmpAPI from "@/api/emp";
import DeptAPI from "@/api/dept";
import RoleAPI from "@/api/role";

// import { useBoundUsersStore } from "@/store/modules/boundUsers";
import { EmpForm, EmpQuery, EmpPageVO } from "@/api/emp/model";
import { UserForm, UserQuery, UserPageVO, User } from "@/api/user/model";
import type { UploadInstance } from "element-plus";
import { genFileId } from "element-plus";
let employeesId: number;
const queryFormRef = ref(ElForm); // 查询表单
const empFormRef = ref(ElForm); // 用户表单
const uploadRef = ref<UploadInstance>(); // 上传组件

const loading = ref(false); //  加载状态
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const queryParams = reactive<EmpQuery>({
  pageNum: 1,
  pageSize: 10,
});
const dateTimeRange = ref("");
const total = ref(0); // 数据总数
const pageData = ref<EmpPageVO[]>(); // 用户分页数据
const userPageData = ref<UserPageVO[]>(); // 用户分页数据
const deptList = ref<OptionType[]>(); // 部门下拉数据源
const roleList = ref<OptionType[]>(); // 角色下拉数据源
const userList = ref<Array<{ value: string | number; label: string }>>([]); // 用户下拉数据源
const positionsList = ref<OptionType[]>();
//const positionsList = ref<Position[]>(); // 职位下拉数据源

// async function handleDeptChange(deptId: number) {
//   EmpAPI.getPositionsByDeptId(deptId).then((data) => {
//     positionsList.value = data;
//   });
// }
async function handleDeptChange(deptId: number | undefined, isReset: boolean) {
  EmpAPI.getPositionsByDeptId(deptId).then((data) => {
    // positionsList.value = data;
    // 仅选择状态为活跃的职位
    console.log("All positions:", data); // 打印所有职位信息
    const activePositions = data.filter(
      (item) => item.status.toString() === "1"
    );
    console.log("Active positions:", activePositions); // 打印筛选后的活跃职位信息
    const formattedData = activePositions.map((OptionType) => ({
      label: OptionType.name,
      value: OptionType.id,
    }));
    if (isReset) {
      formData.positionId = undefined; // 重置职位选择
    }

    positionsList.value = formattedData;
  });
}

watch(dateTimeRange, (newVal) => {
  if (newVal) {
    queryParams.startTime = newVal[0];
    queryParams.endTime = newVal[1];
  }
});

// 弹窗对象
const dialog = reactive({
  visible: false,
  type: "emp-form",
  width: 800,
  title: "",
});

// 用户表单数据
const formData = reactive<EmpForm>({
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
  employeeNum: [
    { required: true, message: "员工编号不能为空", trigger: "blur" },
  ],
  name: [{ required: true, message: "姓名不能为空", trigger: "blur" }],
  gender: [{ required: true, message: "请选择性别", trigger: "blur" }],
  deptId: [{ required: true, message: "所属部门不能为空", trigger: "blur" }],
  userId: [{ required: true, message: "请选择要绑定的用户", trigger: "blur" }],
  phone: [
    {
      required: true,
      message: "电话号码不能为空",
      trigger: "blur",
    },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的电话号码",
      trigger: ["blur", "change"],
    },
  ],
  email: [
    {
      required: true,
      message: "邮箱不能为空",
      trigger: "blur",
    },
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "请输入有效的邮箱地址",
      trigger: ["blur", "change"],
    },
  ],
  birthDate: [
    {
      required: true,
      message: "出生日期不能为空",
      trigger: "blur",
    },
    {
      pattern: /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
      message: "请输入有效的出生日期，格式为YYYY-MM-DD",
      trigger: ["blur", "change"],
    },
  ],
  hireDate: [
    {
      required: true,
      message: "入职日期不能为空",
      trigger: "blur",
    },
    {
      pattern: /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
      message: "请输入有效的入职日期，格式为YYYY-MM-DD",
      trigger: ["blur", "change"],
    },
  ],
  bankCardNumber: [
    {
      required: true,
      message: "银行卡号不能为空",
      trigger: "blur",
    },
    {
      pattern: /^\d{16,19}$/,
      message: "请输入有效的银行卡号，长度为16至19位的数字",
      trigger: ["blur", "change"],
    },
  ],
  emergencyContact: [
    {
      required: true,
      message: "紧急联系人不能为空",
      trigger: "blur",
    },
  ],
  emergencyContactPhone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的电话号码",
      trigger: "blur",
    },
  ],
  bankName: [
    {
      required: true,
      message: "发卡银行不能为空",
      trigger: "blur",
    },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z\s\-&]+$/,
      message:
        "请输入有效的发卡银行，只允许使用中文、字母、空格和以下特殊字符：- &",
      trigger: ["blur", "change"],
    },
  ],
  socialInsuranceNumber: [
    {
      required: true,
      message: "社保号码不能为空",
      trigger: "blur",
    },
    {
      pattern: /^[0-9]{9}$/,
      message: "请输入有效的社保号码，必须为9位数字",
      trigger: ["blur", "change"],
    },
  ],
  address: [{ required: true, message: "地址不能为空", trigger: "blur" }],
  idNumber: [
    {
      required: true,
      message: "身份证号码不能为空",
      trigger: "blur",
    },
    {
      pattern:
        /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[1-2]\d|3[0-1])\d{3}[0-9Xx]$/,
      message: "请输入有效的身份证号码",
      trigger: ["blur", "change"],
    },
  ],
  status: [{ required: true, message: "请选择员工状态", trigger: "blur" }],
  educationLevel: [
    { required: true, message: "学历不能为空", trigger: "blur" },
  ],
  idCardAddress: [
    { required: true, message: "身份证地址不能为空", trigger: "blur" },
  ],
  confirmationDate: [
    {
      required: true,
      message: "转正日期不能为空",
      trigger: "blur",
    },
    {
      pattern: /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
      message: "请输入有效的转正日期，格式为YYYY-MM-DD",
      trigger: ["blur", "change"],
    },
  ],
  contractEndDate: [
    {
      required: true,
      message: "合同到期日期不能为空",
      trigger: "blur",
    },
    {
      pattern: /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
      message: "请输入有效的合同到期日期，格式为YYYY-MM-DD",
      trigger: ["blur", "change"],
    },
  ],

  // email: [
  //   {
  //     pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
  //     message: "请输入正确的邮箱地址",
  //     trigger: "blur",
  //   },
  // ],
  // phone: [
  //   {
  //     pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
  //     message: "请输入正确的手机号码",
  //     trigger: "blur",
  //   },
  // ],
});

/** 查询 */
function handleQuery() {
  loading.value = true;
  EmpAPI.getPage(queryParams)
    .then((data) => {
      // console.log("handleQuery", data);
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

/** 重置详情formData */
function resteFormData() {
  formData.employeeNum = undefined;
  formData.id = undefined;
  formData.name = undefined;
  formData.genderLabel = undefined;
  formData.gender = undefined;
  formData.deptName = undefined;
  formData.deptId = undefined;
  formData.userId = undefined;
  formData.phone = undefined;
  formData.email = undefined;
  formData.birthDate = undefined;
  formData.hireDate = undefined;
  formData.positionName = undefined;
  formData.positionId = undefined;
  formData.address = undefined;
  formData.bankCardNumber = undefined;
  formData.bankName = undefined;
  formData.socialInsuranceNumber = undefined;
  formData.idNumber = undefined;
  formData.emergencyContact = undefined;
  formData.emergencyContactPhone = undefined;
  formData.healthStatus = undefined;
  formData.status = undefined;
  formData.terminationDate = undefined;
  formData.terminationReason = undefined;

  formData.status = 1;
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

// const onLoadmore = () => {
//   // 这里就可以开始处理分页逻辑了;
//   queryParams.pageNum++;
//   if (userList.value.length >= total.value) {
//     return;
//   }
//   loadUserOptions();
// };
/** 加载用户下拉数据源 */
async function loadUserOptions() {
  UserAPI.getUserList().then((data) => {
    console.log(data);

    userList.value = [
      ...data.map((user: User) => ({
        value: user.id !== undefined ? user.id : "undefined",
        label: user.username !== undefined ? user.username : "undefined",
      })),
    ];
  });
}

/**
 * 打开弹窗
 *
 * @param type 弹窗类型  emp-form | emp-import
 * @param id 用户ID
 */
async function openDialog(type: string, id?: number) {
  dialog.visible = true;
  dialog.type = type;

  if (dialog.type === "emp-form") {
    deptList.value = [];
    roleList.value = [];
    userList.value = [];
    positionsList.value = [];
    queryParams.pageNum = 1;
    // 用户表单弹窗
    await loadDeptOptions();
    await loadRoleOptions();
    await loadUserOptions();
    if (id) {
      dialog.title = "修改员工信息";
      EmpAPI.getFormData(id).then((data) => {
        Object.assign(formData, { ...data });
        handleDeptChange(formData.deptId, false);
      });
    } else {
      dialog.title = "新增员工";
    }
  } else if (dialog.type === "emp-import") {
    // 用户导入弹窗
    dialog.title = "导入员工";
    dialog.width = 600;
    loadDeptOptions();
  } else if (dialog.type === "emp-item-form") {
    loading.value = true;
    if (id) {
      dialog.title = "员工详情";
      dialog.width = 1200;
      EmpAPI.getFormData(id)
        .then(async (data) => {
          data.deptName = (await DeptAPI.getFormData(data.deptId)).name;
          if (data.deptId !== undefined) {
            const positions = await EmpAPI.getPositionsByDeptId(data.deptId);
            const position = positions.find(
              (pos) => pos.id === data.positionId
            );
            data.positionName = position ? position.name : "";
          }
          // data.gender == 1
          //   ? (data.genderLabel = "男")
          //   : (data.genderLabel = "女");
          Object.assign(formData, { ...data });
        })
        .finally(() => (loading.value = false));
    }
  }
  // else if (dialog.type === "emp-bind-user") {
  //   loading.value = true;
  //   if (id) {
  //     employeesId = id;
  //     dialog.title = "绑定用户";
  //     dialog.width = 1200;
  //     UserAPI.getPage(queryParams)
  //       .then((data) => {
  //         console.log("findAll", data.list);
  //         userList.value = data.list;
  //         const activePositions = data.list.filter((item) => item.status === 1);
  //         activePositions.map((item) => item.id);
  //         userPageData.value = activePositions;
  //         total.value = data.total;
  //       })
  //       .finally(() => {
  //         loading.value = false;
  //       });
  //   }
  // }
}

/**
 * 关闭弹窗
 *
 * @param type 弹窗类型  用户表单：emp-form | 用户导入：emp-import
 */
function closeDialog() {
  dialog.visible = false;
  if (dialog.type === "emp-form") {
    empFormRef.value.resetFields();
    empFormRef.value.clearValidate();

    formData.id = undefined;
    formData.status = 1;
  } else if (dialog.type === "emp-import") {
    importData.file = undefined;
    importData.fileList = [];
  } else if (dialog.type === "emp-item-form") {
    resteFormData();
  } else if (dialog.type === "emp-bind-user") {
    handleQuery();
  }
}

/** 表单提交 */
const handleSubmit = useThrottleFn(() => {
  if (dialog.type === "emp-form") {
    empFormRef.value.validate((valid: any) => {
      if (valid) {
        const empId = formData.id;
        loading.value = true;
        if (empId) {
          EmpAPI.update(empId, formData)
            .then(() => {
              ElMessage.success("修改员工成功");
              closeDialog();
              resetQuery();
            })
            .finally(() => (loading.value = false));
        } else {
          EmpAPI.add(formData)
            .then(() => {
              ElMessage.success("新增员工成功");
              closeDialog();
              resetQuery();
            })
            .finally(() => (loading.value = false));
        }
      }
    });
  } else if (dialog.type === "emp-import") {
    if (!importData?.deptId) {
      ElMessage.warning("请选择部门");
      return false;
    }
    if (!importData?.file) {
      ElMessage.warning("上传Excel文件不能为空");
      return false;
    }
    EmpAPI.import(importData?.deptId, importData?.file).then((data) => {
      ElMessage.success("导入员工成功");
      closeDialog();
      resetQuery();
    });
  } else if (dialog.type === "emp-item-form") {
    closeDialog();
    resetQuery();
  }
}, 3000);

/** 删除员工 */
function handleDelete(id?: number) {
  const empIds = [id || removeIds.value].join(",");
  if (!empIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除员工?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(function () {
    EmpAPI.deleteByIds(empIds).then(() => {
      ElMessage.success("删除成功");
      resetQuery();
    });
  });
}

// 绑定用户
// function handleBind(id?: number) {
//   console.log("用户id", id);
//   ElMessageBox.confirm("确认绑定该用户?", "确认", {
//     confirmButtonText: "确定",
//     cancelButtonText: "取消",
//     type: "success",
//   }).then(function () {
//     const userId = id || 0;
//     const empId = employeesId;
//     // 获取 boundUsersStore 实例
//     // const boundUsersStore = useBoundUsersStore();
//     // 判断 userId 是否已经绑定过
//     // if (boundUsersStore.isAlreadyBound(userId)) {
//     //   ElMessage.warning("该用户已经绑定了员工");
//     //   return;
//     // }
//     console.log("员工id", empId);
//     EmpAPI.handleBindUser(empId, userId).then(() => {
//       // boundUsersStore.handleBind(userId);
//       ElMessage.success("绑定成功");
//       closeDialog(); // 绑定成功后关闭弹窗
//     });
//   });
// }
// 解除绑定
// function unBind(id?: number) {
//   console.log("员工id", id);
//   ElMessageBox.confirm("确认解绑该用户?", "确认", {
//     confirmButtonText: "确定",
//     cancelButtonText: "取消",
//     type: "warning",
//   }).then(() => {
//     const empId = id || 0;

//     EmpAPI.handleUnBindUser(empId).then(() => {
//       // const boundUsersStore = useBoundUsersStore();
//       // boundUsersStore.handleUnBind(id || 0);
//       ElMessage.success("解绑成功");
//       //location.reload();
//       // 调用重新获取用户数据更新界面的函数
//       handleQuery();
//     });
//   });
// }

/** 下载导入模板 */
function downloadTemplate() {
  EmpAPI.downloadTemplate().then((response: any) => {
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
  EmpAPI.export(queryParams).then((response: any) => {
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

<style scoped>
:deep(.empFormData .el-descriptions__cell) {
  padding-bottom: 50px !important;
}

.empFormData {
  padding-top: 30px;
}

.el-dialog-div {
  height: 60vh;
  overflow: auto;
}
</style>
