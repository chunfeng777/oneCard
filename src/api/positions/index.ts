import request from "@/utils/request";
import { PositionsForm, PositionsPageVO, PositionsQuery } from "./model";

class PositionsAPI {
  /**
   * 获取职位页面信息
   *
   * @param queryParams
   */
  static getPage(queryParams: PositionsQuery) {
    return request<any, PageResult<PositionsPageVO[]>>({
      url: "/api/v1/positions/page",
      method: "get",
      params: queryParams,
    });
  }

  /**
   * 获取职位表单详情
   *
   * @param positionsId
   */
  static getFormData(positionsId: number) {
    return request<any, PositionsForm>({
      url: "/api/v1/positions/" + positionsId + "/form",
      method: "get",
    });
  }

  /**
   * 添加用户
   *
   * @param data
   */
  static add(data: PositionsForm) {
    return request({
      url: "/api/v1/positions",
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
  static update(id: number, data: PositionsForm) {
    return request({
      url: "/api/v1/positions/" + id,
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
      url: "/api/v1/positions/" + ids,
      method: "delete",
    });
  }
}

export default PositionsAPI;
