import request from "@/utils/request";
import { BasePageQuery, add, FileUploadResponse } from "./model";

class InvoiceAPI {
  // 分页列表
  static invoicePage(data: BasePageQuery) {
    return request({
      url: "/api/v1/invoices/page",
      method: "get",
      params: data,
    });
  }
  // 新增
  static addInvoice(data: add) {
    return request({
      url: "/api/v1/invoices",
      method: "post",
      data: data,
    });
  }
  // 表单数据  (详情)
  static detailsInvoice(id: number) {
    return request({
      url: `/api/v1/invoices/${id}/form`,
      method: "get",
    });
  }
  // 删除
  static delInvoice(ids: number) {
    return request({
      url: `/api/v1/invoices/${ids}`,
      method: "delete",
    });
  }
  // 修改
  static updInvoice(id: number, data: add) {
    return request({
      url: `/api/v1/invoices/${id}`,
      method: "put",
      data: data,
    });
  }
  // 上传附件
  static fileOss(formData: any) {
    return request<any, FileUploadResponse>({
      url: "/api/v1/invoices/upload",
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
      url: "/api/v1/invoices/delOss",
      method: "post",
      data: {
        url: url,
        id: id,
      },
    });
  }
}

export default InvoiceAPI;
