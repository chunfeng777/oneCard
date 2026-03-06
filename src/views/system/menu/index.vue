<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item :label="$t('menu.keyword')" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="$t('menu.menuTitle')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery"
            ><template #icon><i-ep-search /></template
            >{{ $t("menu.search") }}</el-button
          >
          <el-button @click="resetQuery">
            <template #icon><i-ep-refresh /></template>
            {{ $t("menu.reset") }}</el-button
          >
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never" class="table-container">
      <template #header>
        <el-button
          v-hasPerm="['sys:menu:add']"
          type="success"
          @click="openDialog(0)"
        >
          <template #icon><i-ep-plus /></template>
          {{ $t("menu.new") }}</el-button
        >
      </template>

      <el-table
        v-loading="loading"
        :data="menuList"
        highlight-current-row
        row-key="id"
        :expand-row-keys="['1']"
        @row-click="onRowClick"
        :tree-props="{
          children: 'children',
          hasChildren: 'hasChildren',
        }"
      >
        <el-table-column :label="$t('menu.keyword')" min-width="200">
          <template #default="scope">
            <svg-icon :icon-class="scope.row.icon" />
            {{ scope.row.name }}
          </template>
        </el-table-column>

        <el-table-column :label="$t('menu.type')" align="center" width="80">
          <template #default="scope">
            <el-tag
              v-if="scope.row.type === MenuTypeEnum.CATALOG"
              type="warning"
              >{{ $t("menu.directory") }}</el-tag
            >
            <el-tag
              v-if="scope.row.type === MenuTypeEnum.MENU"
              type="success"
              >{{ $t("menu.menu") }}</el-tag
            >
            <el-tag
              v-if="scope.row.type === MenuTypeEnum.BUTTON"
              type="danger"
              >{{ $t("menu.button") }}</el-tag
            >
            <el-tag
              v-if="scope.row.type === MenuTypeEnum.EXTLINK"
              type="info"
              >{{ $t("menu.link") }}</el-tag
            >
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('menu.routePath')"
          align="left"
          width="150"
          prop="path"
        />

        <el-table-column
          :label="$t('menu.componentPath')"
          align="left"
          width="250"
          prop="component"
        />

        <el-table-column
          :label="$t('menu.permissionIdentifier')"
          align="center"
          width="200"
          prop="perm"
        />

        <el-table-column :label="$t('menu.status')" align="center" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.visible === 1" type="success">{{
              $t("menu.show")
            }}</el-tag>
            <el-tag v-else type="info">{{ $t("menu.hide") }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('menu.sort')"
          align="center"
          width="80"
          prop="sort"
        />

        <el-table-column
          fixed="right"
          align="center"
          :label="$t('menu.operate')"
          width="220"
        >
          <template #default="scope">
            <el-button
              v-if="scope.row.type == 'CATALOG' || scope.row.type == 'MENU'"
              v-hasPerm="['sys:menu:add']"
              type="primary"
              link
              size="small"
              @click.stop="openDialog(scope.row.id)"
            >
              <i-ep-plus />{{ $t("menu.new") }}
            </el-button>

            <el-button
              v-hasPerm="['sys:menu:edit']"
              type="primary"
              link
              size="small"
              @click.stop="openDialog(undefined, scope.row.id)"
            >
              <i-ep-edit />{{ $t("menu.edit") }}
            </el-button>
            <el-button
              v-hasPerm="['sys:menu:delete']"
              type="primary"
              link
              size="small"
              @click.stop="handleDelete(scope.row.id)"
              ><i-ep-delete />
              {{ $t("menu.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      destroy-on-close
      append-to-body
      width="1000px"
      @close="closeDialog"
      top="5vh"
    >
      <el-form
        ref="menuFormRef"
        :model="formData"
        :rules="rules"
        label-width="160px"
      >
        <el-form-item :label="$t('menu.parentMenu')" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :placeholder="$t('menu.selectParentMenu')"
            :data="menuOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item :label="$t('menu.menuTitle')" prop="name">
          <el-input
            v-model="formData.name"
            :placeholder="$t('menu.enterMenuName')"
          />
        </el-form-item>

        <el-form-item :label="$t('menu.menuType')" prop="type">
          <el-radio-group v-model="formData.type" @change="onMenuTypeChange">
            <el-radio label="CATALOG">{{ $t("menu.directory") }}</el-radio>
            <el-radio label="MENU">{{ $t("menu.menu") }}</el-radio>
            <el-radio label="BUTTON">{{ $t("menu.button") }}</el-radio>
            <el-radio label="EXTLINK">{{ $t("menu.link") }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="formData.type == 'EXTLINK'"
          :label="$t('menu.linkAddress')"
          prop="path"
        >
          <el-input v-model="formData.path" :placeholder="$t('menu.linkURL')" />
        </el-form-item>

        <el-form-item
          v-if="
            formData.type == MenuTypeEnum.CATALOG ||
            formData.type == MenuTypeEnum.MENU
          "
          :label="$t('menu.routePath')"
          prop="path"
        >
          <el-input
            v-if="formData.type == MenuTypeEnum.CATALOG"
            v-model="formData.path"
            placeholder="system"
          />
          <el-input v-else v-model="formData.path" placeholder="user" />
        </el-form-item>

        <!-- 组件页面完整路径 -->
        <el-form-item
          v-if="formData.type == MenuTypeEnum.MENU"
          :label="$t('menu.pagePath')"
          prop="component"
        >
          <el-input
            v-model="formData.component"
            placeholder="system/user/index"
            style="width: 95%"
          >
            <template v-if="formData.type == MenuTypeEnum.MENU" #prepend
              >src/views/</template
            >
            <template v-if="formData.type == MenuTypeEnum.MENU" #append
              >.vue</template
            >
          </el-input>
        </el-form-item>

        <el-form-item
          v-if="formData.type !== MenuTypeEnum.BUTTON"
          prop="visible"
          :label="$t('menu.displayStatus')"
        >
          <el-radio-group v-model="formData.visible">
            <el-radio :label="1">{{ $t("menu.show") }}</el-radio>
            <el-radio :label="0">{{ $t("menu.hide") }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="formData.type === MenuTypeEnum.CATALOG"
          :label="$t('menu.displayRoot')"
        >
          <template #label>
            <div>
              {{ $t("menu.displayRoot") }}
              <el-tooltip placement="bottom" effect="light">
                <template #content
                  >{{ $t("menu.yesRoot") }} <br />{{ $t("menu.noRoot") }}
                </template>
                <i-ep-QuestionFilled class="inline-block" />
              </el-tooltip>
            </div>
          </template>

          <el-radio-group v-model="formData.alwaysShow">
            <el-radio :label="1">{{ $t("menu.yes") }}</el-radio>
            <el-radio :label="0">{{ $t("menu.no") }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="formData.type === MenuTypeEnum.MENU"
          :label="$t('menu.cacheEnabled')"
        >
          <el-radio-group v-model="formData.keepAlive">
            <el-radio :label="1">{{ $t("menu.yes") }}</el-radio>
            <el-radio :label="0">{{ $t("menu.no") }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('menu.sort')" prop="sort">
          <el-input-number
            v-model="formData.sort"
            style="width: 100px"
            controls-position="right"
            :min="0"
          />
        </el-form-item>

        <!-- 权限标识 -->
        <el-form-item
          v-if="formData.type == MenuTypeEnum.BUTTON"
          :label="$t('menu.permissionIdentifier')"
          prop="perm"
        >
          <el-input v-model="formData.perm" placeholder="sys:user:add" />
        </el-form-item>

        <el-form-item
          v-if="formData.type !== MenuTypeEnum.BUTTON"
          :label="$t('menu.icon')"
          prop="icon"
        >
          <!-- 图标选择器 -->
          <icon-select v-model="formData.icon" />
        </el-form-item>

        <el-form-item
          v-if="formData.type == MenuTypeEnum.CATALOG"
          :label="$t('menu.redirectRoute')"
        >
          <el-input
            v-model="formData.redirect"
            :placeholder="$t('menu.redirectRoute')"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">{{
            $t("menu.confirm")
          }}</el-button>
          <el-button @click="closeDialog">{{ $t("menu.cancel") }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Menu",
  inheritAttrs: false,
});

import MenuAPI from "@/api/menu";
import { MenuQuery, MenuForm, MenuVO } from "@/api/menu/model";
import { MenuTypeEnum } from "@/enums/MenuTypeEnum";

const { t } = useI18n();
const queryFormRef = ref(ElForm);
const menuFormRef = ref(ElForm);

const loading = ref(false);
const dialog = reactive({
  title: "",
  visible: false,
});

const queryParams = reactive<MenuQuery>({});
const menuList = ref<MenuVO[]>([]);

const menuOptions = ref<OptionType[]>([]);

const formData = reactive<MenuForm>({
  parentId: 0,
  visible: 1,
  sort: 1,
  type: MenuTypeEnum.MENU,
  alwaysShow: 0,
  keepAlive: 0,
});

const rules = reactive({
  parentId: [
    { required: true, message: t("menu.rules.parentId"), trigger: "blur" },
  ],
  name: [{ required: true, message: t("menu.rules.name"), trigger: "blur" }],
  type: [{ required: true, message: t("menu.rules.type"), trigger: "blur" }],
  path: [{ required: true, message: t("menu.rules.path"), trigger: "blur" }],

  component: [
    { required: true, message: t("menu.rules.component"), trigger: "blur" },
  ],
  visible: [{ required: true, message: t("menu.rules.path"), trigger: "blur" }],
});

// 选择表格的行菜单ID
const selectedRowMenuId = ref<number | undefined>();

const menuCacheData = reactive({
  type: "",
  path: "",
});

/**
 * 查询
 */
function handleQuery() {
  // 重置父组件
  loading.value = true;
  MenuAPI.getList(queryParams)
    .then((data) => {
      menuList.value = data;
    })
    .then(() => {
      loading.value = false;
    });
}

/** 重置查询 */
function resetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

/**行点击事件 */
function onRowClick(row: MenuVO) {
  selectedRowMenuId.value = row.id;
}

/**
 * 打开表单弹窗
 *
 * @param parentId 父菜单ID
 * @param menuId 菜单ID
 */
function openDialog(parentId?: number, menuId?: number) {
  MenuAPI.getOptions()
    .then((data) => {
      menuOptions.value = [
        { value: 0, label: t("menu.top_levelMenu"), children: data },
      ];
    })
    .then(() => {
      dialog.visible = true;
      if (menuId) {
        dialog.title = t("menu.editMenu");
        MenuAPI.getFormData(menuId).then((data) => {
          Object.assign(formData, data);
          menuCacheData.type = data.type;
          menuCacheData.path = data.path ?? "";
        });
      } else {
        dialog.title = t("menu.addMenu");
        formData.parentId = parentId;
      }
    });
}

/** 菜单类型切换事件处理 */
function onMenuTypeChange() {
  // 如果菜单类型改变，清空路由路径；未改变在切换后还原路由路径
  if (formData.type !== menuCacheData.type) {
    formData.path = "";
  } else {
    formData.path = menuCacheData.path;
  }
}

/** 菜单保存提交 */
function submitForm() {
  menuFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      const menuId = formData.id;
      if (menuId) {
        MenuAPI.update(menuId, formData).then(() => {
          ElMessage.success(t("menu.successModify"));
          closeDialog();
          handleQuery();
        });
      } else {
        MenuAPI.add(formData).then(() => {
          ElMessage.success(t("menu.addSuccessfully"));
          closeDialog();
          handleQuery();
        });
      }
    }
  });
}

/** 删除菜单 */
function handleDelete(menuId: number) {
  if (!menuId) {
    ElMessage.warning(t("menu.message.remove.check"));
    return false;
  }

  ElMessageBox.confirm(
    t("menu.Confirm_selected_data_items"),
    t("menu.message.remove.warn"),
    {
      confirmButtonText: t("menu.confirm"),
      cancelButtonText: t("menu.cancel"),
      type: "warning",
    }
  )
    .then(() => {
      MenuAPI.deleteById(menuId).then(() => {
        ElMessage.success(t("menu.message.remove.successDelete"));
        handleQuery();
      });
    })
    .catch(() => ElMessage.info(t("menu.deletion")));
}

/** 关闭弹窗 */
function closeDialog() {
  dialog.visible = false;
  resetForm();
}

/** 重置表单 */
function resetForm() {
  menuFormRef.value.resetFields();
  menuFormRef.value.clearValidate();

  formData.id = undefined;
  formData.parentId = 0;
  formData.visible = 1;
  formData.sort = 1;
  formData.perm = undefined;
  formData.component = undefined;
  formData.path = undefined;
  formData.redirect = undefined;
  formData.alwaysShow = undefined;
  formData.keepAlive = undefined;
}

onMounted(() => {
  handleQuery();
});
</script>
@/api/menu/model
