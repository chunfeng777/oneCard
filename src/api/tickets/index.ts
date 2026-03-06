import request from "@/utils/request";
import {
  TicketsRes,
  TicketsReq,
  AssignReq,
  HistoryPageReq,
  HistoryPageRes,
  TicketHistoryIdRes,
  UpdateReq,
  ticketNotificationsReq,
  ApiResponse,
} from "./model";

class TicketsAPI {
  // 创建
  static getFormData(queryParams: TicketsReq) {
    return request<any, TicketsRes>({
      url: "/api/v1/tickets/create",
      method: "post",
      data: queryParams,
    });
  }

  // 接受
  static AcceptData(id: number) {
    return request<any, TicketsRes>({
      url: `/api/v1/tickets/${id}/accept`,
      method: "put",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }
  // 分配
  static AssignData(queryParams: AssignReq) {
    return request<any, TicketsRes>({
      url: "/api/v1/tickets/assign",
      method: "post",
      data: queryParams,
    });
  }
  // 回退
  static RollbackData = (ticketId: number, remark: string) => {
    return request<any, TicketsRes>({
      url: "/api/v1/tickets/rollback",
      method: "post",
      data: { ticketId, remark },
    });
  };
  // 完成
  static CompleteData = (ticketId: number, resolution: string) => {
    return request<any, TicketsRes>({
      url: "/api/v1/tickets/complete",
      method: "post",
      data: { ticketId, resolution },
    });
  };
  // 工单操作记录详情分页列表
  static HistoryPageData = (queryParams: HistoryPageReq) => {
    return request<HistoryPageReq, HistoryPageRes>({
      url: "/api/v1/ticket/history/page",
      method: "get",
      params: queryParams,
    });
  };
  // 工单分配记录详情
  static TicketHistoryIdData = (ticketHistoryId: number) => {
    return request<any, TicketHistoryIdRes>({
      url: `/api/v1/ticket/assigns/${ticketHistoryId}/form`,
      method: "get",
    });
  };
  // 修改
  static UpdateData(queryParams: UpdateReq) {
    return request<any, TicketsRes>({
      url: `/api/v1/tickets/${queryParams.id}`,
      method: "put",
      data: queryParams,
    });
  }
  // 删除
  static DeleteData(ids: string) {
    return request<any, TicketsRes>({
      url: `/api/v1/tickets/${ids}`,
      method: "delete",
    });
  }
  // 催单
  static RemindersData(id: number) {
    return request<any, TicketsRes>({
      url: `/api/v1/tickets/${id}/reminder`,
      method: "put",
    });
  }
  // 工单通知表分页列表
  static NotificationData(queryParams: ticketNotificationsReq) {
    return request<any, ApiResponse>({
      url: "/api/v1/ticket/notice/me",
      method: "get",
      params: queryParams,
    });
  }
  // 删除工单通知表
  static NoticeDelData(ids: number[]) {
    return request<any, TicketsRes>({
      url: `/api/v1/ticket/notice/${ids}`,
      method: "delete",
      data: { ids },
    });
  }
  // 已读
  static readNotice(id: number) {
    return request<any, TicketsRes>({
      url: `/api/v1/ticket/notice/${id}/read`,
      method: "put",
    });
  }
  // 我的通知未读总数
  static getMeCount() {
    return request<any, number>({
      url: "/api/v1/ticket/notice/meCount",
      method: "get",
    });
  }
  // 删除工单通知表
  static DelNotice() {
    return request({
      url: `/api/v1/ticket/notice/del`,
      method: "delete",
    });
  }
}

export default TicketsAPI;
