<script setup>
import { computed, ref, reactive } from "vue";
import ConditionItemConfig from "./ConditionItemConfig.vue";
import WDialog from "../../../../common/WDialog.vue";
import { _formFields } from "../../../FormInterface.ts";
import { ElMessage } from "element-plus";
import { ProcessCondition } from "@/utils/ConditionCompare.ts";

const props = defineProps({
  name: String,
  modelValue: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const _value = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});
defineEmits(["update:modelValue", "delete"]);

//构建总选项
const cdOptions = computed(() => {
  //提取表单字段，过滤不支持的选项
  return _formFields.value.filter((v) => ProcessCondition.FORM[v.type]);
});

const addCdVisible = ref(false);
const baseCd = ref({});

function addCondition() {
  addCdVisible.value = true;
  baseCd.value = {
    group: null,
    type: null,
    symbol: null,
    name: [],
    valueType: null,
  };
}

function addConditionConfirm() {
  if (baseCd.value.type && baseCd.value.symbol) {
    addCdVisible.value = false;
    _value.value.conditions.push({
      ...baseCd.value,
      compare: null, //比较关系
      compareVal: [], //比较值集合
    });
  } else {
    ElMessage.warning("请选择条件类别");
  }
}
</script>

<template>
  <div class="w-condition-group">
    <div>
      <el-text>{{ name }}</el-text>
      <div>
        <el-text style="margin-right: 10px">组内条件关系:</el-text>
        <el-switch
          v-model="_value.logic"
          active-text="且"
          inactive-text="或"
        ></el-switch>
      </div>
      <div>
        <el-button link icon="Plus" type="primary" @click="addCondition"
          >添加条件</el-button
        >
        <el-button link icon="Delete" type="danger" @click="$emit('delete')"
          >删除</el-button
        >
      </div>
    </div>
    <div>
      <div class="w-cd-group-tip" v-if="_value.conditions.length === 0">
        <el-text>请点击上方 + 添加条件选项</el-text>
      </div>
      <el-form label-position="top" label-width="100" class="w-cd-group-item">
        <el-form-item v-for="(cd, i) in _value.conditions" :key="cd.id">
          <template #label>
            <el-text truncated>{{ (cd.name || []).join("-") }}</el-text>
          </template>
          <condition-item-config
            v-model="_value.conditions[i]"
            :type="ProcessCondition[cd.group][cd.type]?.type"
            style="display: inline-block; width: calc(100% - 20px)"
          />
          <el-icon class="w-cd-del" @click="_value.conditions.splice(i, 1)">
            <Delete />
          </el-icon>
        </el-form-item>
      </el-form>
    </div>
    <w-dialog
      :border="false"
      title="选择条件类别"
      width="500"
      v-model="addCdVisible"
      @ok="addConditionConfirm"
    >
      <el-select
        style="width: 45%"
        v-model="baseCd.group"
        @change="baseCd.symbol = null"
      >
        <el-option
          label="发起人"
          value="INITIATOR"
          @click="baseCd.name[0] = '发起人'"
        ></el-option>
        <el-option
          label="表单"
          value="FORM"
          @click="baseCd.name[0] = '表单'"
        ></el-option>
      </el-select>
      <el-text style="margin: 0 10px">的</el-text>
      <el-select
        style="width: 45%"
        v-model="baseCd.type"
        @change="(v) => (baseCd.symbol = v)"
        v-if="baseCd.group === 'INITIATOR'"
      >
        <el-option
          label="本人/部门"
          value="Org"
          @click="baseCd.name[1] = '本人/部门'"
        />
        <el-option label="角色" value="Role" @click="baseCd.name[1] = '角色'" />
      </el-select>
      <el-select
        style="width: 45%"
        v-model="baseCd.type"
        v-else-if="baseCd.group === 'FORM'"
      >
        <el-option
          v-for="item in cdOptions"
          :label="item.name"
          :value="item.type"
          :key="item.key"
          @click="
            baseCd.symbol = item.key;
            baseCd.name[1] = item.name;
          "
        />
      </el-select>
      <el-text type="warning" v-else>👀请选择左侧类别</el-text>
    </w-dialog>
  </div>
</template>

<style scoped lang="scss">
.w-condition-group {
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
  margin-bottom: 20px;

  .w-cd-group-tip {
    text-align: center;
    padding: 10px 0;
  }

  & > :first-child {
    padding: 0 5px;
    display: flex;
    align-items: center;
    background-color: var(--el-border-color);

    & > :first-child {
      flex: 1;
    }

    & > :nth-child(2) {
      display: flex;
      align-items: center;
      margin-right: 100px;
    }
  }

  & > :nth-child(2) {
    padding: 10px;
  }
}

:deep(.w-cd-group-item) {
  .w-cd-del {
    color: var(--el-color-danger);
    padding: 3px;
    cursor: pointer;
    box-sizing: content-box;
  }

  .el-form-item__label {
    margin-bottom: 0 !important;
  }
}
</style>
