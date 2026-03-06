<script setup>
import RoleAPI from "@/api/role";
const roleList = ref([]);

defineExpose({ validate });
function validate() {
  return new Promise((resolve) => resolve());
}
const props = defineProps({
  modelValue: Object,
});

const form = ref();
const _value = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});
onMounted(() => {
  RoleAPI.getOptions().then((data) => {
    roleList.value = data;
    console.log(roleList.value);
  });
  console.log("_value", props);
});
</script>

<template>
  <el-main class="w-designer-base">
    <el-form ref="form" :rules="rules" :model="_value" label-position="top">
      <el-form-item prop="permissionType" required label="角色权限">
        <el-select
          multiple
          style="width: calc(100% - 140px); padding-right: 20px"
          v-model="_value.permissionType"
          placeholder="请选择角色"
        >
          <el-option
            :value="role.code"
            :label="role.label"
            v-for="(role, index) in roleList"
            :key="index"
          />
        </el-select>
      </el-form-item>
    </el-form>
  </el-main>
</template>

<style lang="scss" scoped>
.w-designer-base {
  width: 800px;
  min-height: calc(100vh - 100px);
  margin: 0 auto;
  background-color: white;
  border-radius: 5px;
}
</style>
