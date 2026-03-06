export interface BasePageQuery {
  pageNum: number;
  pageSize: number;
}

// 定义主接口
export interface Daily {
  id?: number;
  realName?: string;
  positionName?: string;
  workObjective?: string;
  workContent?: string;
  workSummary?: string;
  startTime?: string;
  plannedEndTime?: string;
  status?: number; // 0 表示未完成，1 表示已完成
  deadlineTime?: string;
  remark?: string;
  createTime?: string;
  updateTime?: string;
  createBy?: number;
}

export interface FileUploadResponse {
  name: string;
  url: string;
}

export interface DailyData {
  id: number;
  realName: string;
  positionName: string;
  deptId: number;
  deptName: string;
  number: string;
  workObjective: string | null;
  workContent: string | null;
  workSummary: string;
  startTime: string;
  plannedEndTime: string | null;
  status: string | null;
  deadlineTime: string | null;
  remark: string;
  createBy: number;
  createTime: string;
  updateTime: string;
  reportDailyBS: Array<{
    id: number;
    dailyId: number;
    workObjective: string;
    workContent: string;
    plannedEndTime: string;
    status: number;
    deadlineTime: string | null;
    remark: string | null;
    createTime: string;
    updateTime: string;
  }>;
  fileName: string;
  fileUrl: string;
  reviewStatus: number;
  reviewOpinion: string | null;
}
