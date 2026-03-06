// 响应参数
export interface Res {
  code: string;
  data: Record<string, any>;
  msg: string;
}
// 文件夹下拉选项 （获取全部文件夹）
// 定义子文件夹的接口
export interface FolderOptionChild {
  value: string | number;
  label: string;
  children?: FolderOptionChild[];
}
// 定义主要数据结构的接口
export interface FolderOption {
  value: string | number;
  label: string;
  children?: FolderOption[];
}
// 定义响应接口
export interface FolderOptionsResponse {
  code: string;
  data: FolderOption[];
  msg: string;
}

// 文件分页列表请求参数接口
export interface pageReq {
  keywords: string;
  fileId: string;
  pageNum: number;
  pageSize: number;
}

// 文件分页列表数据接口
export interface FileInfo {
  id: number;
  fileName: string;
  fileKey: string;
  isFolder: boolean;
  fileSize: number;
  fileSuffix: string;
  createTime: string;
  updateTime: string;
  selected?: boolean; // 是否被选中
  thumbnail?: string; // 图标路径，可选属性
}

// 文件分页列表响应数据接口
export interface FilePageData {
  list: FileInfo[];
  total: number;
}

// 文件分页列表响应接口
export interface FilePageResponse {
  code: string;
  data: FilePageData;
  msg: string;
}

//文件重命名
export interface renameReq {
  fileId: number;
  newFileName: string;
}

// 文件初始化上传请求参数接口
export interface InitFileReq {
  fileMd5: string;
  fullFileName: string;
  fileSize: number;
  isPrivate: boolean;
}

// 部分文件信息接口（分片信息接口）
export interface PartInfo {
  md5?: string;
  chunk?: any;
  uploadId: string;
  url: string;
  startPosition: number;
  endPosition: number;
}

// 文件初始化上传响应数据接口
export interface InitFileData {
  id: number;
  fileKey: string;
  fileMd5: string;
  fileName: string;
  fileMimeType: string;
  fileSuffix: string;
  fileSize: number;
  isDone: boolean;
  partCount: number;
  partSize: number;
  allChunkMd5List?: String[];
  partList: PartInfo[];
}

// 文件初始化上传响应数据接口
export interface FileInfo {
  id: number;
  fileKey: string;

  fileMd5: string;
  fileName: string;
  fileMimeType: string;
  fileSuffix: string;
  fileSize: number;
  isDone: boolean;
  partCount: number;
  partSize: number;
  partList: PartInfo[];
}

// 文件初始化上传响应接口
export interface InitFileResponse {
  code: string;
  data: InitFileData;
  msg: string;
}

// 上传完成请求参数接口
export interface UploadCompleteReq {
  partMd5List: string[];
  parentFolderId: number;
}

// 用户存储空间分页列表
export interface spacesReq {
  keywords: string;
  pageNum: number;
  pageSize: number;
}

// 用户信息接口
export interface User {
  userId: number;
  username: string;
  nickname: string;
  avatar: string;
  mobile: string;
  genderLabel: string;
  email: string;
  deptName: string;
}

// 空间信息接口
export interface Space {
  id: number;
  user: User;
  useSpace: number;
  totalSpace: number;
  createTime: string;
  updateTime: string;
}

// 响应数据接口
export interface spacesRes {
  code: string;
  data: {
    list: Space[];
    total: number;
  };
  msg: string;
}

// 我的存储空间
export interface meSpacesRes {
  code: string;
  data: {
    useSpace: number;
    totalSpace: number;
  };
  msg: string;
}
// 新增用户存储空间
export interface initSpacesReq {
  userId: number;
  totalSpace: number;
  status: boolean;
}
