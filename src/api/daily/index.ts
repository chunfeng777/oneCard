import request from "@/utils/request";
import { BasePageQuery, Daily, FileUploadResponse, DailyData } from "./model";

class DailyAPI {
  // 日报分页列表
  static dailyPage(data: BasePageQuery) {
    return request({
      url: "/api/v1/reportDailys/page",
      method: "get",
      params: data,
    });
  }
  // 新增日报表
  static addDaily(data: Daily) {
    return request({
      url: "/api/v1/reportDailys",
      method: "post",
      data: data,
    });
  }
  // 日报表表单数据  (详情)
  static detailsDailys(id: number) {
    return request({
      url: `/api/v1/reportDailys/${id}/form`,
      method: "get",
    });
  }
  // 删除日报表
  static delDailys(ids: number) {
    return request({
      url: `/api/v1/reportDailys/${ids}`,
      method: "delete",
    });
  }
  // 修改日报表
  static updDailys(id: number, data: Daily) {
    return request({
      url: `/api/v1/reportDailys/${id}`,
      method: "put",
      data: data,
    });
  }
  // 上传附件
  static fileOss(formData: any) {
    return request<any, FileUploadResponse>({
      url: "/api/v1/reportDailys/upload",
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
      url: "/api/v1/reportDailys/delOss",
      method: "post",
      data: {
        url: url,
        id: id,
      },
    });
  }
  // 组长审核（已阅）
  static readDaily(id: number | null, reviewOpinion: string) {
    return request({
      url: "/api/v1/reportDailys/read",
      method: "post",
      data: {
        id: id,
        reviewOpinion: reviewOpinion,
      },
    });
  }
  // 查询单个员工日报数据
  static queryDaily(userId?: number, startTime?: string) {
    return request<any, DailyData>({
      url: "/api/v1/reportDailys/getOneDailys",
      method: "get",
      params: {
        userId: userId,
        startTime: startTime,
      },
    });
  }
}

export default DailyAPI;
