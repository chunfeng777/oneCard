import request from "@/utils/request";
import { BasePageQuery, add, FileUploadResponse, auditForm } from "./model";

class DevelopmentAPI {
  // 分页列表
  static developmentPage(data: BasePageQuery) {
    return request({
      url: "/api/v1/softwareDevelopments/page",
      method: "get",
      params: data,
    });
  }
  // 新增
  static addDevelopment(data: add) {
    return request({
      url: "/api/v1/softwareDevelopments",
      method: "post",
      data: data,
    });
  }
  // 表单数据  (详情)
  static detailsDevelopment(id: number) {
    return request({
      url: `/api/v1/softwareDevelopments/${id}/form`,
      method: "get",
    });
  }
  // 删除
  static delDevelopment(ids: number) {
    return request({
      url: `/api/v1/softwareDevelopments/${ids}`,
      method: "delete",
    });
  }
  // 修改
  static updDevelopment(id: number, data: add) {
    return request({
      url: `/api/v1/softwareDevelopments/${id}`,
      method: "put",
      data: data,
    });
  }
  // 验收审核
  static auditDevelopment(id: number, data: auditForm) {
    return request({
      url: "/api/v1/softwareDevelopments/read",
      method: "post",
      data: {
        id: id,
        ...data,
      },
    });
  }
  // 上传附件
  static fileOss(formData: any) {
    return request<any, FileUploadResponse>({
      url: "/api/v1/reportWeeks/upload",
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
      url: "/api/v1/reportWeeks/delOss",
      method: "post",
      data: {
        url: url,
        id: id,
      },
    });
  }
}

export default DevelopmentAPI;
