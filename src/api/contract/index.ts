import request from "@/utils/request";
import { BasePageQuery, add, FileUploadResponse } from "./model";

class ContractAPI {
  // 分页列表
  static contractPage(data: BasePageQuery) {
    return request({
      url: "/api/v1/contractPaymentRegistrations/page",
      method: "get",
      params: data,
    });
  }
  // 新增
  static addContract(data: add) {
    return request({
      url: "/api/v1/contractPaymentRegistrations",
      method: "post",
      data: data,
    });
  }
  // 表单数据  (详情)
  static detailsContract(id: number) {
    return request({
      url: `/api/v1/contractPaymentRegistrations/${id}/form`,
      method: "get",
    });
  }
  // 删除
  static delContract(ids: number) {
    return request({
      url: `/api/v1/contractPaymentRegistrations/${ids}`,
      method: "delete",
    });
  }
  // 修改
  static updContract(id: number, data: add) {
    return request({
      url: `/api/v1/contractPaymentRegistrations/${id}`,
      method: "put",
      data: data,
    });
  }
  // 上传附件
  static fileOss(formData: any) {
    return request<any, FileUploadResponse>({
      url: "/api/v1/reportWeeks/upload",
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData, // 将 FormData 作为请求体传递
    });
  }
  // 删除附件
  static fileDelete(url: string, id: number) {
    return request({
      url: "/api/v1/reportWeeks/delOss",
      method: "post",
      data: {
        url: url,
        id: id,
      },
    });
  }
}

export default ContractAPI;
