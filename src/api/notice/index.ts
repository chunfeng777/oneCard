import request from "@/utils/request";
import {
  BasePageQuery,
  addReqData,
  NoticeResponse,
  NoticesData,
} from "./model";

class NoticeAPI {
  // 查询公告列表
  static listNotice(query: BasePageQuery) {
    return request({
      url: "/api/v1/notices/page",
      method: "get",
      params: query,
    });
  }
  // 查询公告详细
  static getNotice(id: number) {
    return request({
      url: `/api/v1/notices/${id}/form`,
      method: "get",
    });
  }

  // 新增公告
  static addNotice(data: addReqData) {
    return request({
      url: "/api/v1/notices",
      method: "post",
      data: data,
    });
  }

  // 修改公告
  static updateNotice(data: any, id: number) {
    return request({
      url: `/api/v1/notices/${id}`,
      method: "put",
      data: data,
    });
  }

  // 删除公告
  static delNotice(ids: any[]) {
    return request({
      url: `/api/v1/notices/${ids}`,
      method: "delete",
    });
  }

  // 首页（所有公告）（可改为新接口）
  static findAllNotice(data: BasePageQuery) {
    return request({
      url: "/api/v1/notices/homePage",
      method: "get",
      params: data,
    });
  }
  // 首页（前五条公告）
  static firstFiveNotice() {
    return request({
      url: "/api/v1/notices/homeTop",
      method: "get",
    });
  }
  // 公告通知
  static getNotices(data: NoticesData) {
    return request<any, NoticeResponse>({
      url: `/api/v1/notices/my-page`,
      method: "get",
      params: data,
    });
  }

  // 阅读获取通知公告详情
  static getNoticeDetail(id: number) {
    return request({
      url: `/api/v1/notices/${id}/detail`,
      method: "get",
    });
  }

  // 获取未读公告总数
  static getNoticeMeCount() {
    return request<any, number>({
      url: `/api/v1/notices/meCount`,
      method: "get",
    });
  }

  // 公告总数全部已读
  static getNoticeReadAll() {
    return request({
      url: `/api/v1/notices/read-all`,
      method: "PUT",
    });
  }
}

export default NoticeAPI;
