import request from "@/utils/request";
import { BasePageQuery, Meeting } from "./model";

class MeetingAPI {
  // 会议记录分页列表
  static meetingPage(data: BasePageQuery) {
    return request({
      url: "/api/v1/meetingRecordss/page",
      method: "get",
      params: data,
    });
  }
  // 新增会议记录
  static addMeeting(data: Meeting) {
    return request({
      url: "/api/v1/meetingRecordss",
      method: "post",
      data: data,
    });
  }
  // 会议记录表单数据  (详情)
  static detailsMeeting(id: number) {
    return request({
      url: `/api/v1/meetingRecordss/${id}/form`,
      method: "get",
    });
  }
  // 删除会议记录
  static delMeeting(ids: number) {
    return request({
      url: `/api/v1/meetingRecordss/${ids}`,
      method: "delete",
    });
  }
  // 修改会议记录
  static updMeeting(id: number, data: Meeting) {
    return request({
      url: `/api/v1/meetingRecordss/${id}`,
      method: "put",
      data: data,
    });
  }
}

export default MeetingAPI;
