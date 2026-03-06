import request from "@/utils/request";
import { BasePageQuery, add, FileUploadResponse } from "./model";

class PerformanceAPI {
  // 分页列表
  static performancePage(data: BasePageQuery) {
    return request({
      url: "/api/v1/employeePerformances/page",
      method: "get",
      params: data,
    });
  }
  // 新增
  static addPerformance(data: add) {
    return request({
      url: "/api/v1/employeePerformances",
      method: "post",
      data: data,
    });
  }
  // 表单数据  (详情)
  static detailsPerformance(id: number) {
    return request({
      url: `/api/v1/employeePerformances/${id}/form`,
      method: "get",
    });
  }
  // 删除
  static delPerformance(ids: number) {
    return request({
      url: `/api/v1/employeePerformances/${ids}`,
      method: "delete",
    });
  }
  // 修改
  static updPerformance(id: number, data: add) {
    return request({
      url: `/api/v1/employeePerformances/${id}`,
      method: "put",
      data: data,
    });
  }
  // 上传附件
  static fileOss(formData: any) {
    return request<any, FileUploadResponse>({
      url: "/api/v1/employeePerformances/upload",
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData, // 将 FormData 作为请求体传递
    });
  }
  // 删除附件
  static fileDelete(url: string, id: number) {
    return request({
      url: "/api/v1/employeePerformances/delOss",
      method: "post",
      data: {
        url: url,
        id: id,
      },
    });
  }
}

export default PerformanceAPI;
