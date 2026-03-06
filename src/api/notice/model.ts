export interface BasePageQuery {
  pageNum: number;
  pageSize: number;
}

export interface addReqData {
  id: number | undefined;
  title: string | undefined;
  type: string;
  status: string;
  createBy?: number;
  createTime?: string;
  updateTime?: string;
  content: string;
  createName?: string;
}

export interface NoticeResponse {
  list: {
    noticeId: number;
    isRead: number;
    title: string;
    type: number;
    createTime: string;
    updateTime: string | null;
  }[];
  total: number;
}

export interface NoticesData {
  keywords?: string;
  status?: string;
  type?: string;
  userId?: string;
  pageNum?: string;
  pageSize?: string;
}
