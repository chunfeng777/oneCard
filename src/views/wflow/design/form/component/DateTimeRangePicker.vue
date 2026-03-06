<script setup>
import FormComponentMixin from "../FormComponentMixin.ts";
import moment from "moment";
import { computed } from "vue";

const props = defineProps({
  ...FormComponentMixin.props,
});
const emit = defineEmits([...FormComponentMixin.emits]);
const _value = computed(FormComponentMixin.computed._value(props, emit));

const type = computed(() => {
  switch (props.config.props.format) {
    case "YYYY-MM-DD":
      return "daterange";
    case "YYYY-MM-DD HH:mm":
      return "datetimerange";
    default:
      return "daterange";
  }
});

// 计算时长
const timeLength = computed(() => {
  if (Array.isArray(_value.value)) {
    const start = moment(_value.value[0]).format(
      props.config.props.format.replaceAll("dd", "DD")
    );
    const end = moment(_value.value[1]).format(
      props.config.props.format.replaceAll("dd", "DD")
    );

    if (start === end) {
      return "0 （时长为0，请确认）";
    }

    const mstart = moment(start);
    const mend = moment(end);

    let years = mend.diff(mstart, "years");
    let months = mend.diff(mstart, "months");
    let days = mend.diff(mstart, "days");
    let hours = mend.diff(mstart, "hours");
    let minutes = mend.diff(mstart, "minutes");
    minutes = minutes % 60;
    hours = hours % 24;
    months = months % 12;

    if (mstart.date() < mend.date()) {
      days = mend.date() - mstart.date();
      if (minutes > 0 || hours > 0) {
        days--;
      }
    }

    if (days > 31 && mend.month() - mstart.month() >= 2) {
      days = mend.diff(
        mstart.add(mend.month() - mstart.month() - 1, "month"),
        "days"
      );
    }

    return `${years > 0 ? years + "年 " : ""}${
      months > 0 ? months + "个月 " : ""
    }${days > 0 ? days + "天 " : ""}${hours > 0 ? hours + "小时 " : ""}${
      minutes > 0 ? minutes + "分钟" : ""
    }`;
  } else {
    return "先选择时间哦";
  }
});

// 是否显示时长
// const showLength = ref(true);
const showLength = computed(() => props.config.props.showLength);
</script>

<template>
  <!-- <el-date-picker
    v-model="_value"
    clearable
    :value-format="config.props.format"
    :format="config.props.format"
    :type="type"
    :start-placeholder="config.props.placeholder[0]"
    :end-placeholder="config.props.placeholder[1]"
  /> -->

  <el-date-picker
    v-model="_value"
    clearable
    :value-format="config.props.format"
    :format="config.props.format"
    :type="type"
    :start-placeholder="config.props.placeholder[0]"
    :end-placeholder="config.props.placeholder[1]"
  />
  <div v-if="showLength" class="length">
    <span>时长：</span>
    <span>{{ timeLength }}</span>
  </div>
</template>

<style scoped></style>
