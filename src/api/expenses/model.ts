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
  year?: string;
  date?: string;
  expenseContent?: string;
  expenseType?: number;
  unitPrice?: number;
  number?: number;
  currency?: number;
  paymentDate?: string;
  settlementDate?: string;
  totalPrice?: number;
  expense?: number;
  income?: number;
  balance?: number;
  deptId?: number;
  paymentMethod?: number;
  authorizer?: string;
  authorizerName?: string;
  incomeContent?: string;
}

export interface FileUploadResponse {
  name: string;
  url: string;
}
