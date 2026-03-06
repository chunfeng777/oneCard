import request from "@/utils/request";
import { BasePageQuery, Customer, AddRecords } from "./model";

class CustomerAPI {
  // 客户分页列表
  static customerPage(data: BasePageQuery) {
    return request({
      url: "/api/v1/customers/page",
      method: "get",
      params: data,
    });
  }
  // 添加客户
  static customerAdd(data: Customer) {
    return request({
      url: "/api/v1/customers",
      method: "post",
      data: data,
    });
  }
  // 修改客户
  static customerEdit(id: number | undefined, customerData: any) {
    return request({
      url: `/api/v1/customers/${id}`,
      method: "put",
      data: customerData,
    });
  }

  // 客户表表单数据 详情
  static customerForm(id: number) {
    return request({
      url: `/api/v1/customers/${id}/form`,
      method: "get",
    });
  }
  // 删除客户到废弃列表
  static logicalDeletion(id: number) {
    return request({
      url: `/api/v1/customers/logicalDeletion/${id}`,
      method: "delete",
      // headers: {
      //   'Content-Type': 'application/x-www-form-urlencoded',
      // },
    });
  }
  // 废弃客户分页列表
  static customerPageDeleted(data: BasePageQuery) {
    return request({
      url: "/api/v1/customers/abandonPage",
      method: "get",
      params: data,
    });
  }
  // 废弃列表移回客户列表
  static customerRecovery(id: number) {
    return request({
      url: `/api/v1/customers/backspace/${id}`,
      method: "delete",
    });
  }
  // 彻底删除客户
  static customerDel(ids: number) {
    return request({
      url: `/api/v1/customers/${ids}`,
      method: "delete",
    });
  }
  // 客户列表导入模板下载
  static customerTemplate() {
    return request({
      url: "/api/v1/customers/template",
      method: "get",
      responseType: "arraybuffer",
    });
  }

  // 客户跟进记录表分页列表
  static getFollowRecords(data: BasePageQuery) {
    return request({
      url: "/api/v1/customerFollowRecords/page",
      method: "get",
      params: data,
    });
  }
  // 新增客户跟进记录
  static AddFollowRecords(data: AddRecords) {
    return request({
      url: "/api/v1/customerFollowRecords",
      method: "post",
      data: data,
    });
  }
  // 客户跟进记录表表单数据 详情 (当前客户跟进记录)
  static getInfoRecords(id: number) {
    return request({
      url: `/api/v1/customerFollowRecords/${id}/form`,
      method: "get",
    });
  }
  // 删除客户跟进记录
  static DelFollowRecords(ids: number) {
    return request({
      url: `/api/v1/customerFollowRecords/${ids}`,
      method: "delete",
    });
  }
  // 修改客户跟进记录
  static UpdFollowRecords(id: number | null, data: any) {
    return request({
      url: `/api/v1/customerFollowRecords/${id}`,
      method: "put",
      data: data,
    });
  }
  // 导出客户
  static exportCustmoer(data: BasePageQuery) {
    return request({
      url: "/api/v1/customers/_export",
      method: "get",
      params: data,
      responseType: "arraybuffer",
    });
  }
  // 导入客户
  static importCustmoer(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request({
      url: "/api/v1/customers/_import",
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export default CustomerAPI;
