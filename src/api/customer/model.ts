/**
 * 部门查询参数
 */
export interface DeptQuery {
  keywords?: string;
  status?: number;
}

export interface BasePageQuery {
  pageNum: number;
  pageSize: number;
}

// 新增客户 / 客户分页的返回类型
export interface Customer {
  id?: number;
  customerName: string;
  customerSource: string;
  customerLevel: string;
  industry: string;
  address: string;
  age: string;
  linkSendStatus: number; // 默认为0（否）
  groupJoinStatus: number; // 默认为0（否）
  customerIntroduction: string;
  // conductBusiness: string;
  contactPerson: string;
  phone: string;
  gender: string;
  email: string;
  wechatNumber: string;
  qqNumber: string;
  remark: string;
  // deleted: boolean;
  // createTime: string;
  // updateTime: string;
  // createName: string;
  customerStatus: string;
  customerIntention: string;
}

// 定义 API 响应接口
export interface CustomerList {
  code: string;
  data: {
    list: Customer[];
    total: number;
  };
  msg: string;
}

// 新增客户跟进记录
export interface AddRecords {
  id?: number | null;
  customerId: number | null;
  name: string;
  followWay: string;
  followTime: string;
  communicationContent: string;
  currentStage: string;
  salesLead: string;
  nextFollowTime: string;
  createId: number | null;
  createName: string;
  createTime: string;
  updateTime: string;
}
