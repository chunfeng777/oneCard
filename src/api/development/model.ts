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
export interface add {
  id?: number;
  requirementName?: string;
  demander?: string;
  demanderName?: string;
  completionTime?: string;
  requirementDescription?: string;
  reason?: string;
  development?: string;
  developmentName?: string;
  requirementModule?: string;
}

export interface FileUploadResponse {
  name: string;
  url: string;
}

export interface auditForm {
  acceptanceResult: string;
  acceptanceStatus: number;
}
