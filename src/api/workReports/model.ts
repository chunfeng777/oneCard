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

// 定义新增接口请求参数
export interface Report {
  id?: number;
  // realName?: string;
  deptId?: string;
  // deptName?: string;
  reportCycle?: string;
  dayWorkReport?: string;
  progressAchievements?: string;
  issuesChallenges?: string;
  solutionsSuggestions?: string;
  nextPlan?: string;
}

export interface FileUploadResponse {
  name: string;
  url: string;
}
