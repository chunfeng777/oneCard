import request from "@/utils/request";
import { BasePageQuery } from "./model";

class StatementsAPI {
  // 分页列表
  static getStatementsFiles(params: BasePageQuery) {
    return request({
      url: "/api/v1/financeStatementsFiles/page",
      method: "get",
      params: params,
    });
  }
  // 上传文件Oss
  static fileOss(formData: any) {
    return request({
      url: "/api/v1/financeStatementsFiles/upload",
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData, // 将 FormData 作为请求体传递
    });
  }
  // 文件删除
  static statementsFilesDelete(ids: string) {
    return request({
      url: `/api/v1/financeStatementsFiles/${ids}`,
      method: "delete",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }
}

export default StatementsAPI;
