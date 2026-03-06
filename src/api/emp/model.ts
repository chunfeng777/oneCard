/**
 * 员工查询对象类型
 */
export interface EmpQuery extends PageQuery {
  keywords?: string;
  status?: number;
  deptId?: number;
  startTime?: string;
  endTime?: string;
}

/**
 * 用户分页对象
 */
export interface EmpPageVO {
  /**
   * 用户头像地址
   */
  avatar?: string;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 部门名称
   */
  deptName?: string;
  /**
   * 用户邮箱
   */
  email?: string;
  /**
   * 性别
   */
  genderLabel?: string;
  /**
   * 用户ID
   */
  id?: number;
  /**
   * 手机号
   */
  mobile?: string;
  /**
   * 用户昵称
   */
  nickname?: string;
  /**
   * 角色名称，多个使用英文逗号(,)分割
   */
  roleNames?: string;
  /**
   * 用户状态(1:启用;0:禁用)
   */
  status?: number;
  /**
   * 用户名
   */
  username?: string;
}

// 根据部门ID获取职位信息
export interface Position {
  id: number;
  name: string;
  deptId: number;
  description: string;
  status: string;
  sort: number;
}
// export interface OptionType {
//   id: number;
//   name: string;
// }
/**
 * 员工表单类型
 */
export interface BindEmployeeRequestParams {
  employeesId: number;
  userId: number;
}

export interface BindEmployeeResponse {
  code: string;
  data: Record<string, any>;
  msg: string;
}
export interface unBindEmployeeResponse {
  code: string;
  data: Record<string, any>;
  msg: string;
}

export interface EmpForm {
  /**
   * 员工编号
   */
  employeeNum?: number;
  /**
   * 员工学历
   */
  educationLevel?: string;
  /**
   * 员工身份证地址
   */
  idCardAddress?: string;
  /**
   * 员工转正日期
   */
  confirmationDate?: string;
  /**
   * 合同到期日期
   */
  contractEndDate?: string;
  /**
   * 员工ID
   */
  id?: number;
  /**
   * 员工名
   */
  name?: string;
  /**
   * 性别
   */
  gender?: number;
  /**
   * 员工手机
   */
  phone?: string;
  /**
   * 邮箱
   */
  email?: string;
  /**
   * 出生日期
   */
  birthDate?: string;
  /**
   * 入职日期
   */
  hireDate?: string;
  /**
   * 部门ID
   */
  deptId?: number;
  /**
   * 用户ID
   */
  userId?: number;
  /**
   * 员工职位
   */
  positionId?: number;
  /**
   * 员工地址
   */
  address?: string;
  /**
   * 银行卡号
   */
  bankCardNumber?: string;
  /**
   * 发卡银行
   */
  bankName?: string;
  /**
   * 社保号码
   */
  socialInsuranceNumber?: string;
  /**
   * 身份证号码
   */
  idNumber?: string;
  /**
   * 紧急联系人信息
   */
  emergencyContact?: string;
  /**
   * 紧急联系人电话
   */
  emergencyContactPhone?: string;

  /**
   * 员工健康状况
   */
  healthStatus?: string;
  /**
   * 员工离职日期
   */
  terminationDate?: string;
  /**
   * 员工状态(1:在职;0:离职)
   */
  status?: number;
  /**
   * 员工离职原因
   */
  terminationReason?: string;
  /**
   * 性别
   */
  genderLabel?: string;
  /**
   * 部门名称
   */
  deptName?: string;
  // 职位名称
  positionName?: string;
}
