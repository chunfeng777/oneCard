export interface BasePageQuery {
  pageNum: number;
  pageSize: number;
}

export interface Meeting {
  id?: number;
  meetingSubject?: string;
  meetingTime?: string;
  hostId?: string | null;
  hostName?: string | null;
  recorderId?: number;
  deptId?: number | null;
  meetingContent?: string;
  nextWork?: string;
  meetingSummary?: string;
  remark?: string;
  createTime?: string;
  updateTime?: string;
  deptName?: string;
  recorderName?: string;
}
