import request from "@/utils/request";
import { BasePageQuery } from "./model";

class AdministrativeAPI {
  // 分页列表
  static getAdministrationFiles(params: BasePageQuery) {
    return request({
      url: "/api/v1/administrationFiles/page",
      method: "get",
      params: params,
    });
  }
  // 上传文件Oss
  static fileOss(formData: any) {
    return request({
      url: "/api/v1/administrationFiles/upload",
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData, // 将 FormData 作为请求体传递
    });
  }
  // 文件删除
  static administrationFilesDelete(ids: string) {
    return request({
      url: `/api/v1/administrationFiles/${ids}`,
      method: "delete",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }
}

export default AdministrativeAPI;
