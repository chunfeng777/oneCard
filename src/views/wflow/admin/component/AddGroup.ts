import { ref } from "vue";
import OrgAPI from "@/api/org";
import { ElMessage } from "element-plus";
import { FormInstance } from "element-plus";

// 封装的分组管理模块
export function useGroupManagement() {
  // 分组列表
  const groupList = ref([]);

  // 控制新增分组对话框的显示
  const addGroupDialogVisible = ref(false);
  // 控制修改分组对话框的显示
  const modefiyGroupDialogVisible = ref(false);

  // 表单数据对象，分组名称
  const Gform = ref({
    name: "",
    id: 0,
  });
  // 校验规则
  const rules = reactive({
    name: [{ required: true, message: "分组名不能为空", trigger: "blur" }],
  });
  const modifyGroupFormRef = ref<FormInstance>();
  // 显示新增分组对话框
  const showAddGroupModal = () => {
    addGroupDialogVisible.value = true;
  };
  // 显示修改分组对话框
  const showModefigGroupModal = (group: any) => {
    Gform.value.name = group.group_name;
    Gform.value.id = group.id;
    modefiyGroupDialogVisible.value = true;
  };
  // 获取流程分组列表
  const findAllGroup = () => {
    OrgAPI.getGroup().then((rsp: any) => {
      groupList.value = rsp;
      console.log(groupList.value);
      groupList.value.forEach((listItem: any) => {
        if (listItem.items) {
          listItem.items.forEach((item: any) => {
            item.icon = JSON.parse(item.icon);
          });
        }
      });
      // 结束计时
      // console.timeEnd('处理数据耗时');
    });
  };

  // 新增分组
  const addGroup = () => {
    OrgAPI.addGroup(Gform.value.name).then((rsp) => {
      // 添加成功，关闭对话框并清空表单数据
      addGroupDialogVisible.value = false;
      Gform.value.name = "";
      ElMessage.success("新增分组成功");
      // 获取最新的分组列表
      findAllGroup();
    });
  };
  // 修改分组
  const modefiyGroup = () => {
    const formRef = modifyGroupFormRef.value;
    if (formRef) {
      formRef.validate((valid: boolean) => {
        if (valid) {
          OrgAPI.modefiyGroup(Gform.value.name, Gform.value.id).then(() => {
            modefiyGroupDialogVisible.value = false;
            Gform.value.name = "";
            ElMessage.success("修改分组成功");
            findAllGroup();
          });
        }
      });
    }
  };
  // 删除分组
  const deleteGroup = (group: any) => {
    console.log(group);
    const groupId = group.id;
    console.log(groupId);
    ElMessageBox.confirm("确定要删除该分组吗？", "删除分组", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }).then(() => {
      // 删除分组
      OrgAPI.deleteGroup(groupId).then((rsp) => {
        ElMessage.success("删除分组成功");
        // 获取最新的分组列表
        findAllGroup();
      });
    });
  };

  // 返回需要在外部使用的方法和数据
  return {
    groupList,
    addGroupDialogVisible,
    modefiyGroupDialogVisible,
    Gform,
    rules,
    modifyGroupFormRef,
    showAddGroupModal,
    showModefigGroupModal,
    findAllGroup,
    addGroup,
    modefiyGroup,
    deleteGroup,
  };
}
