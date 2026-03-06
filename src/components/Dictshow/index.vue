<template>{{ option.label }}</template>

<script setup lang="ts">
import DictAPI from "@/api/dict";

const props = defineProps({
  /**
   * 字典类型编码(eg: 性别-gender)
   */
  typeCode: {
    type: String,
    required: true,
  },
  modelValue: {
    type: [String, Number],
  },
});

const option: Ref<OptionType> = ref({
  value: "",
  label: "",
});
const options: Ref<OptionType[]> = ref([]); // 字典下拉数据源

watch(
  () => props.modelValue,
  (New, old) => {
    options.value.forEach((item) => {
      if (item.value == New) {
        option.value = item;
      }
    });
  }
);

onBeforeMount(() => {
  // 根据字典类型编码(typeCode)获取字典选项
  DictAPI.getDictOptions(props.typeCode).then((data) => {
    options.value = data;
    data.forEach((item) => {
      if (item.value == props.modelValue) {
        option.value = item;
      }
    });
  });
});
</script>
