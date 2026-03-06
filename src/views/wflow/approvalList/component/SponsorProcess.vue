<template>
  <div>
    <div v-loading="loading" class="dialog-content">
      <el-row :gutter="20">
        <el-col
          class="form-col col-padding"
          :span="12"
          v-if="processDetail?.formConfig"
        >
          <div class="form-components">
            <el-form
              ref="formRef"
              :label-width="processDetail.formConfig.conf.labelWidth"
              :size="processDetail.formConfig.conf.size"
              :label-position="processDetail.formConfig.conf.labelPosition"
              class="w-form-render"
              :rules="formRules"
              :model="formData"
            >
              <template
                v-for="component in processDetail.formConfig.components"
                :key="component.id"
              >
                <el-form-item
                  :label="component.name"
                  v-if="!component.props.isContainer"
                  :required="component.props.required"
                  :class="{ 'w-form-cp-nlb': component.props.hideLabel }"
                  :prop="component.key"
                >
                  <component
                    :is="FormComponents[component.type]"
                    :mode="mode"
                    :config="component"
                    v-model="formData[component.key]"
                  />
                </el-form-item>
                <component
                  v-else
                  :is="FormComponents[component.type]"
                  :mode="mode"
                  v-model="formData"
                  :config="component"
                />
              </template>
            </el-form>
          </div>
        </el-col>

        <el-col class="col-padding" :span="12" v-if="processDetail?.process">
          <div class="process-nodes">
            <el-timeline>
              <el-timeline-item
                v-for="(activity, index) in cc"
                :key="index"
                :icon="activity.icon"
                size="large"
                class="task"
              >
                <div
                  class="process-node-render"
                  v-if="!activity.hasOwnProperty('options')"
                >
                  <div>
                    <div style="font-size: 16px">{{ activity.title }}</div>
                    <span style="color: rgb(168 173 175)">{{
                      activity.desc
                    }}</span>
                  </div>
                  <div style="display: flex">
                    <div
                      class="avatar show-y"
                      v-for="(user, index1) in activity.users"
                      :key="index1"
                    >
                      <div class="a-img">
                        <el-avatar
                          style="width: 38px; height: 38px; line-height: 38px"
                          :src="user.avatar"
                        />
                        <el-icon
                          class="close"
                          v-if="activity.isEdit"
                          @click="delUser(activity.users, user, activity)"
                          ><Close
                        /></el-icon>
                        <i class="status" style="display: none"></i>
                      </div>
                      <span class="name line">{{ user.name }}</span>
                    </div>
                    <span
                      class="add-user"
                      v-if="
                        activity.isEdit &&
                        (activity.multiple || 0 === activity.users?.length)
                      "
                      @click="showOrgPicker(activity)"
                      ><el-icon><Plus /></el-icon>
                      <div>添加</div></span
                    >
                  </div>
                </div>
                <div style="display: flex; flex-direction: column" v-else>
                  <el-radio-group
                    @change="handleRadioChange(activity, activity.id)"
                    v-model="activity.active"
                    size="small"
                  >
                    <el-radio-button
                      :label="d.title"
                      :value="d.id"
                      v-for="(d, index2) in activity.options"
                      :key="index2"
                    />
                  </el-radio-group>
                  <span style="color: rgb(168 173 175)">{{
                    activity.desc
                  }}</span>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-col>
      </el-row>
    </div>
    <w-org-picker
      ref="orgPicker"
      :id="activityId"
      :selected="selectedOrg"
      :multiple="multiple"
      type="user"
      @ok="selectOk"
    />
  </div>
</template>

<script setup>
import { ref, defineExpose, reactive } from "vue";
import { FormComponents } from "../../design/form/FormComponents";
import { useUserStore } from "@/store";
import OrgAPI from "@/api/org";
import WOrgPicker from "../../common/WOrgPicker.vue";
import { useUserStoreHook } from "@/store/modules/user";
const renderKey = ref(0);

const userStore = useUserStore();

const props = defineProps({
  modelValue: Object,
});
const emit = defineEmits(["update:modelValue"]);
const processDetail = ref({});
const formData = ref({});
const processUsers = ref([]);
const processccUsers = ref([]);

// 计算属性，用于生成校验规则
const formRules = computed(() => {
  const rules = {};
  processDetail.value.formConfig.components.forEach((component) => {
    if (component.props.required) {
      rules[component.key] = [
        {
          required: true,
          message: `${component.name} 为必填项`,
          trigger: "change",
        },
        {
          validator: (rule, value, callback) => {
            if (!value) {
              callback(new Error(`${component.name} 不能为空`));
            } else {
              callback();
            }
          },
          trigger: "change",
        },
      ];
    }
  });
  return rules;
});

//定义选择弹窗
const orgPicker = ref();
const multiple = ref(false);
//选中的组织架构属性
const selectedOrg = ref([]);
const activityId = ref();

//定义流程节点
const cc = ref([]);
const loginUser = ref({});

//切换分支存储index
const GatewayIndex = reactive([]);

const loading = ref(false);

//获取发起人数据（员工，部门，角色）
const Initiator = useUserStoreHook().user;

//添加人员
function showOrgPicker(orgs) {
  selectedOrg.value = orgs.users;

  multiple.value = orgs.multiple;
  activityId.value = orgs.id;
  orgPicker.value.open();
}

function selectOk(orgs) {
  orgPicker.value.close();
  selectedOrg.value.length = 0;
  selectedOrg.value.push(...orgs);
  const user = processUsers.value.find((user) => user.id === activityId.value);
  if (user) {
    // 替换对象内容
    user.assignedUsers = orgs;
  } else {
    // 添加新对象
    processUsers.value.push({
      nodeId: activityId.value,
      assignedUsers: orgs,
    });
  }

  findCCById(cc.value, activityId.value).users = [];
  findCCById(cc.value, activityId.value).users.push(...orgs);

  findObjectById(
    processDetail.value.process,
    activityId.value
  ).props.assignUser = [];
  findObjectById(
    processDetail.value.process,
    activityId.value
  ).props.assignUser.push(...orgs);
}

//删除人员

function delUser(users, user, activity) {
  users.splice(users.indexOf(user), 1);

  const userArr = findObjectById(processDetail.value.process, activity.id).props
    .assignUser;

  userArr.splice(userArr.indexOf(user), 1);
}

// 方法定义
function findCCById(array, targetId) {
  for (let item of array) {
    if (item.id === targetId) {
      return item;
    }
  }
  return null;
}

function findObjectById(structure, targetId) {
  if (structure !== null && typeof structure === "object") {
    // 如果当前结构是对象或数组，尝试在其内部查找
    if (Array.isArray(structure)) {
      for (let item of structure) {
        const found = findObjectById(item, targetId);
        if (found) return found;
      }
    } else {
      // 如果是对象，检查是否有匹配的 ID
      if (structure.id === targetId) {
        return structure;
      }
      // 遍历对象的所有属性
      for (let key in structure) {
        if (structure.hasOwnProperty(key)) {
          const found = findObjectById(structure[key], targetId);
          if (found) return found;
        }
      }
    }
  }
  // 如果没有找到匹配项则返回 null
  return null;
}

// 获取组件详情数据
const getProcessDetail = async (templateId) => {
  loading.value = true;
  loginUser.value = {
    name: userStore.user.nickname,
    avatar: userStore.user.avatar,
  };
  const rsp = await OrgAPI.getProcessDetail(templateId);
  processDetail.value = rsp;
  // console.log(processDetail.value, "rsp");
  formData.value = rsp.formConfig;
  loading.value = false;
};

//处理节点
const startProcess = () => {
  cc.value = [];
  if (processDetail.value.process) {
    getProcessAll(processDetail.value.process, GatewayIndex, cc);
  }
  // 结束节点
  if (cc.value.find((obj) => obj.name == "END")) {
    return;
  } else {
    cc.value.push({
      title: "结束",
      name: "END",
      icon: "SuccessFilled",
      isEdit: false,
    });
  }
  // // 强制重新渲染
  // renderKey.value++;
  processccUsers.value = [];
  allProcessUsers(cc.value, false);
};

//判断应该填写的所有
function allProcessUsers(cc, isParallel) {
  if (!isParallel) {
    cc.forEach((item) => {
      if (item.name == "审批人" || item.name == "抄送人") {
        if (item.desc == "发起人自选") {
          const user = processccUsers.value.find(
            (user) => user.nodeId === item.id
          );
          if (user) {
            // 替换对象内容
            // user.assignedUsers = item.users;
          } else {
            // 添加新对象
            processccUsers.value.push({
              nodeId: item.id,
              // assignedUsers: item.users,
            });
          }
        }
      } else if (item.name == "并行分支") {
        for (const i in item.branchs) {
          allProcessUsers(item.branchs[i], true);
        }
      }
    });
  } else {
    cc.forEach((item) => {
      if (item.name == "审批人" || item.name == "抄送人") {
        if (item.props.ruleType == "ROOT_SELECT") {
          const user = processccUsers.value.find(
            (user) => user.nodeId === item.id
          );
          if (user) {
            // 替换对象内容
            // user.assignedUsers = item.props.assignUser;
          } else {
            // 添加新对象
            processccUsers.value.push({
              nodeId: item.id,
              // assignedUsers: item.props.assignUser,
            });
          }
        }
      } else if (item.props.type == "Parallel") {
        for (const i in item.branch) {
          allProcessUsers(item.branch[i], true);

          // item.branchs[i].forEach((branch) => {
          //   allProcessUsers(branch, true);
          // });
        }
      }
    });
  }
}

//循环处理单节点
const getProcessAll = (node, data, cc) => {
  for (const process of node) {
    getProcess(process, GatewayIndex, cc);
  }
};

//处理单节点
const getProcess = (process, GatewayIndex, cc) => {
  if (process != null && process != undefined) {
    if (process.type == "Start") {
      //发起人节点
      getStartNode(process, cc);
    } else if (process.type == "Approval") {
      //审批节点
      getApprovalNode(process, cc);
    } else if (process.type == "Gateway") {
      //网关节点
      if (process.props.type == "Exclusive") {
        //分支网关
        getExclusiveNode(process, GatewayIndex, cc);
      } else if (process.props.type == "Parallel") {
        //并行网关
        getParallelNode(process, GatewayIndex, cc);
      }
    } else if (process.type == "Cc") {
      //抄送节点
      getCcNode(process, cc);
    }
  }
};

//发起人节点
const getStartNode = (process, cc) => {
  cc.value.push({
    id: process.id,
    title: process.name,
    name: "发起人",
    icon: "Avatar",
    isEdit: false,
    desc: loginUser.value.name + " 将发起本流程",
    users: [loginUser.value],
  });
};

//审批人节点
const getApprovalNode = (process, cc) => {
  const data = {
    id: process.id,
    title: process.name,
    name: "审批人",
    icon: "Stamp",
    isEdit: false,
    multiple: false,
    mode: process.props.mode,
    users: [],
    desc: "",
  };
  //判断审批人类型
  switch (process.props.ruleType) {
    case "ASSIGN_USER":
      data.users = deepCopy(process.props.assignUser);

      data.desc = "指定审批人";
      break;
    case "ROOT_SELECT":
      data.isEdit = true;
      data.multiple = process.props.rootSelect.multiple || false;
      data.users = deepCopy(process.props.assignUser);
      data.desc = "发起人自选";
      break;
    case "ROOT_SELF":
      data.users = [loginUser.value];
      data.desc = "发起人自己审批";
      break;
    case "LEADER":
      data.desc = "直属部门主管";
      break;
    // data.desc =
    //   1 === process.props.leader.level
    //     ? "直接主管审批"
    //     : "第".concat(process.props.leader.level, "级主管审批");
    // break;
    case "ASSIGN_DEPT":
      data.desc = "指定部门的领导";
      break;
    case "ASSIGN_ROLE":
      data.desc = "由角色[".concat(
        (process.props.role || []).map(function (e) {
          return e.name;
        }),
        "]审批"
      );
      break;
    case "TO_REFUSE":
      data.desc = "流程此处将被自动驳回";
      break;
  }
  cc.value.push(data);
};

//分支网关
const getExclusiveNode = (process, GatewayIndex, cc) => {
  const data = {
    id: process.id,
    title: process.name,
    name: "条件分支",
    icon: "Share",
    isEdit: false,
    active: process.props.branch[0].id,
    options: [],
    desc: "只执行第一个满足条件的分支",
    branchs: {},
    branch: [],
  };
  getBranch(process);
  const hasMatchingId = GatewayIndex?.some((item) => item.id === data.id);

  if (hasMatchingId) {
    const item = GatewayIndex.find((item) => item.id === data.id);
    data.branch = process.branch[item.index];
    data.active = process.props.branch[item.index].id;
  } else {
    data.branch = process.branch[0];
  }

  cc.value.push(data);

  getProcessAll(data.branch, GatewayIndex, cc);
  process.props.branch.forEach((item, index) => {
    data.options.push({ id: item.id, title: item.name });
    data.branchs[item.id] = reactify([]);
    data.branchs[item.id] = process.branch[index];
  });
};

const getBranch = (process) => {
  console.log(process);

  const resultArrray = [];
  process.props.branch.forEach((item) => {
    item.props.groups.forEach((group) => {
      if (group.conditions.length > 0) {
        group.conditions.forEach((item) => {
          switch (item.group) {
            case "FORM":
              switch (item.type) {
                case "TextInput":
                  getTextInput(item);
                  break;
                case "NumberInput":
                  getNumberInput(item);
                  break;
              }
              break;
            case "INITIATOR":
              switch (item.type) {
                case "Org":
                  getOrg(item);

                  break;
                case "Role":
                  getRole(item);

                  break;
              }

              break;
          }
        });
        group.result = group.logic
          ? groupAndLogic(group.conditions)
          : groupOrLogic(group.conditions);
      }
    });
    item.props.result = item.props.logic
      ? groupAndLogic(item.props.groups)
      : groupOrLogic(item.props.groups);

    resultArrray.push(item.props.result);
  });
  if (resultArrray.findIndex((res) => res) == -1) {
    const hasMatchingId = GatewayIndex?.some((item) => item.id === process.id);
    if (hasMatchingId) {
      for (const i of GatewayIndex) {
        if (i.id == process.id) {
          i.index = resultArrray.length - 1;
        }
      }
    } else {
      GatewayIndex.push({
        id: process.id,
        index: resultArrray.length - 1,
      });
    }
  } else {
    const hasMatchingId = GatewayIndex?.some((item) => item.id === process.id);
    if (hasMatchingId) {
      for (const i of GatewayIndex) {
        if (i.id == process.id) {
          i.index = resultArrray.findIndex((res) => res);
        }
      }
    } else {
      GatewayIndex.push({
        id: process.id,
        index: resultArrray.findIndex((res) => res),
      });
    }
  }
};

// 判断条件组是否满足条件
const groupAndLogic = (conditions) => {
  return conditions.every((condition) => condition.result);
};

const groupOrLogic = (conditions) => {
  return conditions.some((condition) => condition.result);
};

const getNumberInput = (Number) => {
  const NumberValue = formData.value?.[Number.symbol];

  if (NumberValue) {
    switch (Number.compare) {
      case "GT":
        Number.result = NumberValue > Number.compareVal;
        break;
      case "LT":
        Number.result = NumberValue < Number.compareVal;
        break;
      case "EQ":
        Number.result = NumberValue == Number.compareVal;
        break;
      case "GT_EQ":
        Number.result = NumberValue >= Number.compareVal;
        break;
      case "LT_EQ":
        Number.result = NumberValue <= Number.compareVal;
        break;
      case "NEQ":
        Number.result = NumberValue != Number.compareVal;
        break;
      // case "IN":
      //   Number.result = Number.compareVal.includes(NumberValue);  写错了
      //   console.log("包含在");
      //   break;
      // case "BT":
      //   if (Number.compareVal[0] > Number.compareVal[1]) {
      //     Number.result =
      //       Number.compareVal[0] > NumberValue > Number.compareVal[1]
      //         ? "true"
      //         : "false";
      //   } else if (Number.compareVal[0] < Number.compareVal[1]) {
      //     Number.result =
      //       Number.compareVal[0] < NumberValue < Number.compareVal[1]
      //         ? "true"
      //         : "false";
      //   }
      //   break;
    }
  } else {
    Number.result = false;
  }
};

const getTextInput = (Text) => {
  const TextValue = formData.value?.[Text.symbol];
  if (TextValue) {
    switch (Text.compare) {
      case "HAS":
        Text.result = TextValue.includes(Text.compareVal);
        break;
      // case "IN":
      //   Text.result = Text.compareVal.includes(TextValue);  写错了
      //   console.log("包含在");
      //   break;
      case "EQ":
        Text.result = TextValue == Text.compareVal;
        break;
      case "NEQ":
        Text.result = TextValue != Text.compareVal;
        break;
    }
  } else {
    Text.result = false;
  }
};

const getOrg = (Org) => {
  //获取发起人是否为指定某人或某直属部门

  function isInitiatorInList(mixedList, initiator) {
    return mixedList.some((item) => {
      if (item.type === "user" && item.id === initiator.userId) {
        return true;
      }
      if (item.type === "dept" && item.id === initiator.deptId) {
        return true;
      }
      return false;
    });
  }

  switch (Org.compare) {
    case "IN":
      Org.result = isInitiatorInList(Org.compareVal, Initiator);
      break;
    case "NIN":
      Org.result = !isInitiatorInList(Org.compareVal, Initiator);
      break;
  }
};

const getRole = (Role) => {
  //获取发起人有无制定角色
  const hasMatch = Role.compareVal.some((role) =>
    Initiator.roles.includes(role.type)
  );
  switch (Role.compare) {
    case "HAS":
      Role.result = hasMatch;
      break;
    case "NHAS":
      Role.result = !hasMatch;
      break;
  }
};

//并行分支
const getParallelNode = (process, GatewayIndex, cc) => {
  const data = {
    id: process.id,
    title: process.name,
    name: "并行分支",
    icon: "Operation",
    isEdit: false,
    active: process.props.branch[0].id,
    options: [],
    desc: "切换分支可显示对应执行流程",
    branchs: {},
    branch: [],
    // parallecopycc: [],
  };

  const hasMatchingId = GatewayIndex?.some((item) => item.id === data.id);

  if (hasMatchingId) {
    const item = GatewayIndex.find((item) => item.id === data.id);
    data.branch = process.branch[item.index];
    data.active = process.props.branch[item.index].id;
  } else {
    data.branch = process.branch[0];
    // 进行其他操作
  }

  cc.value.push(data);
  //存储截至到当前的所有节点
  // data.parallecopycc = [...cc.value];
  getProcessAll(data.branch, GatewayIndex, cc);
  //按钮数据
  process.props.branch.forEach((item, index) => {
    data.options.push({ id: item.id, title: item.name });
    data.branchs[item.id] = reactify([]);
    data.branchs[item.id] = process.branch[index];
  });
};

//抄送人节点
const getCcNode = (process, cc) => {
  const data = {
    id: process.id,
    title: process.name,
    icon: "Promotion",
    name: "抄送人",
    isEdit: process.props.ruleType == "ROOT_SELECT",
    type: "org",
    multiple: process.props.rootSelect.multiple,
    desc: process.props.ruleType == "ROOT_SELECT" ? "发起人自选" : "",
    users: deepCopy(process.props.assignUser),
  };
  cc.value.push(data);
};

//切换分支方法
const handleRadioChange = (activity, value) => {
  const index = activity.options.findIndex(
    (item) => item.id === activity.active
  );
  const hasMatchingId = GatewayIndex?.some((item) => item.id === value);

  if (hasMatchingId) {
    for (const i of GatewayIndex) {
      if (i.id == value) {
        i.index = index;
      }
    }
  } else {
    GatewayIndex.push({ id: value, index: index });
  }

  startProcess();
};

//表单更变监听  修改流程
watch(
  formData,
  (nv, ov) => {
    //如果表单有改变，获取条件节点该走哪一条
    startProcess();
  },
  {
    deep: true,
  }
);

//深拷贝
const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

defineExpose({ processDetail, formData, processUsers, processccUsers });

onMounted(async () => {
  await getProcessDetail(props.modelValue);
  startProcess();
});
</script>

<style scoped lang="scss">
.branchBox {
  display: flex;
}

.ruleBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-col {
  border-right: 1px solid rgb(232 232 232);
}

.col-padding {
  padding: 16px;
}

.dialog-content {
  border-top: 1px solid rgb(232 232 232);
}

/* 流程css */
.task {
  height: 70px;
}

.el-timeline-item .el-timeline-item__content .process-node-render > div {
  position: absolute;
  display: inline-block;
}

.el-timeline-item
  .el-timeline-item__content
  .process-node-render
  > div:last-child {
  top: -10px;
  right: 0;
}

.avatar {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.show-y {
  flex-direction: column !important;
  justify-content: center;
  padding-left: 10px;
}

.show-y,
.w-h-center {
  display: flex;
  align-items: center;
}

.avatar .a-img {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #fff;
  border-radius: 50%;
}

.close {
  position: absolute;
  top: 0;
  right: 0;
  color: #fff;
  cursor: pointer;
  background: #000;
  border-radius: 50%;
}

.status {
  position: absolute;
  right: -8px;
  bottom: -4px;
  font-size: 15px;
  background: #fff;
  border: 2px solid #fff;
  border-radius: 50%;
}

.avatar .name {
  margin-left: 10px;
  font-size: 14px;
  color: #19191a;
  text-align: center;
}

.show-y .name {
  margin-left: 0 !important;
}

.line {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add-user {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.add-user i {
  width: 38px;
  height: 38px;
  padding: 10px;
  font-size: 1.1rem;
  cursor: pointer;
  border: 1px dashed #8c8c8c;
  border-radius: 50%;
}

/* 修改圆点的样式 */
:deep(.el-timeline-item__node) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: unset;
  height: unset;
  padding: 2px;
  background-color: #f3f2f2;
}

/* 修改圆点内图标的样式 */
:deep(.el-timeline-item__node .el-icon) {
  font-size: 16px;
  color: #babcc1;
}

:deep(.el-timeline-item__tail) {
  left: 7px;
  height: 120%;
  border: 1px solid #dbdbdb;
}

.border .el-dialog__header {
  border-bottom: 1px solid #e8e8e8;
}
</style>
