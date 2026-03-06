import request from "@/utils/request";
import { BasePageQuery, Report, FileUploadResponse } from "./model";

class WorkReportsAPI {
  /**
   * 获取所有工作汇报数据
   *
   */
  static workReportsPage(data: BasePageQuery) {
    return request({
      url: "/api/v1/workReports/page",
      method: "get",
      params: data,
    });
  }
  // 新建工作汇报
  static add(data: Report) {
    return request({
      url: "/api/v1/workReports",
      method: "post",
      data: data,
    });
  }
  // 删除工作汇报
  static del(ids: number) {
    return request({
      url: `/api/v1/workReports/${ids}`,
      method: "delete",
    });
  }
  // 更新工作汇报
  static upd(id: number, data: Report) {
    return request({
      url: `/api/v1/workReports/${id}`,
      method: "put",
      data: data,
    });
  }
  // 获取工作汇报详情
  static details(id: number) {
    return request({
      url: `/api/v1/workReports/${id}/form`,
      method: "get",
    });
  }
  // 上传附件
  static fileOss(formData: any) {
    return request<any, FileUploadResponse>({
      url: "/api/v1/workReports/upload",
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
      url: "/api/v1/workReports/delOss",
      method: "post",
      data: {
        url: url,
        id: id,
      },
    });
  }
}

export default WorkReportsAPI;
