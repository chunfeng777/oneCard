<template>
  <div>
    <el-form-item label="字段KEY">
      <el-input v-model="config.key" placeholder="请输入字段唯一key值" />
    </el-form-item>
    <el-form-item label="字段名称">
      <el-input v-model="config.name" placeholder="请设置字段名称" />
    </el-form-item>
    <!-- <el-form-item label="数量限制">
      <span content="限制最大上传图片数量（为0则不限制）"></span>
      <el-input-number
        class="max-fill"
        controls-position="right"
        :precision="0"
        v-model="config.props.maxNumber"
        placeholder="最多上传几张图片"
      />
    </el-form-item>
    <el-form-item label="大小限制">
      <span content="限制单个文件最大大小-MB（为0则不限制）"></span>
      <el-input-number
        class="max-fill"
        controls-position="right"
        :precision="1"
        v-model="config.props.maxSize"
        placeholder="单个文件最大大小"
      />
    </el-form-item> -->
    <!-- <el-form-item label="类型限制">
      <span content="限制上传文件的后缀类型"></span>
      <el-select
        style="width: 100%"
        v-model="config.props.fileTypes"
        multiple
        filterable
        allow-create
        default-first-option
        clearable
        placeholder="允许上传文件的后缀格式，可设置多种"
      >
        <el-option
          v-for="type in fileTypeOptions"
          :key="type"
          :label="type"
          :value="type"
        />
      </el-select>
    </el-form-item> -->
    <!-- <el-form-item label="不可下载">
      <el-switch v-model="config.props.onlyRead"></el-switch>
    </el-form-item> -->
    <el-form-item label="隐藏名称">
      <el-switch v-model="config.props.hideLabel" />
    </el-form-item>
    <el-form-item label="是否必填">
      <el-switch v-model="config.props.required" />
    </el-form-item>
  </div>
</template>

<script setup>
import FormComponentMixin from "../FormComponentMixin.ts";

// 定义允许的文件格式选项
const fileTypeOptions = [".jpg", ".png", ".pdf", ".docx", ".xlsx"];
const emit = defineEmits([...FormComponentMixin.emits]);

const props = defineProps({
  ...FormComponentMixin.props,
});
</script>
<style lang="scss" scoped>
</style>

