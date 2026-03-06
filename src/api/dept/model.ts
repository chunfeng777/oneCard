/**
 * 部门查询参数
 */
export interface DeptQuery {
  keywords?: string;
  status?: number;
}


export interface Opt {
  id: number; // 部门的唯一标识
  name: string; // 部门名称
  // 其他部门相关属性...
}
/**
 * 部门类型
 */
export interface DeptVO {
  /**
   * 子部门
   */
  children?: DeptVO[];
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 部门ID
   */
  id?: number;
  /**
   * 部门名称
   */
  name?: string;
  /**
   * 父部门ID
   */
  parentId?: number;
  /**
   * 排序
   */
  sort?: number;
  /**
   * 状态(1:启用；0:禁用)
   */
  status?: number;
  /**
   * 修改时间
   */
  updateTime?: Date;
}

/**
 * 部门表单类型
 */
export interface DeptForm {
  /**
   * 部门ID(新增不填)
   */
  id?: number;
  /**
   * 部门名称
   */
  name?: string;
  /**
   * 父部门ID
   */
  parentId: number;
  /**
   * 排序
   */
  sort?: number;
  /**
   * 状态(1:启用；0：禁用)
   */
  status?: number;
  managerId: number | null; // 添加 managerId 属性 部门负责人
}
