/**
 * 员工查询对象类型
 */
export interface PositionsQuery extends PageQuery {
  keywords?: string;
  status?: number;
  deptId?: number;
}

/**
 * 用户分页对象
 */
export interface PositionsPageVO {
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 更新时间
   */
  updateTime?: Date;
  /**
   * 显示顺序
   */
  sort?: number;
  /**
   * 职位状态(1:启用;0:禁用)
   */
  status?: number;
  /**
   * 职位名称
   */
  name?: string;
  /**
   * 部门名称
   */
  deptName?: string;
  /**
   * 职位ID
   */
  id?: number;
}

/**
 * 员工表单类型
 */

export interface PositionsForm {
  /**
   * 员工ID
   */
  id?: number;
  /**
   * 职位名
   */
  name?: string;
  /**
   * 部门ID
   */
  deptId?: number;
  /**
   * 职位状态(1:启用;0:禁用)
   */
  status?: number;
  /**
   * 显示顺序
   */
  sort?: number;
}
