<script setup>
import FormComponentMixin from "../FormComponentMixin.ts";

const props = defineProps({
  ...FormComponentMixin.props,
});
const emit = defineEmits([...FormComponentMixin.emits]);
const _value = computed(FormComponentMixin.computed._value(props, emit));
</script>

<template>
  <el-input
    show-word-limit
    :rows="3"
    type="textarea"
    :maxlength="config.props.max || 255"
    :placeholder="config.props.placeholder"
    v-model="_value"
  />
</template>

<style scoped>
</style>
