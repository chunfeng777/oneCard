<template>
  <div>
    <div class="customerbtn">
      <el-button type="success" @click="showAddDialog"
        ><i-ep-plus />添加客户</el-button
      >
      <div class="excelBtn">
        <el-button type="success" @click="exportToExcel">导出</el-button>

        <el-popover placement="bottom" :width="200" trigger="click">
          <template #default>
            <div class="importBtn">
              <el-button type="primary" @click="downloadTemplate"
                ><i-ep-Download />下载模板</el-button
              >
              <el-button type="primary" @click="DialogImport"
                ><i-ep-Upload />开始导入</el-button
              >
            </div>
          </template>
          <template #reference>
            <el-button type="success">导入</el-button>
          </template>
        </el-popover>
      </div>
      <div class="search">
        <el-input
          class="s_input"
          placeholder="搜索客户"
          v-model="pageQuery.keywords"
        />
        <el-button @click="handleSearch" type="primary"
          ><i-ep-Search />搜索</el-button
        >
        <el-button @click="handleAll" type="primary"
          ><i-ep-Refresh />重置</el-button
        >
      </div>
    </div>
    <div class="customerList">
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
        <el-table-column prop="customerSource" label="客户来源" />
        <!-- <el-table-column prop="customerLevel" label="客户等级" width="140px" /> -->
        <!-- <el-table-column prop="industry" label="所属行业" /> -->
        <!-- <el-table-column prop="customerIntroduction" label="客户介绍" /> -->
        <el-table-column prop="contactPerson" label="联系人" width="140px" />
        <el-table-column prop="phone" label="联系电话" width="140px" />
        <!-- <el-table-column prop="gender" label="性别" width="60px" /> -->
        <el-table-column prop="email" label="邮箱" />
        <!-- <el-table-column prop="wechatNumber" label="微信号" /> -->
        <el-table-column prop="remark" label="备注" width="200px" />
        <!-- <el-table-column prop="customerStatus" label="客户状态" /> -->
        <!-- <el-table-column prop="customerIntention" label="客户意向" /> -->
        <el-table-column label="最近跟进时间" width="160px">
          <template #default="scope">
            {{ formatTime(scope.row.maxFollowTime) }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="下次跟进时间">
          <template #default="scope">
            {{ formatTime(scope.row.maxNextFollowTime) }}
          </template>
        </el-table-column> -->
        <el-table-column label="建立时间">
          <template #default="scope">
            {{ formatTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button
              type="primary"
              @click="showDetailDialog(row)"
              link
              size="small"
              ><i-ep-Link />详情</el-button
            >
            <el-button
              type="primary"
              @click="showEditDialog(row)"
              link
              size="small"
              ><i-ep-edit />编辑</el-button
            >
            <el-button
              type="primary"
              @click="logicalDeletion(row)"
              link
              size="small"
              ><i-ep-delete />废弃</el-button
            >
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
      <!-- 客户弹窗（添加、编辑） -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        :width="dialog.width"
        class="customerDialog"
        append-to-body
      >
        <el-form
          ref="ruleFormRef"
          :model="form"
          :rules="rules"
          label-width="120px"
          class="el-dialog-div"
        >
          <!-- <el-form-item label="ID">
            <el-input v-model="form.id" />
          </el-form-item> -->
          <el-form-item label="客户名称" prop="customerName">
            <el-input
              v-model="form.customerName"
              placeholder="请输入客户名称"
            />
          </el-form-item>
          <el-form-item label="客户来源" prop="customerSource">
            <el-input
              v-model="form.customerSource"
              placeholder="请输入客户来源"
            />
          </el-form-item>
          <el-form-item label="客户等级" prop="customerLevel">
            <el-input
              v-model="form.customerLevel"
              placeholder="请输入客户等级"
            />
          </el-form-item>
          <el-form-item label="所属行业" prop="industry">
            <el-input
              v-model="form.industry"
              placeholder="请输入客户所属行业"
            />
          </el-form-item>
          <el-form-item label="地址" prop="address">
            <el-input v-model="form.address" placeholder="请输入客户地址" />
          </el-form-item>
          <el-form-item label="年龄" prop="age">
            <el-input v-model="form.age" placeholder="请输入客户年龄" />
          </el-form-item>
          <el-form-item label="链接发送" prop="linkSendStatus">
            <!-- <el-input
              v-model="form.linkSendStatus"
              placeholder="是否发送链接"
            /> -->
            <el-radio-group v-model="form.linkSendStatus">
              <el-radio :label="0">否</el-radio>
              <el-radio :label="1">是</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="是否进群" prop="groupJoinStatus">
            <!-- <el-input v-model="form.groupJoinStatus" placeholder="是否进群" /> -->
            <el-radio-group v-model="form.groupJoinStatus">
              <el-radio :label="0">否</el-radio>
              <el-radio :label="1">是</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="客户介绍" prop="customerIntroduction">
            <el-input
              v-model="form.customerIntroduction"
              placeholder="请输入客户介绍"
            />
          </el-form-item>
          <el-form-item label="联系人" prop="contactPerson">
            <el-input v-model="form.contactPerson" placeholder="请输入联系人" />
          </el-form-item>
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入联系电话" />
          </el-form-item>
          <el-form-item label="性别" prop="gender">
            <el-select v-model="form.gender" placeholder="请选择性别">
              <el-option label="男" value="1" />
              <el-option label="女" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="微信号" prop="wechatNumber">
            <el-input v-model="form.wechatNumber" placeholder="请输入微信号" />
          </el-form-item>
          <el-form-item label="QQ号" prop="qqNumber">
            <el-input v-model="form.qqNumber" placeholder="请输入QQ号" />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" placeholder="请输入备注" />
          </el-form-item>
          <!-- <el-form-item label="创建时间">
            <el-input v-model="form.createTime" />
          </el-form-item>
          <el-form-item label="更新时间">
            <el-input v-model="form.updateTime" />
          </el-form-item>
          <el-form-item label="创建人">
            <el-input v-model="form.createName" />
          </el-form-item> -->
          <el-form-item label="客户状态" prop="customerStatus">
            <el-input
              v-model="form.customerStatus"
              placeholder="请输入客户状态"
            />
          </el-form-item>
          <el-form-item label="客户意向" prop="customerIntention">
            <el-input
              v-model="form.customerIntention"
              placeholder="请输入客户意向"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button
              type="primary"
              @click="submitForm()"
              v-if="dialog.type !== 'formDetail'"
              >确定</el-button
            >
          </span>
        </template>
      </el-dialog>
      <!-- 详情 -->
      <el-dialog
        v-model="detailDialogVisible"
        title="客户详情"
        width="1200px"
        class="customerDetailDialog"
        append-to-body
      >
        <el-descriptions class="customerDescriptions">
          <el-descriptions-item label="客户名称:">{{
            form.customerName
          }}</el-descriptions-item>
          <el-descriptions-item label="客户来源:">{{
            form.customerSource
          }}</el-descriptions-item>
          <el-descriptions-item label="客户等级:">{{
            form.customerLevel
          }}</el-descriptions-item>
          <el-descriptions-item label="所属行业:">{{
            form.industry
          }}</el-descriptions-item>
          <el-descriptions-item label="地址:">{{
            form.address
          }}</el-descriptions-item>
          <el-descriptions-item label="年龄:">{{
            form.age
          }}</el-descriptions-item>
          <el-descriptions-item label="是否发送链接:">{{
            Number(form.linkSendStatus) === 1 ? "是" : "否"
          }}</el-descriptions-item>
          <el-descriptions-item label="是否进群:">{{
            Number(form.groupJoinStatus) === 1 ? "是" : "否"
          }}</el-descriptions-item>
          <el-descriptions-item label="客户介绍:">{{
            form.customerIntroduction
          }}</el-descriptions-item>
          <el-descriptions-item label="联系人:">{{
            form.contactPerson
          }}</el-descriptions-item>
          <el-descriptions-item label="联系电话:">{{
            form.phone
          }}</el-descriptions-item>
          <el-descriptions-item label="性别:">{{
            Number(form.gender) === 1 ? "男" : "女"
          }}</el-descriptions-item>
          <el-descriptions-item label="邮箱:">{{
            form.email
          }}</el-descriptions-item>
          <el-descriptions-item label="备注:">{{
            form.remark
          }}</el-descriptions-item>
          <el-descriptions-item label="客户状态:">{{
            form.customerStatus
          }}</el-descriptions-item>
          <el-descriptions-item label="客户意向:">{{
            form.customerIntention
          }}</el-descriptions-item>
          <el-descriptions-item label="建立时间:">
            {{ formatTime(form.createTime) }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">跟进记录</el-divider>
        <el-button type="primary" @click="addFollowRecord()"
          ><i-ep-plus />新建跟进记录</el-button
        >
        <el-table :data="form.list">
          <el-table-column fixed prop="name" label="客户名称" />
          <el-table-column prop="followWay" label="跟进方式" />

          <el-table-column label="跟进时间">
            <template #default="scope">
              {{ formatTime(scope.row.followTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="communicationContent" label="沟通内容" />
          <el-table-column prop="currentStage" label="当前阶段" />
          <el-table-column prop="salesLead" label="销售机会" />
          <el-table-column label="下次跟进时间">
            <template #default="scope">
              {{ formatTime(scope.row.nextFollowTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button
                type="info"
                :icon="Message"
                circle
                @click="info(row)"
                plain
              />
              <el-button
                type="primary"
                :icon="Edit"
                circle
                @click="upd(row)"
                plain
              />
              <el-button
                type="danger"
                :icon="Delete"
                circle
                @click="del(row)"
                plain
              />
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>

      <!-- 新建跟进记录对话框 -->
      <el-dialog v-model="showDialog" title="新增跟进记录" width="50%">
        <el-form
          :model="formInline"
          class="demo-form-inline"
          ref="FormRef"
          :rules="rulesForm"
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
              type="datetime"
              v-model="formInline.followTime"
              placeholder="跟进时间"
              clearable
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DDTHH:mm:ss"
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
              type="datetime"
              v-model="formInline.nextFollowTime"
              placeholder="下次跟进时间"
              clearable
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DDTHH:mm:ss"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showDialog = false">取 消</el-button>
            <el-button type="primary" @click="onSubmit">提 交</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 跟进记录详情 -->
      <el-dialog
        v-model="detailDialog"
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
          <el-descriptions-item label="	跟进时间:"
            >{{ formatTime(formInline.followTime) }}
          </el-descriptions-item>
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
      <!-- 跟进记录编辑 -->
      <el-dialog
        v-model="showDialogUpd"
        title="修改跟进信息"
        width="1000px"
        append-to-body
      >
        <el-form
          :model="formInline"
          class="demo-form-inline"
          ref="FormRef"
          :rules="rulesForm"
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
              type="datetime"
              v-model="formInline.followTime"
              placeholder="跟进时间"
              clearable
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DDTHH:mm:ss"
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
              type="datetime"
              v-model="formInline.nextFollowTime"
              placeholder="下次跟进时间"
              clearable
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DDTHH:mm:ss"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showDialogUpd = false">取消</el-button>
            <el-button type="primary" @click="submitFormUpd()">确定</el-button>
          </span>
        </template>
      </el-dialog>
      <el-dialog
        v-model="showDialogImport"
        title="导入客户"
        width="1000px"
        append-to-body
      >
        <!-- 导入表单 -->
        <el-form :model="importData" label-width="100px">
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
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showDialogImport = false">取消</el-button>
            <el-button type="primary" @click="importToExcel()">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CustomerAPI from "@/api/customer";
import { Customer, CustomerList } from "@/api/customer/model";
import { Delete, Edit, Message } from "@element-plus/icons-vue";
import type { UploadInstance } from "element-plus";
import { genFileId } from "element-plus";
import XLSX from "xlsx";
import dayjs from "dayjs";

// 导入客户
const showDialogImport = ref(false);
// 导入客户数据
const importData = reactive({
  file: undefined,
  fileList: [],
});
const uploadRef = ref<UploadInstance>(); // 上传组件

// 客户id
const id = ref();

// 新建跟进记录
const showDialog = ref(false);
const formInline = reactive({
  id: null,
  name: "",
  customerId: null,
  followWay: "",
  followTime: "",
  communicationContent: "",
  currentStage: "",
  salesLead: "",
  nextFollowTime: "",
  createId: null,
  createName: "",
  createTime: "",
  updateTime: "",
});
// 跟进记录详情弹窗
const detailDialog = ref(false);
// 跟进记录编辑弹窗
const showDialogUpd = ref(false);

const FormRef = ref(ElForm);
const ruleFormRef = ref(ElForm);
const detailDialogVisible = ref(false); // 控制详情弹窗的显示

const dialogVisible = ref(false); // 控制新增/编辑弹窗的显示
const dialogTitle = ref(""); // 弹窗标题
const tableData = ref([]);
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
    findAll();
  }, 300); // 300ms 防抖时间
};

// 清空（获取所有数据）
const handleAll = () => {
  tableData.value = [];
  pageQuery.keywords = "";
  findAll();
};

// 重置按钮
const reset = () => {
  formInline.name = "";
  formInline.followWay = "";
  formInline.followTime = "";
  formInline.communicationContent = "";
  formInline.currentStage = "";
  formInline.salesLead = "";
  formInline.nextFollowTime = "";
  formInline.id = null;
};
// 时间格式化
const formatTime = (time: any) => {
  if (!time) return "";
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};

// 添加跟进记录
const addFollowRecord = () => {
  showDialog.value = true;
  reset();
};
// 提交表单

const onSubmit = () => {
  FormRef.value.validate((valid: any) => {
    if (valid) {
      formInline.customerId = id.value;

      CustomerAPI.AddFollowRecords(formInline).then((res) => {
        ElMessage.success("添加成功");
        // 关闭弹窗
        showDialog.value = false;
        formInline.id = formInline.customerId;
        // 重新获取详情最新数据
        fetchCustomerData(formInline);
        // 获取表格最新数据
        findAll();
        // 清空表单数据
        reset();
      });
    }
  });
};
// 跟进记录详情
const info = (row: any) => {
  detailDialog.value = true;
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
    // 用户点击确认后才执行删除操作
    CustomerAPI.DelFollowRecords(row.id)
      .then((res: any) => {
        ElMessage.success("删除成功");
        // 删除成功后重新设置 id 并刷新客户数据
        row.id = row.customerId;
        fetchCustomerData(row);
        findAll();
      })
      .catch((error: any) => {
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
// 修改跟进记录
const submitFormUpd = () => {
  FormRef.value.validate((valid: any) => {
    if (valid) {
      const ids = formInline.id;
      formInline.customerId = id.value;
      CustomerAPI.UpdFollowRecords(ids, formInline).then((res: any) => {
        ElMessage.success("修改成功");
        // 关闭弹窗
        showDialogUpd.value = false;
        formInline.id = formInline.customerId;

        fetchCustomerData(formInline);
        findAll();
      });
    }
  });
};

// 导出
const exportToExcel = () => {
  CustomerAPI.exportCustmoer(pageQuery).then((response: any) => {
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
};
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
const DialogImport = () => {
  showDialogImport.value = true;
};
// 导入
const importToExcel = () => {
  if (!importData?.file) {
    ElMessage.warning("上传Excel文件不能为空");
    return false;
  }
  CustomerAPI.importCustmoer(importData.file)
    .then((data: any) => {
      ElMessage.success("导入成功");
      showDialogImport.value = false;
      // 清除文件列表数据
      uploadRef.value?.clearFiles();
      findAll();
    })
    .catch((error) => {
      ElMessage.error("导入失败，请重试");
      console.error(error);
    });
};

// 弹窗对象
const dialog = reactive({
  type: "formAdd",
  width: 1000,
});

// 客户分页
const findAll = () => {
  CustomerAPI.customerPage(pageQuery).then((response: any) => {
    // 客户分页数据列表
    const customers = response.list;

    // 处理每个客户的最大跟进时间和下次跟进时间
    const processedCustomers = processCustomers(customers);

    // 直接替换整个 tableData 的内容
    tableData.value = processedCustomers;
    // console.log(tableData.value);

    // 设置 total
    total.value = response.total;
  });
};

// 计算最大时间的函数
const processCustomers = (customers: any[]) => {
  customers.forEach((customer: any) => {
    if (customer.list && customer.list.length > 0) {
      // 找到最大跟进时间（followTime）
      const maxFollowTime = customer.list.reduce((max: any, item: any) => {
        return new Date(item.followTime) > new Date(max)
          ? item.followTime
          : max;
      }, customer.list[0].followTime);

      // 找到最大下次跟进时间（nextFollowTime）
      const maxNextFollowTime = customer.list.reduce((max: any, item: any) => {
        return new Date(item.nextFollowTime) > new Date(max)
          ? item.nextFollowTime
          : max;
      }, customer.list[0].nextFollowTime);

      // 将最大时间赋值到 customer 对象中
      customer.maxFollowTime = maxFollowTime;
      customer.maxNextFollowTime = maxNextFollowTime;
    } else {
      // 如果 list 为空，设置默认值为 null
      customer.maxFollowTime = null;
      customer.maxNextFollowTime = null;
    }
  });

  return customers;
};

// 移到废弃客户列表
const logicalDeletion = (row: any) => {
  // 弹出确认框
  ElMessageBox.confirm("确定把该客户移到废弃客户列表吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    // 用户点击确定后执行删除逻辑
    CustomerAPI.logicalDeletion(row.id)
      .then((res) => {
        ElMessage.success("客户已成功移到废弃客户列表");
        findAll(); // 删除成功后刷新客户列表
      })
      .catch((error) => {
        ElMessage.error("删除操作失败，请稍后再试"); // 处理删除失败的情况
      });
  });
};

// 弹窗表单
const form = reactive({
  id: undefined,
  customerName: "",
  customerSource: "",
  customerLevel: "",
  industry: "",
  address: "",
  age: "",
  linkSendStatus: 0, // 默认为0（否）
  groupJoinStatus: 0, // 默认为0（否）
  customerIntroduction: "",
  // conductBusiness: "",
  contactPerson: "",
  phone: "",
  gender: "",
  email: "",
  wechatNumber: "",
  qqNumber: "",
  remark: "",
  // deleted: true,
  createTime: "",
  // updateTime: "",
  // createName: "",
  customerStatus: "",
  customerIntention: "",
  list: [
    {
      name: "",
      followWay: "",
      followTime: "",
      communicationContent: "",
      currentStage: "",
      salesLead: "",
      nextFollowTime: "",
      createName: "",
    },
  ],
});

const rules = reactive({
  customerName: [
    { required: true, message: "请输入客户名称", trigger: "blur" },
  ],
  /*   customerSource: [
    { required: true, message: "请输入客户来源", trigger: "blur" },
  ],
  customerLevel: [
    { required: true, message: "请输入客户等级", trigger: "blur" },
  ],
  industry: [{ required: true, message: "请输入所属行业", trigger: "blur" }],
  customerIntroduction: [
    { required: true, message: "请输入客户介绍", trigger: "blur" },
  ],
  contactPerson: [{ required: true, message: "请输入联系人", trigger: "blur" }], */
  phone: [{ required: true, message: "请输入联系电话", trigger: "blur" }],
  gender: [{ required: true, message: "请选择性别", trigger: "change" }],
  /* email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    // { type: "email", message: "请输入正确的邮箱地址", trigger: "change" },
  ],
  wechatNumber: [{ required: true, message: "请输入微信号", trigger: "blur" }],
  qqNumber: [{ required: true, message: "请输入QQ号", trigger: "blur" }],
  remark: [{ required: true, message: "请输入备注", trigger: "blur" }],
  customerStatus: [
    { required: true, message: "请输入客户状态", trigger: "blur" },
  ],
  customerIntention: [
    { required: true, message: "请输入客户意向", trigger: "blur" },
  ], */
});

const rulesForm = reactive({
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
// 显示添加客户弹窗
const showAddDialog = () => {
  dialog.type = "formAdd";
  resetForm();
  dialogTitle.value = "新增客户";
  dialogVisible.value = true;
};
// 显示编辑客户弹窗
const showEditDialog = (row: any) => {
  dialog.type = "formEdit"; // 设置弹窗类型为编辑
  dialogTitle.value = "编辑客户"; // 设置弹窗标题
  fetchCustomerData(row); // 加载客户数据
  dialogVisible.value = true; // 打开弹窗
};

// 显示客户详情弹窗
const showDetailDialog = (row: any) => {
  id.value = row.id;
  console.log(id.value);
  dialog.type = "formDetail"; // 设置弹窗类型为详情
  fetchCustomerData(row); // 加载客户数据
  detailDialogVisible.value = true; // 打开详情弹窗
};

// 表单重置
const resetForm = () => {
  form.id = undefined;
  form.customerName = "";
  form.customerSource = "";
  form.customerLevel = "";
  form.industry = "";
  form.address = "";
  form.age = "";
  form.linkSendStatus = 0;
  form.groupJoinStatus = 0;
  form.customerIntroduction = "";
  // form.conductBusiness = "";
  form.contactPerson = "";
  form.phone = "";
  form.gender = "";
  form.email = "";
  form.wechatNumber = "";
  form.qqNumber = "";
  form.remark = "";
  form.customerStatus = "";
  form.customerIntention = "";
};
// 表单提交
const submitForm = () => {
  ruleFormRef.value.validate((valid: any) => {
    if (valid) {
      if (dialog.type === "formAdd") {
        CustomerAPI.customerAdd(form).then(() => {
          ElMessage.success("客户添加成功");
          dialogVisible.value = false;
          findAll();
        });
      } else if (dialog.type === "formEdit") {
        const id = form.id;
        CustomerAPI.customerEdit(id, form).then(() => {
          ElMessage.success("客户信息更新成功");
          dialogVisible.value = false;
          findAll();
        });
      }
    }
  });
};
// 详情 获取客户数据
const fetchCustomerData = (row: any) => {
  CustomerAPI.customerForm(row.id).then((res) => {
    Object.assign(form, res); // 将返回的数据赋值到表单
  });
};

// 导入模板下载
const downloadTemplate = () => {
  CustomerAPI.customerTemplate().then((res) => {
    // console.log(res, "res");
    const fileData = res.data;
    const fileName = decodeURI(
      res.headers["content-disposition"].split(";")[1].split("=")[1]
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
};

onMounted(() => {
  findAll();
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

.customerbtn {
  display: flex;
  padding: 20px 0 0 20px;
}

.search {
  display: flex;
  margin-left: 20px;
}

.s_input {
  width: 260px;
  margin-right: 5px;
}

.customerList {
  padding: 20px;
}

.el-dialog-div {
  height: 60vh;
  overflow: auto;
}

.excelBtn {
  display: flex;
  margin-left: 20px;
}

.importBtn {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.importBtn .el-button {
  flex: 1;
  margin: 5px; /* 调整按钮之间的间距 */
}
</style>
