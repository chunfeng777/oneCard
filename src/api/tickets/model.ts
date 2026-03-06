// 创建工单请求参数
export interface TicketsReq {
  title: string;
  description: string;
  type: string;
  deptId: number;
  handlerId?: string;
  priority: string;
}
// 创建工单响应参数
export interface TicketsRes {
  code: string;
  data: Record<string, any>;
  msg: string;
}

// 分配
export interface AssignReq {
  ticketId: number;
  deptId: number;
  assignedToId: string;
  assignmentReason: string;
}
// 工单操作记录详情分页列表
export interface HistoryPageReq {
  ticketId: string;
  pageNum: string;
  pageSize: string;
}
// 工单操作记录详情分页列表响应参数
export interface HistoryPageRes {
  code: string;
  data: {
    list: Array<{
      id: number;
      ticketId: number;
      userId: number;
      action: string;
      actionTime: string;
      remark: string;
    }>;
    total: number;
  };
  msg: string;
}
// 工单分配记录详情响应参数
export interface TicketHistoryIdRes {
  code: string;
  data: {
    id: number;
    ticketId: number;
    assignerId: number;
    assignerName: string;
    assignedToId: number;
    assignedToName: string;
    assignmentTime: string;
    assignmentReason: string;
  };
  msg: string;
}
// 修改工单表
export interface UpdateReq {
  id: number;
  title: string;
  description: string;
  // requesterId: number | string;
  requesterName: string;
  type: number;
  // handlerId: number | string;
  handlerName: string;
  resolution: string;
  status: string;
  priority: string;
  createTime?: string;
  updateTime?: string;
}
// 工单通知表分页列表 请求参数
export interface ticketNotificationsReq {
  type: string | number;
  pageNum: number;
  pageSize: number;
  isRead?: string;
}
// 响应参数
export interface ApiResponse {
  list: NotificationItem[];
  total: number;
}

export interface NotificationItem {
  id: number;
  ticketId: number;
  sendTime: string;
  sendName: string;
  type: string;
  content: string;
  isRead: string;
  isHandled: string;
  showActions: boolean; // 添加 showActions 属性
  title: string; // 添加 title 属性
}
