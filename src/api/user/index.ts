import request from "@/utils/request";
import {
  UserForm,
  UserInfo,
  UserPageVO,
  UserQuery,
  personalInfo,
  file,
  UserListResponse,
  Dept,
} from "./model";

class UserAPI {
  /**
   * 登录成功后获取用户信息（昵称、头像、权限集合和角色集合）
   */
  static getInfo() {
    return request<any, UserInfo>({
      url: "/api/v1/users/me",
      method: "get",
    });
  }

  /**
   * 获取用户分页列表
   *
   * @param queryParams
   */
  static getPage(queryParams: UserQuery) {
    return request<any, PageResult<UserPageVO[]>>({
      url: "/api/v1/users/page",
      method: "get",
      params: queryParams,
    });
  }

  // 用户分页数据（普通员工专用）
  static userOptions(queryParams: UserQuery) {
    return request<any, PageResult<UserPageVO[]>>({
      url: "/api/v1/commonality/userOptions",
      method: "get",
      params: queryParams,
    });
  }
  // 根据部门查询用户
  static getUserByDept(deptId: number) {
    return request({
      url: "/api/v1/commonality/getDeptIdToUser",
      method: "get",
      params: { deptId: deptId },
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
  // 个人中心用户表单数据
  static getPersonalCenter(userId: number) {
    return request<any, UserForm>({
      url: "/api/v1/personalCenter/" + userId + "/form",
      method: "get",
    });
  }
  // 个人中心修改用户信息
  static updateProfile(id: number, data: UserForm) {
    return request({
      url: "/api/v1/personalCenter/" + id,
      method: "put",
      data: data,
    });
  }
  // 上传头像
  static uploadAvatar(formData: FormData) {
    return request({
      url: "/api/v1/personalCenter/upload",
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data", // 添加请求头
      },
      data: formData,
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

  // 个人中心修改用户密码
  static personalPassword(userId: number, data: personalInfo) {
    return request({
      url: `/api/v1/personalCenter/${userId}/personalPassword`,
      method: "patch",
      params: data,
    });
  }

  // 个人中心上传头像初始化，获取头像预签名
  static uploadInit(data: file) {
    return request({
      url: "/api/v1/personalCenter/process/upload/init",
      method: "post",
      data: data,
    });
  }
  // 个人中心上传头像完成，同步数据库
  static uploadComplete(fileKey: string) {
    return request({
      url: `/api/v1/personalCenter/process/upload/complete/${fileKey}`,
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
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
  static export(queryParams: UserQuery) {
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

  // 获取全部员工列表

  static getUserList() {
    return request<any, UserListResponse>({
      url: "/api/v1/commonality/getAllUser",
      method: "get",
    });
  }

  // 查询所有部门及其下的人员
  static getAllDeptWithUsers() {
    return request<any, Dept[]>({
      url: "/api/v1/commonality/getAllDeptWithUsers",
      method: "get",
    });
  }
}

export default UserAPI;
