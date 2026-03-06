<template>
  <div class="contai">
    <div class="fheader">
      <UploadFile
        @toggle-view="toggleView"
        :isListView="isListView"
        @create-folder="createFolder"
        :handleBatchDelete="handleBatchDelete"
        :rows-to-delete="rowsToDelete.length"
        :parent-folder-id="parentFolderId"
        @update-table-data="uploadedFile"
        :fetchData="fetchData"
        :handleSearch="handleSearch"
        @search="handleSearch"
        :useSpace="useSpace"
      />
      <div class="breadcrumb">
        <span
          @click="navigateToFolder(null)"
          class="myFile"
          :class="{ active: currentPath.length === 0 }"
          >我的网盘 /</span
        >
        <span
          v-for="(folder, index) in currentPath"
          :key="index"
          @click="navigateToFolder(index)"
          :class="{ active: index === currentPath.length - 1 }"
        >
          {{ folder.fileName }}
          <span v-if="index !== currentPath.length - 1" class="separator"
            >/</span
          >
        </span>
      </div>
    </div>
    <div v-if="isListView" class="cont">
      <!-- 列表视图 -->

      <div v-if="tableData.length > 0">
        <el-table
          :data="tableData"
          @row-dblclick="handleItemClick"
          style="width: 100%"
          class="table-cont"
          v-infinite-scroll="handleScroll"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column property="fileName" label="文件名">
            <template #default="{ row }">
              <div class="file-info">
                <span v-if="row.isFolder">
                  <div class="image-text-container">
                    <img src="@/assets/images/folder.png" width="30px" />
                    <span>{{ row.fileName }}</span>
                  </div>
                </span>
                <span v-else>
                  <div class="image-text-container">
                    <img :src="generateImageInfo(row)" width="30px" />
                    <span>{{ row.fileName }}</span>
                  </div>
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column property="updateTime" label="修改时间" />
          <el-table-column property="formattedSize" label="大小">
            <template #default="{ row }">
              <span v-if="row.isFolder">---</span>
              <span v-else>{{ row.formattedSize }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button
                type="text"
                @click="EditPenRow(row)"
                class="delete-button"
              >
                <i-ep-EditPen />重命名
              </el-button>
              <el-button
                type="text"
                @click="deleteRow(row)"
                class="delete-button"
              >
                <i-ep-delete />删除
              </el-button>
              <el-button
                type="text"
                @click="showMoveDialog(row)"
                class="delete-button"
              >
                <i-ep-Rank />移动
              </el-button>
              <el-button
                v-if="row.isFolder === false"
                type="text"
                @click="DownloadRow(row)"
                class="delete-button"
              >
                <i-ep-Download />下载
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-else>
        <el-empty description="description" />
      </div>
    </div>

    <div v-else class="thumbnail-view">
      <!-- 缩略图视图 -->
      <!-- <div class="select-all" v-if="tableData.length > 0">
        <el-checkbox v-model="selectAll" @change="toggleSelectAll"
          >全部文件</el-checkbox
        >
      </div> -->

      <div
        class="thumbnails table-cont"
        style="height: calc(100vh - 230px); overflow-y: auto"
        v-if="tableData.length > 0"
        v-infinite-scroll="handleScroll"
      >
        <div
          v-for="item in tableData"
          :key="item.fileName"
          class="thumbnail-item"
          @dblclick="handleItemClick(item)"
          @mouseenter="onMouseEnter(item)"
          @mouseleave="onMouseLeave"
        >
          <div class="thumbnail-icon checkbox-container">
            <el-checkbox v-model="item.selected" class="thumbnail-checkbox" />
            <img
              :src="
                item.isFolder
                  ? '/src/assets/images/folder.png'
                  : generateImageInfo(item)
              "
              :width="50"
              alt=""
              class="thumbnail-image"
            />
            <!-- <span
              class="more-actions"
              style="position: absolute; top: 0; right: 0"
              v-if="hoveredItem === item"
              @mouseenter="showActions = true"
              @mouseleave="showActions = false"
            >
              <i-ep-MoreFilled />
            </span> -->
          </div>
          <div class="thumbnail-details">
            <p>{{ truncateText(item.fileName, 10) }}</p>
          </div>
          <el-popover trigger="hover">
            <div style="display: flex; flex-direction: column">
              <el-button type="text" @click="EditPenRow(item)"
                ><i-ep-EditPen />重命名</el-button
              >
              <el-button type="text" @click="deleteRow(item)"
                ><i-ep-delete />删除</el-button
              >
              <el-button type="text" @click="showMoveDialog(item)">
                <i-ep-Rank />移动
              </el-button>
              <el-button
                v-if="item.isFolder === false"
                type="text"
                @click="DownloadRow(item)"
              >
                <i-ep-Download />下载
              </el-button>
            </div>
            <template #reference>
              <el-button
                class="m-2"
                link
                style="position: absolute; top: 0; right: 0"
                ><i-ep-MoreFilled
              /></el-button>
            </template>
          </el-popover>
          <!-- <div
            class="thumbnail-actions"
            v-if="showActions && hoveredItem === item"
          >
            <el-button type="text" @click="EditPenRow(item)">重命名</el-button>
            <el-button type="text" @click="deleteRow(item)">删除</el-button>
          </div> -->
        </div>
      </div>
      <div v-else>
        <el-empty description="description" />
      </div>
    </div>
    <!-- 分页 -->
    <!-- <el-card> -->
    <!-- <pagination
      v-if="total > 0"
      v-model:total="total"
      v-model:page="Params.pageNum"
      v-model:limit="Params.pageSize"
      @pagination="handlePagination"
    /> -->
    <!-- </el-card> -->

    <!-- 分享弹窗 -->
    <!-- <el-dialog title="分享文件" v-model="shareDialogVisible" width="30%">
      <div class="share-dialog-content">
        <el-form :model="shareForm">
          <el-form-item label="访问人数：">
            <el-radio-group v-model="shareForm.visitCount">
              <el-radio :label="1">1人</el-radio>
              <el-radio :label="7">7人</el-radio>
              <el-radio :label="10">10人</el-radio>
              <el-radio :label="'不限'">不限</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="有效期：">
            <el-radio-group v-model="shareForm.expiryDate">
              <el-radio :label="1">1天</el-radio>
              <el-radio :label="7">7天</el-radio>
              <el-radio :label="30">30天</el-radio>
              <el-radio :label="365">365天</el-radio>
              <el-radio :label="'永久有效'">永久有效</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <div class="dialog-footer">
        <el-button @click="shareDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleShare">创建链接</el-button>
      </div>
    </el-dialog> -->
    <!-- 移动对话框 -->
    <el-dialog
      v-model="moveDialogVisible"
      title="移动文件"
      :style="{ width: '400px', 'max-height': '500px' }"
    >
      <!-- <el-tree-select
        v-model="selectedFolderId"
        :data="folderOptions"
        :render-after-expand="false"
        placeholder="请选择目标文件夹"
        style="width: 100%"
        @node-click="handleNodeClick"
      /> -->
      <div class="move-dialog-content">
        <!-- 文件夹列表 -->
        <div class="folder-list" style="height: 300px; overflow-y: auto">
          <el-tree
            :data="folderOptions"
            :render-after-expand="false"
            @node-click="handleNodeClick"
            node-key="id"
          >
            <!-- 自定义树节点内容 在每个节点上添加图标 -->
            <template #default="{ data }">
              <img
                src="/src/assets/images/folder.png"
                :width="30"
                alt=""
                class="thumbnail-image"
              />
              <span>{{ data.label }}</span>
            </template>
          </el-tree>
        </div>
        <!-- 目标文件夹 -->
        <div class="folder-content">
          <span>目标文件夹: {{ getSelectedFolderLabel }}</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="moveDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="moveFile(selectedRow)"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { matchType } from "./fileIcons";
import DictAPI from "@/api/dict";
import UploadAPI from "@/api/upload";
import {
  FileInfo,
  FilePageResponse,
  FolderOption,
  Space,
} from "@/api/upload/model";
import image from "@/assets/images/image.png";
import txt from "@/assets/images/txt.png";
import excel from "@/assets/images/excel.png";
import word from "@/assets/images/word.png";
import pdf from "@/assets/images/pdf.png";
import ppt from "@/assets/images/ppt.png";
import video from "@/assets/images/video.png";
// import radio from "@/assets/images/radio.png";
import zip from "@/assets/images/zip.png";
// import csv from "@/assets/images/csv.png";
// import sql from "@/assets/images/sql.png";
import other from "@/assets/images/other.png";
import defaultAvatar from "@/assets/images/default-avatar.png";
const tableData = ref<FileInfo[]>([]);
const hoveredItem = ref(null);
const showActions = ref(false);

const onMouseEnter = (item: any) => {
  hoveredItem.value = item;
};

const onMouseLeave = () => {
  hoveredItem.value = null;
};

const onMoreActionsLeave = () => {
  showActions.value = false;
  hoveredItem.value = null;
};

// 处理选中
const handleSelectionChange = (selection: any[]) => {
  tableData.value.forEach((item) => {
    item.selected = selection.some(
      (selectedItem) => selectedItem.id === item.id
    );
  });
};

let folderId = "";
// 将父组件的 tableData 与子组件传递过来的 tableData 合并
const uploadedFile = (newFile: any) => {
  // tableData.value = tableData.value.concat(newFile);
  // console.log(tableData.value);
};
const total = ref(0);
const pagePrams = ref({ pageNum: 1, pageSize: 50 });
const totalSpace = ref(0);
const useSpace = ref(0);
// 文件分页列表
const searchKeywords = ref(""); // 用于存储搜索关键词
const fetchData = async (folderId: string, keywords: string = "") => {
  const params = {
    keywords: keywords,
    fileId: folderId,
    pageNum: pagePrams.value.pageNum,
    pageSize: pagePrams.value.pageSize,
  };
  await UploadAPI.pageFile(params).then((data: any) => {
    if (pagePrams.value.pageNum === 1) {
      // tableData.value = data.list; // 第一页直接赋值
      tableData.value = data.list.map((file: any) => ({
        ...file,
        formattedSize: formatFileSize(file.fileSize),
      }));
    } else {
      // tableData.value = [...tableData.value, ...data.list]; // 后续页追加数据
      tableData.value = [
        ...tableData.value,
        ...data.list.map((file: any) => ({
          ...file,
          formattedSize: formatFileSize(file.fileSize),
        })),
      ];
      // tableData.value.push(...data.list);
    }
    total.value = data.total;
    // 计算所有文件的总大小
    useSpace.value = tableData.value.reduce(
      (sum, file) => sum + file.fileSize,
      0
    );
  });
};

// 转换字节大小
function formatFileSize(bytes: number): string {
  const k = 1024;
  const sizes = ["KB", "MB", "GB", "TB"];
  if (bytes < k) {
    // 先将bytes转换为KB，然后向上取整保留两位小数
    const size = Math.ceil((bytes / k) * 100) / 100;
    return `${size.toFixed(2)} KB`;
  } // 对于小于1KB的文件大小，显示为零点几KB
  const i = Math.floor(Math.log(bytes) / Math.log(k)) - 1;
  const size = (bytes / Math.pow(k, i + 1)).toFixed(2); // 保留两位小数
  return `${size} ${sizes[i]}`;
}

// 重置
const resetPage = () => {
  pagePrams.value.pageNum = 1;
  tableData.value = [];
};
// 分页
// const handlePagination = () => {
//   fetchData("");
// };
// 无限滚动
const handleScroll = () => {
  const container = document.querySelector(".table-cont");
  if (container) {
    const scrollHeight = container.scrollHeight;
    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;
    if (scrollTop + clientHeight >= scrollHeight) {
      // 触底逻辑
      if (pagePrams.value.pageNum * pagePrams.value.pageSize < total.value) {
        pagePrams.value.pageNum++;
        fetchData(folderId);
      }
    }
  }
};
// 截断文件名或文件夹名，显示前面的部分并添加省略号
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) {
    return text;
  } else {
    return text.substring(0, maxLength) + "...";
  }
};
const moveDialogVisible = ref(false);
const selectedFolderId = ref<string | number | null>(null); // 存储选择的文件夹的 value 值
const parentFolderId = ref(0); // 初始为根文件夹的 ID
// 文件下拉选项
const folderOptions = ref<FolderOption[]>([]);
const selectedRow = ref<any>(null);
// 展示移动对话框
const showMoveDialog = (row: any) => {
  selectedRow.value = row;
  console.log(selectedRow.value);
  moveDialogVisible.value = true;
  loadFolders(); // 获取所有文件夹
};
// 加载所有文件夹
const loadFolders = async () => {
  // 获取所有文件夹的列表
  UploadAPI.fileAll().then((data: any) => {
    folderOptions.value = data;
  });
};

// 计算属性，获取选中文件夹的名称
const getSelectedFolderLabel = computed(() => {
  if (!selectedFolderId.value) {
    return "未选择";
  }
  const folder = findFolderById(selectedFolderId.value);
  return folder ? folder.label : "未选择";
});
// 根据文件夹 ID 查找文件夹对象
const findFolderById = (id: string | number): FolderOption | undefined => {
  const findRecursive = (folders: FolderOption[]): FolderOption | undefined => {
    for (const folder of folders) {
      if (folder.value === id) {
        return folder;
      }
      if (folder.children) {
        const found = findRecursive(folder.children);
        if (found) return found;
      }
    }
    return undefined;
  };
  return findRecursive(folderOptions.value);
};
onMounted(async () => {
  await getFileTypeList();
  // await processFiles(tableData.value);
  await fetchData(folderId); // 传入空字符串表示从根目录开始加载
  loadFolders();
  nextTick(() => {
    const container = document.querySelector(".table-cont");
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
  });
});

// 用于存储文件夹导航路径的数组
const currentPath = ref<FileInfo[]>([]);
// 定义 FileType 类型
interface FileType {
  value: string | number;
  label: string;
}

const FileTypeList = ref<FileType[]>([]);
// 列表和缩略图切换
const isListView = ref(true);
const toggleView = () => {
  isListView.value = !isListView.value;
};
// 缩略图的全选
const selectAll = ref(false);
const toggleSelectAll = () => {
  tableData.value.forEach((item) => (item.selected = selectAll.value));
};
//重命名
const EditPenRow = (row: any) => {
  ElMessageBox.prompt("请输入新的名称", `重命名【${row.fileName}】`, {
    inputValue: row.fileName, //预填充文件名
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(({ value }) => {
    UploadAPI.renameFile(row.id, value).then(() => {
      ElMessage({
        type: "success",
        message: `【${row.fileName}】重命名为【${value}】成功`,
      });
      resetPage();
      fetchData(folderId); // 刷新数据
    });
  });
};
// 删除
const deleteRow = (row: any) => {
  ElMessageBox.confirm(`确定要删除【${row.fileName}】吗?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    UploadAPI.deleteFile(row.id).then(() => {
      ElMessage.success("删除成功");
      resetPage();
      // fetchData(parentFolderId.value.toString()); // 刷新数据
      fetchData(parentFolderId.value.toString());
    });
  });
};
// 计算选中行的数量
const rowsToDelete = computed(() => {
  return tableData.value.filter((item) => item.selected);
});
// 批量删除
const handleBatchDelete = () => {
  // const rowsToDelete = tableData.value.filter((item) => item.selected);
  if (rowsToDelete.value.length === 0) {
    ElMessage.warning("请先选择要删除的文件！");
    return;
  }
  ElMessageBox.confirm("确定要删除选中的文件吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    const fileIds = rowsToDelete.value.map((row) => row.id);
    const commaSeparatedIds = fileIds.join(","); // 将数字数组转换为逗号分隔的字符串
    UploadAPI.deleteFile(commaSeparatedIds).then(() => {
      ElMessage.success("删除成功");
      fetchData(parentFolderId.value.toString());
    });
  });
};
//文件下载
const DownloadRow = (row: any) => {
  ElMessageBox.confirm(`确定要下载【${row.fileName}】吗?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "success",
  }).then(() => {
    // UploadAPI.downloadFile返回的是文件的URL
    UploadAPI.downloadFile(row.fileKey).then(async (fileUrl: any) => {
      // 使用fetch从URL获取文件
      const response = await fetch(fileUrl.url);
      // 将响应体转换为Blob
      const blob = await response.blob();
      // 创建一个对象URL来表示Blob
      const url = URL.createObjectURL(blob);
      // 创建一个隐藏的a标签来触发下载
      const link = document.createElement("a");
      link.href = url;
      link.download = row.fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      // 触发下载
      link.click();
      // 清理
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 0);
      ElMessage.success("下载成功");
    });
  });
};
//移动文件
const moveFile = (row: any) => {
  if (!selectedFolderId.value) {
    ElMessage.error("请选择一个文件夹");
    return;
  }
  const fileId = row.id;
  const toFolderId = Number(selectedFolderId.value);
  if (isNaN(toFolderId)) {
    ElMessage.error("无效的文件夹 ID");
    return;
  }
  // 移动文件接口
  UploadAPI.bankFile(fileId, toFolderId).then(() => {
    ElMessage.success("文件移动成功");
    selectedFolderId.value = null; // 移动文件成功后清空选项
    resetPage();
    fetchData(parentFolderId.value.toString()); // 刷新数据
    moveDialogVisible.value = false; // 关闭
  });
};
// 处理节点点击事件，可以选择父节点
const handleNodeClick = (node: any) => {
  selectedFolderId.value = node.value;
};

// 新建文件夹
const createFolder = () => {
  ElMessageBox.prompt("请输入文件夹名称", "新建文件夹", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  }).then(({ value }) => {
    // 调用接口创建文件夹
    UploadAPI.update(parentFolderId.value, value).then(() => {
      ElMessage.success("文件夹创建成功");
      resetPage();
      // 刷新文件列表
      fetchData(parentFolderId.value.toString());
    });
  });
};
// 获取文件类型字典
const getFileTypeList = async () => {
  const data: FileType[] = await DictAPI.getDictOptions("FileTypes");
  FileTypeList.value = data;
};
function generateImageInfo(fileData: FileInfo): string {
  const type = matchType(fileData.fileName);
  // 文件类型到图片路径的映射
  const iconMap: Record<string, string> = {
    image: image,
    txt: txt,
    excel: excel,
    word: word,
    pdf: pdf,
    ppt: ppt,
    video: video,
    // radio: radio,
    zip: zip,
    // csv: csv,
    // sql: sql,
    other: other,
  };

  // 根据文件类型返回对应的图片路径，如果类型是 false 则返回默认图片
  return iconMap[type as keyof typeof iconMap] || defaultAvatar;
}

// 根据文件类型判断是否展开文件夹
const handleItemClick = async (item: FileInfo) => {
  // 如果是文件夹，则加载子文件列表或者切换文件路径等操作
  if (item.isFolder) {
    // const newPath = [...currentPath.value, item];
    // updateCurrentPath(newPath);
    currentPath.value.push(item);
    // 更新父文件夹 ID
    // parentFolderId.value = item.id;
    await navigateToFolder(currentPath.value.length - 1);
    pagePrams.value.pageNum = 1;
    await fetchData(item.id.toString());
  } else {
    // viewFile(item);
    // 对于非文件夹项，仅更新当前路径
    // currentPath.value.push(item);
    // 设置 tableData 为空数组，触发 <el-empty> 显示
    // tableData.value = [];
  }
};
// 点击面包屑跳转
const navigateToFolder = async (index: number | null) => {
  let newCurrentPath: FileInfo[] = [];
  if (index === null) {
    newCurrentPath = []; // 清空路径，回到根目录
    // updateCurrentPath([]);
  } else {
    newCurrentPath = [...currentPath.value.slice(0, index + 1)];
    // updateCurrentPath([...currentPath.value.slice(0, index + 1)]);
  }
  // updateCurrentPath(newCurrentPath);
  currentPath.value = newCurrentPath;
  // 获取当前文件夹的 id，用于 fetchData 调用
  const folderId =
    newCurrentPath.length > 0
      ? newCurrentPath[newCurrentPath.length - 1].id.toString()
      : "";
  parentFolderId.value = parseInt(folderId) || 0; // 更新 parentFolderId
  //pagePrams.value.pageNum = 1; // 更新页码，确保从第一页开始加载数据
  // 加载当前文件夹的子文件列表
  await fetchData(folderId);
  // await fetchData(parentFolderId.value.toString());
};
// 搜索
const handleSearch = (keywords: string) => {
  searchKeywords.value = keywords;
  pagePrams.value.pageNum = 1; // 重置页码
  fetchData(folderId, searchKeywords.value); // 传递搜索关键词
};

watch(
  tableData,
  (newVal) => {
    selectAll.value = newVal.every((item) => item.selected);
  },
  { deep: true }
);
</script>
<style scoped>
.contai {
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 隐藏外部滚动条 */
}

.fheader {
  position: sticky; /* 使其固定在顶部 */
  top: 0;
  z-index: 1;
  flex-shrink: 0;
  background-color: white;
}

.breadcrumb {
  display: flex;
  gap: 5px;
  align-items: center;
  height: 40px;
  background-color: #fff;
  border-bottom: 1px solid #e8eaec;
}

.myFile {
  margin-left: 14px;
}

.breadcrumb span {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
}

.breadcrumb span.active {
  color: #007bff; /* 激活状态的颜色 */
}

.breadcrumb span.separator {
  margin: 0 5px;
  color: #999;
}

.thumbnail-view {
  display: flex;
  flex-direction: column;
}

.select-all {
  margin: 0 10px;
}

.thumbnails {
  display: flex;
  flex-wrap: wrap;
}

.thumbnail-item {
  position: relative;
  box-sizing: border-box; /* 包含 border 和 padding 在内 */
  width: 150px;
  height: 120px;
  padding: 10px;
  margin: 10px;
  text-align: center;
  border: 1px solid transparent; /* 初始透明边框 */
  border: 1px solid #ddd;
  border-radius: 8px;
}

.checkbox-container {
  position: relative;
}

.thumbnail-icon {
  position: relative;
}

.thumbnail-checkbox {
  position: absolute;
  top: -10px;
  left: 0;
}

.thumbnail-actions {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
}

.thumbnail-item:hover .thumbnail-actions,
.more-actions:hover + .thumbnail-actions {
  display: flex;
}

.cont {
  flex-grow: 1;
  overflow-y: auto;
}

.table-cont {
  height: calc(100vh - 222px);
}

.thumbnail-details {
  margin-top: -10px;
}

.file-info {
  display: flex;
  align-items: center;
}

.image-text-container {
  display: flex;
  gap: 5px; /* 图片和文本之间的间隙 */
  align-items: center; /* 垂直居中对齐 */
}

.file-info .delete-button {
  margin-left: 30px;
}

.folder-content {
  margin-top: 18px;
  font-size: 16px;
}
</style>
