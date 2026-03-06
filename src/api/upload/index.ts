import request from "@/utils/request";
import {
  Res,
  FolderOptionsResponse,
  pageReq,
  FilePageResponse,
  InitFileReq,
  InitFileResponse,
  UploadCompleteReq,
  spacesReq,
  spacesRes,
  meSpacesRes,
  initSpacesReq,
} from "./model";
// import qs from 'qs';

class UploadAPI {
  //新建文件夹
  static update(parentFolderId: number, folderName: string) {
    return request<any, Res>({
      url: "/api/v1/files",
      method: "post",
      data: { parentFolderId, folderName },
    });
  }
  //删除文件
  static deleteFile(ids: string) {
    return request<any, Res>({
      url: `/api/v1/files/${ids}`,
      method: "delete",
    });
  }
  //移动文件
  static bankFile(fileId: number, toFolderId: number) {
    return request<any, Res>({
      url: "/api/v1/files/move",
      method: "put",
      data: { fileId, toFolderId },
    });
  }
  //文件夹下拉选项(获取全部文件夹)
  static fileAll(): Promise<FolderOptionsResponse> {
    return request({
      url: "/api/v1/files/options",
      method: "get",
    });
  }
  //文件分页列表
  static pageFile(params: pageReq) {
    return request<FilePageResponse>({
      url: "/api/v1/files/page",
      method: "get",
      params,
    });
  }
  //文件重命名
  static renameFile(fileId: number, newFileName: string) {
    return request<any, Res>({
      url: "/api/v1/files/rename",
      method: "put",
      data: { fileId, newFileName },
    });
  }
  //文件下载
  static downloadFile(fileKey: string) {
    return request({
      url: `/api/v1/storage/download/${fileKey}`,
      method: "get",
    });
  }
  //上传任务初始化
  static initFile(params: InitFileReq) {
    return request<InitFileResponse>({
      url: "/api/v1/storage/upload/init",
      method: "post",
      data: params,
    });
  }
  // 上传完成
  static uploadFile(params: UploadCompleteReq, fileKey: string) {
    return request<Res>({
      url: `/api/v1/storage/upload/complete/${fileKey}`,
      method: "post",
      data: params,
    });
  }
  // 图片预览 - 原图
  static imageFile(fileKey: string) {
    return request<any, Res>({
      url: `/api/v1/storage/image/${fileKey}`,
      method: "get",
    });
  }

  // 用户存储空间分页列表
  static pageUser(params: spacesReq) {
    // 将 params 转换为 URL 查询字符串
    // const queryParams = new URLSearchParams(params as any).toString();
    return request<any, spacesRes>({
      url: `/api/v1/storage/spaces/page`,
      method: "get",
      params: params,
      // headers: {
      //   'Content-Type': 'application/x-www-form-urlencoded'
      // }
    });
  }

  // 我的存储空间
  static meSpaces() {
    return request<any, meSpacesRes>({
      url: "/api/v1/storage/spaces/me",
      method: "get",
    });
  }
  // 删除
  static deleteSpaces(ids: string[]) {
    return request<any, Res>({
      url: `/api/v1/storage/spaces/${ids}`,
      method: "delete",
      data: {
        ids: ids,
      },
    });
  }
  // 修改用户存储空间状态
  static statusSpaces(id: number, status: number) {
    return request<any, Res>({
      url: `/api/v1/storage/spaces/${id}/status`,
      method: "patch",
      data: { status },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }
  // 修改用户存储空间大小
  static modifiedSpaces(id: number, totalSpaceSize: number) {
    return request<any, Res>({
      url: `/api/v1/storage/spaces/${id}/size`,
      method: "patch",
      data: { totalSpaceSize },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }
  // 新增用户存储空间
  static init(data: initSpacesReq) {
    return request<any, Res>({
      url: "/api/v1/storage/spaces",
      method: "post",
      data: data,
    });
  }
}

export default UploadAPI;
