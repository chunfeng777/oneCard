<template>
  <span v-if="selectedOption">{{ selectedOption.label }}</span>
  <span v-else>{{ placeholder }}</span>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeMount, computed } from "vue";
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
  placeholder: {
    type: String,
    default: "请选择",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const options: Ref<OptionType[]> = ref([]); // 字典下拉数据源

const selectedValue = ref<string | number | undefined>();

const selectedOption = computed(() => {
  return options.value.find((option) => option.value === selectedValue.value);
});

watch([options, () => props.modelValue], ([newOptions, newModelValue]) => {
  if (newOptions.length === 0) return; // 下拉数据源加载未完成不回显
  if (newModelValue == undefined) {
    selectedValue.value = undefined;
    return;
  }
  if (typeof newOptions[0].value === "number") {
    selectedValue.value = Number(newModelValue);
  } else if (typeof newOptions[0].value === "string") {
    selectedValue.value = String(newModelValue);
  } else {
    selectedValue.value = newModelValue;
  }
});

onBeforeMount(() => {
  // 根据字典类型编码(typeCode)获取字典选项
  DictAPI.getDictOptions(props.typeCode).then((data) => {
    options.value = data;
  });
});
</script>
