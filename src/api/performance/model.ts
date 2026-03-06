export interface BasePageQuery {
  pageNum: number;
  pageSize: number;
}

// 定义主接口
export interface add {
  id?: number;
  /*被考核人员 */
  userId?: string;

  /*被考核人员名称 */
  userName?: string;

  /*部门 */
  deptId?: string;

  /*部门名称 */
  deptName?: string;

  /*职位名称 */
  positionName?: string;

  /*考核期间 */
  assessmentDate?: string;

  /*总分 */
  totalScore?: string;

  /*考核内容 */
  assessmentText?: string;

  /*达成率 */
  achievementRate?: string;

  /*附件名 */
  fileName?: string;

  /*附件地址 */
  fileUrl?: string;
  execution?: string;
  team?: string;
  professionalism?: string;
  analyse?: string;
}

export interface FileUploadResponse {
  name: string;
  url: string;
}
