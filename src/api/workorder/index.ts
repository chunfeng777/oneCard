import request from "@/utils/request";
import { UserForm, UserInfo, TicketPageVO, TicketQuery } from "./model";

class TicketAPI {
  /**
   * 获取用户处理的工单
   *
   * @param queryParams
   */
  static getDispose(queryParams: TicketQuery) {
    return request<any, PageResult<TicketPageVO[]>>({
      url: "/api/v1/tickets/dispose",
      method: "get",
      params: queryParams,
    });
  }
  // 工单详情
  static getDetail(id: number) {
    return request<any, PageResult<TicketPageVO[]>>({
      url: `/api/v1/tickets/${id}/form`,
      method: "get",
    });
  }
  /**
   * 获取用户创建的工单
   *
   * @param queryParams
   */
  static getLaunch(queryParams: TicketQuery) {
    return request<any, PageResult<TicketPageVO[]>>({
      url: "/api/v1/tickets/launch",
      method: "get",
      params: queryParams,
    });
  }

  /**
   * 获取工单列表
   *
   * @param queryParams
   */
  static getPage(queryParams: TicketQuery) {
    return request<any, PageResult<TicketPageVO[]>>({
      url: "/api/v1/tickets/page",
      method: "get",
      params: queryParams,
    });
  }

  // 未完成通知
  static notNotif() {
    return request({
      url: "/api/v1/home/incompleteNotification",
      method: "get",
    });
  }
  // 已完成的通知
  static completNotif() {
    return request({
      url: "/api/v1/home/completedNotification",
      method: "get",
    });
  }
  // 紧急提醒
  static urgentReminder() {
    return request({
      url: "/api/v1/home/urgentReminder",
      method: "get",
    });
  }
  /**
   * 获取用户表单详情
   *
   * @param userId
   */
  static getFormData(userId: number) {
    return request<any, UserForm>({
      url: "/api/v1/users/" + userId + "/form",
      method: "get",
    });
  }

  /**
   * 添加用户
   *
   * @param data
   */
  static add(data: UserForm) {
    return request({
      url: "/api/v1/users",
      method: "post",
      data: data,
    });
  }

  /**
   * 修改用户
   *
   * @param id
   * @param data
   */
  static update(id: number, data: UserForm) {
    return request({
      url: "/api/v1/users/" + id,
      method: "put",
      data: data,
    });
  }

  /**
   * 修改用户密码
   *
   * @param id
   * @param password
   */
  static updatePassword(id: number, password: string) {
    return request({
      url: "/api/v1/users/" + id + "/password",
      method: "patch",
      params: { password: password },
    });
  }

  /**
   * 删除用户
   *
   * @param ids
   */
  static deleteByIds(ids: string) {
    return request({
      url: "/api/v1/users/" + ids,
      method: "delete",
    });
  }

  /**
   * 下载用户导入模板
   *
   * @returns
   */
  static downloadTemplate() {
    return request({
      url: "/api/v1/users/template",
      method: "get",
      responseType: "arraybuffer",
    });
  }

  /**
   * 导出用户
   *
   * @param queryParams
   * @returns
   */
  static export(queryParams: TicketQuery) {
    return request({
      url: "/api/v1/users/export",
      method: "get",
      params: queryParams,
      responseType: "arraybuffer",
    });
  }

  /**
   * 导入用户
   *
   * @param file
   */
  static import(deptId: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request({
      url: "/api/v1/users/import",
      method: "post",
      params: { deptId: deptId },
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export default TicketAPI;
