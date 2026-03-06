import request from "@/utils/request";
import {
  BasePageQuery,
  Report,
  FileUploadResponse,
  reportNotice,
  reportNoticeResponse,
  reportList,
} from "./model";

class ReportAPI {
  // 周报分页列表
  static weeksPage(data: BasePageQuery) {
    return request({
      url: "/api/v1/reportWeeks/page",
      method: "get",
      params: data,
    });
  }
  // 新增周报表
  static addWeeks(data: Report) {
    return request({
      url: "/api/v1/reportWeeks",
      method: "post",
      data: data,
    });
  }
  // 周报表表单数据  (详情)
  static detailsWeeks(id: number) {
    return request({
      url: `/api/v1/reportWeeks/${id}/form`,
      method: "get",
    });
  }
  // 删除周报表
  static delWeeks(ids: number) {
    return request({
      url: `/api/v1/reportWeeks/${ids}`,
      method: "delete",
    });
  }
  // 修改周报表
  static updWeeks(id: number, data: Report) {
    return request({
      url: `/api/v1/reportWeeks/${id}`,
      method: "put",
      data: data,
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
  // 组长审核（已阅）
  static readReport(id: number | null, reviewOpinion: string) {
    return request({
      url: "/api/v1/reportWeeks/read",
      method: "post",
      data: {
        id: id,
        reviewOpinion: reviewOpinion,
      },
    });
  }

  // 首页日报周报消息通知列表
  static getReportNotices(queryParams: reportNotice) {
    return request<any, reportNoticeResponse>({
      url: "/api/v1/reportNotices/page",
      method: "get",
      params: queryParams,
    });
  }

  // 首页日报周报消息全部已读
  static reportReadAll() {
    return request({
      url: "/api/v1/reportNotices/read-all",
      method: "put",
    });
  }

  // 首页日报周报消息全部已读
  static getReportMeCount() {
    return request<any, number>({
      url: "/api/v1/reportNotices/meCount",
      method: "get",
    });
  }

  // 首页日报周报消息表单数据
  static getReportForm(id: number) {
    return request<any, reportList>({
      url: `/api/v1/reportNotices/${id}/form`,
      method: "get",
    });
  }
}

export default ReportAPI;
