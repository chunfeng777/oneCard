import request from "@/utils/request";
import {
  EmpForm,
  EmpPageVO,
  EmpQuery,
  Position,
  BindEmployeeResponse,
  unBindEmployeeResponse,
} from "./model";

class EmpAPI {
  /**
   * 获取员工分页信息
   *
   * @param queryParams
   */
  static getPage(queryParams: EmpQuery) {
    return request<any, PageResult<EmpPageVO[]>>({
      url: "/api/v1/employees/page",
      method: "get",
      params: queryParams,
    });
  }
  /**
   * 根据部门ID获取职位信息
   *
   */
  static getPositionsByDeptId(deptId: number | undefined) {
    return request<any, Position[]>({
      url: `/api/v1/positions/${deptId}`,
      method: "get",
    });
  }
  // 绑定用户
  // static handleBindUser(employeesId: number, userId: number) {
  //   return request<any, BindEmployeeResponse[]>({
  //     url: `/api/v1/employees/${employeesId}/bind`,
  //     method: "PATCH",
  //     params: { userId },
  //   });
  // }
  // 解除绑定
  // static handleUnBindUser(employeesId: number) {
  //   return request<any, unBindEmployeeResponse[]>({
  //     url: `/api/v1/employees/${employeesId}/unbind`,
  //     method: "PATCH",
  //   });
  // }
  // static getPositionsByDeptId(deptId: number) {
  //   return request<any, OptionType[]>({
  //     url: `/api/v1/positions/${deptId}`,
  //     method: "get",
  //   });
  // }
  /**
   * 获取员工表单详情
   *
   * @param empId
   */
  static getFormData(empId: number) {
    return request<any, EmpForm>({
      url: "/api/v1/employees/" + empId + "/form",
      method: "get",
    });
  }

  /**
   * 添加用户
   *
   * @param data
   */
  static add(data: EmpForm) {
    return request({
      url: "/api/v1/employees",
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
  static update(id: number, data: EmpForm) {
    return request({
      url: "/api/v1/employees/" + id,
      method: "put",
      data: data,
    });
  }

  /**
   * 删除用户
   *
   * @param ids
   */
  static deleteByIds(ids: string) {
    return request({
      url: "/api/v1/employees/" + ids,
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
  static export(queryParams: EmpQuery) {
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

export default EmpAPI;
