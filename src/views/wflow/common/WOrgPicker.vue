<script setup>
import WDialog from "./WDialog.vue";
import { computed, ref } from "vue";
import OrgAPI from "@/api/org";
import RoleAPI from "@/api/role";
import UserAPI from "@/api/user";
import { deepCopy } from "@/utils/GlobalFunc.ts";

const props = defineProps({
  e: {
    type: Object,
    default: () => {
      return {};
    },
  },
  title: {
    type: String,
    default: "请选择",
  },
  size: {
    default: 20,
    type: Number,
  },
  parentId: {
    //父级部门ID
    type: Number,
    default: 0,
  },
  type: {
    type: String,
    default: "org",
  },
  //选中的
  selected: {
    type: Array,
    default: () => {
      return [];
    },
  },
  multiple: Boolean, //是否多选
});

const _value = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});
defineExpose({ open, close });
const emit = defineEmits(["update:modelValue", "ok"]);
const loading = ref(false);
const showDialog = ref(false);
//选中的对象
const selecteds = ref([]);
const orgData = ref([]);
const search = ref(null);
const searchData = ref([]);

//组织架构路径
const orgPath = ref([{ id: props.parentId, name: "" }]);

const showSearch = computed(() => (search.value || "").trim() !== "");

//数据列表
const dataList = computed(() =>
  showSearch.value ? searchData.value : orgData.value
);

const indeterminate = computed(() => {
  return (
    !selectAll.value &&
    selecteds.value.some((b) => dataList.value.some((a) => isSame(a, b)))
  );
});

//全选处理
const selectAll = computed({
  get() {
    return dataList.value.every((b) =>
      selecteds.value.some((a) => isSame(a, b))
    );
  },
  set(val) {
    //找出合适的类型的没有的元素
    const arr = dataList.value.filter((d) => {
      const has = !selecteds.value.some((s) => isSame(s, d));
      switch (props.type) {
        case "user":
          return has && d.type === "user";
        case "dept":
        case "role":
          return has && props.type === d.type;
      }
      return true;
    });
    if (val) {
      selecteds.value.push(...arr);
    } else {
      //找出没有的元素
      selecteds.value = arr;
    }
  },
});
function isSame(a, b) {
  return a.id === b.id && a.type === b.type;
}

function open() {
  setTimeout(() => {
    orgPath.value.length = 1;
    search.value = null;
    getOrgList(props.parentId);
    selecteds.value = deepCopy(props.selected);
    showDialog.value = true;
  }, 100);
}

function close() {
  showDialog.value = false;
  //selected.value.length = 0
  orgPath.value.length = 1;
}

function jumpDept(dept, i) {
  orgPath.value.length = i + 1;
  getOrgList(dept.id);
}

function toSubDept(dept) {
  getOrgList(dept.id, (rsp) => {
    orgPath.value.push(dept);
  });
}

function toParentDept() {
  jumpDept(orgPath.value[orgPath.value.length - 2], orgPath.value.length - 2);
}

function doSearch() {
  if (showSearch.value) {
    loading.value = true;
    UserAPI.getPage({ keywords: search.value })
      .then((rsp) => {
        loading.value = false;
        searchData.value = (rsp.list || []).map((item) => ({
          id: item.id,
          name: item.nickname,
          type: "user",
          avatar: item.avatar || "",
        }));
        reloadStatus(searchData.value);
      })
      .catch((err) => {
        loading.value = false;
      });
  } else {
    // 如果搜索框为空，清空搜索数据
    searchData.value = [];
  }
}
const queryParams = {
  pageNum: 1,
  pageSize: 10,
};
/**
 * 获取组织架构列表数据
 * @param deptId 父级部门ID
 * @param call 回调函数
 */
function getOrgList(deptId, call) {
  loading.value = true;
  if (props.type === "role") {
    RoleAPI.getPage(queryParams)
      .then((rsp) => {
        loading.value = false;
        // 转换数据为所需格式
        const searchData = {
          value: (rsp.list || []).map((item) => ({
            id: item.id,
            name: item.name,
            type: item.code,
            avatar: "",
          })),
        };
        orgData.value = searchData.value;

        // 解决UI框架回显对象问题
        reloadStatus(orgData.value);

        if (call) {
          call(searchData.value);
        }
      })
      .catch((err) => {
        loading.value = false;
      });
    return;
  }
  OrgAPI.getOrgTree({ deptId: deptId, type: props.type })
    .then((rsp) => {
      loading.value = false;
      orgData.value = rsp;
      // console.log(orgData.value);
      // updateDataList()
      //加载选中对象，解决UI框架回显对象问题
      reloadStatus(orgData.value);
      if (call) {
        call(rsp.data);
      }
    })
    .catch((err) => {
      loading.value = false;
    });
}

async function reloadStatus(orgs) {
  if (selecteds.value.length > 0) {
    for (let i in orgs) {
      let index = selecteds.value.findIndex((a) => isSame(a, orgs[i]));
      if (index > -1) {
        orgs[i] = selecteds.value[index];
      }
    }
  }
}

/**
 * 获取简短名称，只取末尾俩字符
 * @param name
 * @returns {*|string}
 */
function getShortName(name) {
  if ((name || "").length > 2) {
    return name.substring(name.length - 2, name.length);
  }
  return name;
}

/**
 * 处理单选，强制单选
 * @param val 选中项集合
 */
function change(val) {
  if (!props.multiple) {
    selecteds.value = [val[val.length - 1]];
  }
}

function getValues() {
  return selecteds.value.map((v) => {
    return {
      id: v.id,
      name: v.name,
      type: v.type,
      avatar: v.avatar,
    };
  });
}
</script>

<template>
  <w-dialog
    :border="false"
    width="550"
    :title="title"
    v-model="showDialog"
    @ok="$emit('ok', getValues())"
  >
    <el-row>
      <el-col :span="12" class="w-org-picker-span" v-loading="loading">
        <el-input
          v-model="search"
          @input="doSearch"
          class="w-org-picker-s-input"
          clearable
          :disabled="type !== 'user' && type !== 'org'"
          placeholder="搜索人员"
          prefix-icon="search"
        />
        <div class="w-org-picker-nav">
          <el-icon>
            <OfficeBuilding />
          </el-icon>
          <el-scrollbar>
            <div class="w-org-list-path" v-if="type !== 'role'">
              <template v-for="(org, i) in orgPath" :key="i">
                <span v-if="i > 1"> > </span>
                <el-text
                  size="small"
                  style="cursor: pointer"
                  @click="jumpDept(org, i)"
                  :type="i === orgPath.length - 1 ? 'primary' : 'info'"
                >
                  {{ org.name }}
                </el-text>
              </template>
            </div>
          </el-scrollbar>
        </div>
        <div class="w-org-list">
          <div>
            <el-checkbox
              v-model="selectAll"
              :indeterminate="indeterminate"
              style="padding: 0 5px"
              :disabled="!multiple && type !== 'user'"
              >全选</el-checkbox
            >
            <el-button
              link
              type="primary"
              @click="toParentDept"
              :disabled="orgPath.length <= 1 || showSearch"
            >
              <el-icon><TopLeft /></el-icon>上级
            </el-button>
          </div>

          <el-scrollbar v-if="dataList.length > 0">
            <el-checkbox-group
              v-model="selecteds"
              class="w-org-list-org"
              @change="change"
            >
              <el-checkbox
                v-for="org in dataList"
                :disabled="type === 'user' && org.type === 'dept'"
                :key="org.type + org.id"
                :label="org.name"
                :value="org"
              >
                <el-avatar
                  :size="35"
                  :src="org.avatar"
                  v-if="org.type === 'user'"
                  >{{ getShortName(org.name) }}
                </el-avatar>
                <!-- <el-image
                  class="w-org-dept-img"
                  fit="fill"
                  :src="`/image/${org.type}.png`"
                  v-else-if="org.type !== 'user'"
                ></el-image> -->
                <el-text style=" flex: 1;margin-left: 5px">{{
                  org.name
                }}</el-text>
                <el-button
                  type="primary"
                  link
                  class="w-org-child"
                  v-if="org.type === 'dept'"
                  :underline="false"
                  @click="toSubDept(org)"
                  >下级
                  <el-icon>
                    <BottomRight />
                  </el-icon>
                </el-button>
              </el-checkbox>
            </el-checkbox-group>
          </el-scrollbar>
          <el-empty v-else :image-size="100" description="未找到对应组织数据" />
        </div>
      </el-col>
      <el-col :span="12" class="w-org-picker-span">
        <div>
          <span>已选 {{ selecteds.length }} 项</span>
          <el-button
            link
            type="danger"
            :disabled="selecteds.length === 0"
            @click="selecteds.length = 0"
            >清空</el-button
          >
        </div>
        <el-scrollbar v-if="selecteds.length > 0">
          <div
            v-for="(org, i) in selecteds"
            class="w-org-picker-select"
            :key="i"
          >
            <el-avatar
              :size="35"
              :src="org.avatar"
              v-if="org.type === 'user'"
              >{{ getShortName(org.name) }}</el-avatar
            >
            <el-image
              class="w-org-dept-img"
              fit="fill"
              :src="`/image/${org.type}.png`"
              v-else-if="org.type !== 'user'"
            />
            <el-text style=" flex: 1;margin-left: 5px">{{ org.name }}</el-text>
            <el-icon @click="selecteds.splice(i, 1)">
              <Close />
            </el-icon>
          </div>
        </el-scrollbar>
        <el-empty v-else :image-size="100" description="未选中任何数据" />
      </el-col>
    </el-row>
  </w-dialog>
</template>

<style scoped lang="scss">
.w-org-picker-span {
  display: flex;
  flex-direction: column;
  height: 400px;
  border: 1px solid var(--el-border-color);

  &:first-child {
    border-right: none;

    .w-org-picker-s-input {
      padding: 5px;
    }
  }

  &:last-child {
    & > :first-child {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 40px;
      padding: 0 10px;
      border-bottom: 1px solid var(--el-border-color);
    }
  }
}

.w-org-picker-nav {
  display: flex;
  align-items: center;
  padding: 0 5px;

  i {
    margin-right: 5px;
  }
}

.w-org-dept-img {
  width: 20px;
  height: 20px;
  padding: 8px 0;
}

.w-org-picker-select {
  display: flex;
  align-items: center;
  padding: 3px 5px;

  .el-avatar {
    background-color: var(--el-color-primary);
  }

  i {
    box-sizing: content-box;
    padding: 5px;
    cursor: pointer;
  }

  &:hover {
    background-color: $theme-aside-bgc;
  }
}

:deep(.w-org-list-org) {
  display: flex;
  flex-direction: column;
  height: 275px;
  margin-bottom: -5px;

  & > .el-checkbox {
    height: auto;
    padding: 3px 5px;
    margin-right: 0;

    &:hover {
      background-color: $theme-aside-bgc;
    }
  }

  .w-org-child {
    color: var(--el-color-primary);
  }

  .el-checkbox__label {
    position: relative;
    display: flex;
    flex: 1;
  }

  .el-avatar {
    background-color: var(--el-color-primary);
  }
}

.w-org-list {
  & > div:first-child {
    position: relative;
    display: flex;
    align-items: center;

    & > :first-child {
      flex: 1;
    }

    & > :last-child {
      margin-right: 5px;
    }
  }

  .w-org-list-path {
    display: flex;
  }
}
</style>
