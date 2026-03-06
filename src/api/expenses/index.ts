import request from "@/utils/request";
import { BasePageQuery, add, FileUploadResponse } from "./model";

class ExpensesAPI {
  // 分页列表
  static expensePage(data: BasePageQuery) {
    return request({
      url: "/api/v1/expenseManagements/page",
      method: "get",
      params: data,
    });
  }
  // 新增
  static addExpense(data: add) {
    return request({
      url: "/api/v1/expenseManagements",
      method: "post",
      data: data,
    });
  }
  // 表单数据  (详情)
  static detailsExpense(id: number) {
    return request({
      url: `/api/v1/expenseManagements/${id}/form`,
      method: "get",
    });
  }
  // 删除
  static delExpense(ids: number) {
    return request({
      url: `/api/v1/expenseManagements/${ids}`,
      method: "delete",
    });
  }
  // 修改
  static updExpense(id: number, data: add) {
    return request({
      url: `/api/v1/expenseManagements/${id}`,
      method: "put",
      data: data,
    });
  }
  // 上传附件
  static fileOss(formData: any) {
    return request<any, FileUploadResponse>({
      url: "/api/v1/expenseManagements/upload",
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData, // 将 FormData 作为请求体传递
    });
  }
  // 删除附件
  static fileDelete(fileList: string, id: number) {
    return request({
      url: "/api/v1/expenseManagements/delOss",
      method: "post",
      data: {
        fileList: fileList,
        id: id,
      },
    });
  }
  // 当前年份按月统计
  static monthStatistics() {
    return request({
      url: "/api/v1/expenseManagements/monthly",
      method: "get",
    });
  }
  // 按年统计
  static annualStatistics() {
    return request({
      url: "/api/v1/expenseManagements/yearly",
      method: "get",
    });
  }
  // 当前年按季度统计
  static quarterStatistics() {
    return request({
      url: "/api/v1/expenseManagements/quarterly",
      method: "get",
    });
  }
  // 各支付方式总额统计（半年统计一次）
  static classifyStatistics(halfYear: number) {
    return request({
      url: "/api/v1/expenseManagements/halfYearlyByType",
      method: "get",
      params: {
        halfYear: halfYear,
      },
    });
  }
}

export default ExpensesAPI;
