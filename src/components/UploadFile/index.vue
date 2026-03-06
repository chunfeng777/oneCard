<template>
  <div>
    <!-- <el-card> -->
    <div class="button-container">
      <div class="left-buttons">
        <el-button class="custom-file-upload" type="primary">
          <label for="file-input" class="file-label">上传文件</label>
          <input
            id="file-input"
            type="file"
            multiple
            class="file-btn"
            required
            @change="handleFileChange"
          />
        </el-button>
        <el-button type="success" @click="$emit('createFolder')"
          >新建文件夹</el-button
        >
        <el-button
          type="danger"
          @click="handleBatchDelete"
          :disabled="rowsToDelete === 0"
          >批量删除</el-button
        >
        <div class="sContainer">
          <el-input
            v-model="searchKeywords"
            placeholder="请输入文件名"
            class="search-input"
          />
          <el-button @click="handleSearch" type="primary">搜索</el-button>
        </div>
        <div class="file-uploader">
          <el-popover :visible="popoverVisible" placement="bottom" width="600">
            <div class="upload-list">
              <p v-if="isUploading">上传中...</p>
              <p v-else>没有正在上传的文件</p>
              <!-- 文件上传列表 -->
              <el-scrollbar class="upload-list-scrollbar">
                <el-table
                  :data="uploadList"
                  v-if="uploadList.length > 0"
                  :style="{ height: tableHeight }"
                  :scroll="{ y: scrollHeight }"
                >
                  <el-table-column prop="fileName" label="文件名" />
                  <el-table-column prop="status" label="状态" />
                  <!-- <el-table-column label="进度">
                <template #default="scope">
                  <ProgressBarFile :progress="scope.row.progress" />
                </template>
              </el-table-column> -->
                  <!-- <el-table-column label="操作">
                <template #default="scope">
                  <el-button @click="togglePause(scope.row)" link>
                    <span v-if="scope.row.isPaused">
                      <i-ep-VideoPlay />
                    </span>
                    <span v-else>
                      <i-ep-VideoPause />
                    </span>
                  </el-button>
                </template>
              </el-table-column> -->
                </el-table>
              </el-scrollbar>
            </div>
            <template #reference>
              <el-button @click="togglePopover" type="primary" link>
                <i-ep-Sort />
              </el-button>
            </template>
          </el-popover>
        </div>
      </div>
      <div class="right-buttons">
        <el-tooltip
          content="切换到缩略图视图"
          placement="top"
          v-if="isListView"
        >
          <el-button type="primary" @click="$emit('toggleView')">
            <i-ep-Menu />
          </el-button>
        </el-tooltip>
        <el-tooltip content="切换到列表视图" placement="top" v-else>
          <el-button type="primary" @click="$emit('toggleView')">
            <i-ep-Fold />
          </el-button>
        </el-tooltip>
        <SpaceUsageProgressBar
          v-for="row in tableData"
          :key="row.id"
          @update:spaceInfo="updateSpaceInfo(index, $event)"
        />
      </div>
    </div>
    <!-- </el-card> -->
  </div>
</template>

<script setup>
import axios from "axios";
import UploadAPI from "@/api/upload";
const progress = ref(0);
const uploading = ref(false);
const popoverVisible = ref(false);
const uploadList = ref([]); // 上传列表
// 计算表格高度和滚动高度
const tableHeight = computed(() => `calc(400px - 80px)`);
const headerHeight = 20; // 表头高度
const scrollHeight = computed(
  () => parseInt(tableHeight.value.replace("px", "")) - headerHeight
);
// const totalProgress = ref(0);
const togglePopover = () => {
  popoverVisible.value = !popoverVisible.value;
};
// 最大并发数
const maxConcurrency = 10;
// const f1 = ref<InitFileData[]>([]);
const tableData = ref([
  {
    spaceUsed: 0,
    totalSpace: 0,
  },
]);
const FileList = [];
function addFile(file) {
  FileList.push(file);
}
// 更新 tableData 中的空间使用信息
const updateSpaceInfo = (index, spaceInfo) => {
  tableData.value[index] = {
    spaceUsed: spaceInfo.spaceUsed,
    totalSpace: spaceInfo.totalSpace,
  };
};
import SparkMD5 from "spark-md5";
// 文件对象
const fileObj = ref(null);
// 计算是否有文件正在上传
const isUploading = computed(() =>
  uploadList.value.some((file) => file.status === "正在上传")
);

// 当选择文件时，调用 handleFileChange 方法处理文件选择，并调用 uploadFileInChunks 方法上传文件切片
const handleFileChange = async (event) => {
  const selectedFiles = Array.from(event.target.files);
  // console.log("选择文件:", selectedFiles);

  // 立即将文件添加到列表并标记为等待上传
  selectedFiles.forEach((file) => {
    addFileToUploadList(file.name, "等待上传");
  });

  uploading.value = true;
  popoverVisible.value = true;

  for (const file of selectedFiles) {
    fileObj.value = file;
    await uploadFile(file);
  }

  event.target.value = "";
};

const uploadFile = async (file) => {
  const fileMD5 = await calculateFileMD5(file);
  const initParams = {
    fileMd5: fileMD5,
    fullFileName: file.name,
    fileSize: file.size,
    isPrivate: false,
  };

  let fileIndex = uploadList.value.findIndex(
    (item) => item.fileName === file.name && item.status !== "上传完成"
  );
  if (fileIndex === -1) {
    addFileToUploadList(file.name, "等待上传");
    fileIndex = uploadList.value.findIndex(
      (item) => item.fileName === file.name && item.status === "等待上传"
    );
  }
  updateUploadList(fileIndex, "正在上传");

  // console.log("初始化参数:", initParams);
  const initResult = await UploadAPI.initFile(initParams);
  // console.log("初始化结果:", initResult);

  const {
    partList,
    fileKey,
    fileMd5,
    fileMimeType,
    isDone,
    partCount,
    partSize,
    fileSize,
  } = initResult;

  if (isDone) {
    await notifyServerToCombineChunks(
      props.parentFolderId,
      fileKey,
      partList.map((part) => part.md5),
      fileMimeType,
      partSize
    );
    updateUploadList(fileIndex, "上传完成");
  } else {
    let chunkList = [];
    let chunkMd5List = [];

    if (partList.length < partCount) {
      console.log("开始断点续传");
      const chunksData = await createChunks(
        file,
        partList,
        partSize,
        fileSize,
        partCount - partList.length
      );
      chunkList = chunksData.chunksList;
      chunkMd5List = chunksData.chunksMd5List;
      if (partList.length === 0) {
        await notifyServerToCombineChunks(
          props.parentFolderId,
          fileKey,
          chunkMd5List,
          fileMimeType,
          partSize,
          fileMD5
        );
        updateUploadList(fileIndex, "上传完成");
        return;
      }
    } else {
      console.log("直接上传");
      const chunksData = await createChunks(
        file,
        partList,
        partSize,
        fileSize,
        partCount
      );
      chunkList = chunksData.chunksList;
      chunkMd5List = chunksData.chunksMd5List;
    }

    // 将文件状态设置为“正在上传”
    // updateUploadList(fileIndex, "正在上传");

    await uploadChunks(
      partList,
      chunkList,
      fileKey,
      fileMimeType,
      chunkMd5List,
      partSize,
      file
    );
    updateUploadList(fileIndex, "上传完成");
    // 如果没有其他文件正在上传，设置 uploading 为 false
    if (!isUploading.value) {
      uploading.value = false;
    }
  }
};
// 添加文件到上传列表
const addFileToUploadList = (fileName, status) => {
  // const existingFileIndex = uploadList.value.findIndex(
  //   (file) => file.fileName === fileName
  // );

  // if (existingFileIndex !== -1) {
  //   uploadList.value[existingFileIndex].status = status;
  // } else {
  uploadList.value.push({
    fileName,
    status,
  });
  // };
};

// 更新上传列表中的文件状态
const updateUploadList = (index, status) => {
  if (index !== -1) {
    uploadList.value[index].status = status;
  }
};

// 计算文件的 MD5
const calculateFileMD5 = (file) => {
  return new Promise((resolve, reject) => {
    const chunkSize = 2 * 1024 * 1024; // 2MB
    const chunks = Math.ceil(file.size / chunkSize);
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();
    let currentChunk = 0;
    fileReader.onload = (event) => {
      spark.append(event.target.result);
      currentChunk++;

      if (currentChunk < chunks) {
        loadNext();
      } else {
        resolve(spark.end());
      }
    };
    fileReader.onerror = (event) => {
      reject(event);
    };
    function loadNext() {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      fileReader.readAsArrayBuffer(file.slice(start, end));
    }
    loadNext();
  });
};
// 创建文件分块
const createChunks = async (file, partList, partSize, fileSize, partCount) => {
  const chunks = { chunksList: [], chunksMd5List: [] };
  // 首先，计算所有分块的MD5值，无论是否已上传
  const totalChunks = Math.ceil(fileSize / partSize);
  // 首先收集所有已上传分块的MD5值
  const existingChunksMd5List = partList
    .filter((part) => part.md5 && part.md5 !== "") // 过滤掉 md5 为 undefined 或者空字符串的情况
    .map((part) => part.md5);
  if (partList.length === 0) {
    console.log("所有分块都已上传");
    const totalChunks = Math.ceil(fileSize / partSize);
    // 计算所有分块的 MD5 值
    for (let i = 0; i < totalChunks; i++) {
      const start = i * partSize;
      const end = Math.min(fileSize, start + partSize);
      const chunk = file.slice(start, end);
      chunks.chunksList.push(chunk);
      chunks.chunksMd5List.push(await calculateChunkMD5(chunk));
    }
  } else {
    console.log("直接上传  创建文件分块");
    // 添加已上传分块的chunk和md5
    for (let i = 0; i < partList.length; i++) {
      const part = partList[i];
      const chunk = file.slice(part.startPosition, part.endPosition);
      chunks.chunksList.push(chunk);
      chunks.chunksMd5List.push(part.md5 || (await calculateChunkMD5(chunk))); // 使用已有的md5或计算新的
    }
    // 计算剩余未上传的分块的 MD5 值
    for (let i = partList.length; i < totalChunks; i++) {
      const start = i * partSize;
      const end = Math.min(fileSize, start + partSize);
      const chunk = file.slice(start, end);
      chunks.chunksList.push(chunk);
      chunks.chunksMd5List.push(await calculateChunkMD5(chunk));
    }
  }
  // 将已上传分块的MD5值与新计算的MD5值合并
  // chunks.chunksMd5List = [...existingChunksMd5List, ...chunks.chunksMd5List];
  // console.log("chunks:", chunks);
  return chunks;
};
const calculateChunkMD5 = (chunk) => {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      spark.append(event.target.result);
      resolve(spark.end().toLowerCase()); // 哈希 小写
    };
    fileReader.onerror = (event) => reject(event);

    fileReader.readAsArrayBuffer(chunk);
  });
};
// 并发上传文件分块
const uploadChunks = async (
  partList,
  chunks,
  fileKey,
  fileMimeType,
  chunkMd5List,
  partSize
) => {
  const totalChunks = partList.length;
  let completedChunks = 0;
  const partMd5List = [];
  const uploadTasks = [];
  if (!fileMimeType) {
    fileMimeType = fileObj.value.type;
  }
  for (let i = 0; i < totalChunks; i++) {
    const part = partList[i] || {};
    const chunk = chunks[i];
    const url = part.url;
    const chunkMd5 = chunkMd5List[i];
    const task = async () => {
      const response = await axios.put(url, chunk, {
        headers: [
          { "Content-Type": fileMimeType },
          {
            "Content-MD5": chunkMd5,
          },
        ],
      });
      console.log("上传成功", chunkMd5);
      partMd5List.push(chunkMd5);
      completedChunks++;
    };

    uploadTasks.push(task);
  }
  const batchedTasks = partition(uploadTasks, maxConcurrency);
  for (const batch of batchedTasks) {
    await Promise.all(batch.map((task) => task()));
  }
  console.log("所有并发上传任务已完成");
  // 确保所有分块上传完成后才尝试合并文件
  if (uploadTasks.length === totalChunks) {
    await notifyServerToCombineChunks(
      props.parentFolderId,
      fileKey,
      chunkMd5List, //整个文件的所有分块的 MD5
      fileMimeType,
      partSize
    );
  }
};

// 辅助函数，用于将数组分割成指定大小的子数组
const partition = (array, size) => {
  let result = [];
  // 循环遍历数组，创建指定大小的子数组
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};
const notifyServerToCombineChunks = async (
  parentFolderId,
  fileKey,
  partMd5List,
  fileMimeType,
  partSize
) => {
  console.log("开始请求后端合并文件");
  const data = await UploadAPI.uploadFile(
    {
      partMd5List,
      parentFolderId,
    },
    fileKey
  );
  console.log("合并文件结果:", data);
  if (!data.isComplete) {
    // 如果文件没有完全合并，获取剩余部分并上传
    const remainingParts = data.partList;
    if (remainingParts.length > 0) {
      const { chunksList, chunksMd5List } = await createChunks(
        fileObj.value,
        remainingParts,
        partSize,
        fileObj.value.size
      );
      await uploadChunks(
        remainingParts,
        chunksList,
        fileKey,
        fileMimeType,
        chunksMd5List,
        partSize
      );
    }
  }
  // progress.value = 100;
  props.fetchData(props.parentFolderId);
};
const handleBatchDelete = () => {
  props.handleBatchDelete(tableData.value.filter((item) => item.selected));
};
const props = defineProps({
  isListView: Boolean,
  parentFolderId: Number,
  fetchData: Function,
  handleBatchDelete: Function,
  rowsToDelete: Number,
  handleSearch: Function,
  useSpace: Number,
  totalSpace: Number,
});
const emit = defineEmits(["search"]); // 定义一个search事件
const searchKeywords = ref("");
const handleSearch = () => {
  emit("search", searchKeywords.value); // 发出 search 事件，并传递搜索关键词
};
</script>
<style scoped>
.button-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px; /* 添加内边距 */
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
}
.file-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.upload-icon {
  margin-top: 10px;
  font-size: 24px;
  color: #76c7c0;
  cursor: pointer;
}
.upload-list {
  margin: -10px;
  padding: 10px;
  height: 400px;
  overflow: auto;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(177, 175, 175, 0.15);
}
.upload-list-scrollbar {
  height: 350px;
}
.upload-list p {
  margin: 5px 0;
}
input[type="file"] {
  display: none;
}
.left-buttons,
.right-buttons {
  display: flex;
  gap: 10px; /* 添加按钮之间的间距 */
  align-items: center;
  justify-content: center;
}
.custom-file-upload {
  position: relative;
  overflow: hidden;
}
.file-box {
  display: inline-block;
  width: 100px;
  color: rgb(255 255 255);
  cursor: pointer;
  background-color: rgb(252 113 0);
}
.file-btn {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2; /* 确保文件输入框在最上层，但不可见 */
  width: 100%;
  height: 100%;
  cursor: pointer; /* 确保鼠标悬停时显示正确光标 */
  opacity: 0;
}
.file-label {
  cursor: pointer;
}
/* 添加对 SpaceUsageProgressBar 的样式限制 */
.SpaceUsageProgressBar {
  flex-shrink: 0; /* 防止进度条在容器缩小时压缩 */
}
/*搜索样式*/
.sContainer {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
