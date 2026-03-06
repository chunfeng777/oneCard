<!-- NoticeDetailDialog.vue -->
<template>
  <el-dialog :title="title" v-model="open" width="780px" append-to-body>
    <el-form ref="formRef" :model="form" label-width="80px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="公告标题" prop="title">
            <el-input
              v-model="form.title"
              placeholder="请输入公告标题"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="公告类型" prop="type">
            <Dict
              v-model="form.type"
              code="notice"
              placeholder="请选择公告类型"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发布人" prop="createName">
            <el-input v-model="form.createName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发布时间" prop="createTime">
            <el-input :value="formatTime(form.createTime)" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-radio-group v-model="form.status" disabled>
              <el-radio :label="1">正常</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="指定部门">
            <el-tree-select
              v-model="form.depId"
              placeholder="请选择部门"
              :data="deptList"
              filterable
              check-strictly
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="内容">
            <el-input
              type="textarea"
              v-model="form.content"
              :rows="10"
              placeholder="请输入内容"
              disabled
              :style="{ fontSize: '18px' }"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, PropType } from "vue";
import dayjs from "dayjs";
import NoticeAPI from "@/api/notice";
import DeptAPI from "@/api/dept";
import { useNotificationStore } from "@/store";

const deptList = ref<OptionType[]>(); // 部门下拉列表
const notificationStore = useNotificationStore();

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  notice: {
    type: Object as PropType<any>,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const open = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const title = ref("公告详情");
const form = reactive({
  title: "",
  type: "",
  createName: "",
  createTime: "",
  status: 1,
  depId: "",
  content: "",
});

const formatTime = (time: any) => {
  if (!time) return "";
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};

// 获取部门下拉选项
const getDeptOptions = async () => {
  const res = await DeptAPI.getOptions();
  deptList.value = res;
};

const handleDetail = (noticeId: any) => {
  NoticeAPI.getNoticeDetail(noticeId).then((resp) => {
    Object.assign(form, resp);
    // 已读后刷新通知列表
    notificationStore.updateLastUpdated();
  });
  open.value = true;
};

watch(
  () => props.notice,
  (newNotice) => {
    if (newNotice) {
      handleDetail(newNotice);
    }
  },
  { immediate: true }
);
onMounted(() => {
  getDeptOptions();
});
</script>
