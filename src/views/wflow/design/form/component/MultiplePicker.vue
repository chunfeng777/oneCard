<script setup>
import FormComponentMixin from "../FormComponentMixin.ts";
import { computed } from "vue";

const props = defineProps({
  ...FormComponentMixin.props,
});
const emit = defineEmits([...FormComponentMixin.emits]);
const _value = computed(FormComponentMixin.computed._value(props, emit));
</script>

<template>
  <el-checkbox-group v-if="config.props.expanding" v-model="_value">
    <el-checkbox
      v-for="(op, i) in config.props.options"
      :label="op"
      :value="op"
      :key="i"
    />
  </el-checkbox-group>
  <el-select v-else v-model="_value" multiple>
    <el-option
      v-for="(op, i) in config.props.options"
      :label="op"
      :value="op"
      :key="i"
    />
  </el-select>
</template>

<style scoped>
</style>
