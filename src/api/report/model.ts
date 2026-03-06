export interface BasePageQuery {
  pageNum: number;
  pageSize: number;
}

// 定义 reportWeekBList 项的接口
export interface ReportWeekB {
  id?: number;
  weeksId?: number;
  jobContent?: string;
  completeTime?: string;
  dutyPeople?: string;
  isComplete?: number; // 0 表示未完成，1 表示已完成
  createTime?: string;
  updateTime?: string;
  createBy?: number;
}

// 定义主接口
export interface Report {
  id?: number;
  realName?: string;
  positionName?: string;
  reportCycle?: string;
  workSummary?: string;
  unfinishedBusiness?: string;
  nextWeekProject?: string;
  createTime?: string;
  updateTime?: string;
  createBy?: number;
  reportWeekBList: ReportWeekB[]; // 包含多个 reportWeekB 项
}

export interface FileUploadResponse {
  name: string;
  url: string;
}

// 日报周报通知表分页列表 请求参数
export interface reportNotice {
  pageNum?: number;
  pageSize?: number;
  status?: string;
}

export interface reportNoticeResponse {
  list: reportList[];
  total: number;
}

export interface reportList {
  id: number;
  title: string;
  type: number;
  userId: number;
  reportId: number;
  isRead: number;
  reportTime: string;
  createTime: string;
  updateTime: string | null;
}
