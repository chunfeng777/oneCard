/**
 * 登录用户信息
 */
export interface UserInfo {
  userId?: number;
  username?: string;
  nickname?: string;
  avatar?: string;
  roles: string[];
  perms: string[];
}

/**
 * 用户查询对象类型
 */
export interface TicketQuery extends PageQuery {
  keywords?: string;
  status?: number;
  deptId?: number;
  startTime?: string;
  endTime?: string;
  priority?: string;
  type?: string;
}

/**
 * 用户分页对象
 */
export interface TicketPageVO {
  item: globalThis.Ref<OptionType[] | undefined>;
  /**
   * 工单ID
   */
  id?: number;
  /**
   * 发起人
   */
  requesterName?: string;
  requesterId: number;
  handlerId: number;
  /**
   * 处理部门名
   */
  deptName?: string;
  /**
   * 处理人
   */
  handlerName?: string;
  /**
   * 工单标题
   */
  title?: string;
  /**
   * 工单描述
   */
  description?: string;
  /**
   * 解决方案记录
   */
  resolution?: string;
  /**
   * 工单状态(1.创建，2.分配，3.接单，4.处理，5.完成)
   */
  status?: number;
  /**
   * 工单类型（1.常规、2技术、3人事、4其他）
   */
  type?: number;
  /**
   * 工单优先级(1.低，2.中，3.高，4.紧急)
   */
  priority?: string;
  /**
   * 角色名称，多个使用英文逗号(,)分割
   */
  roleNames?: string;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 更新时间
   */
  updateTime?: Date;

  statusList?: OptionType[];
  typeList?: OptionType[];
  priorityList?: OptionType[];
  FileTypeList?: OptionType[];
}

/**
 * 用户表单类型
 */
export interface UserForm {
  /**
   * 用户头像
   */
  avatar?: string;
  /**
   * 部门ID
   */
  deptId?: number;
  /**
   * 邮箱
   */
  email?: string;
  /**
   * 性别
   */
  gender?: number;
  /**
   * 用户ID
   */
  id?: number;
  mobile?: string;
  /**
   * 昵称
   */
  nickname?: string;
  /**
   * 角色ID集合
   */
  roleIds?: number[];
  /**
   * 用户状态(1:正常;0:禁用)
   */
  status?: number;
  /**
   * 用户名
   */
  username?: string;
}
