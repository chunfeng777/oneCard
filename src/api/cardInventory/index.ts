import request from "@/utils/request";
import { CardInventoryQuery, CardInventoryPageVO, CardInventoryForm } from "./model";

class CardInventoryAPI {
  /**
   * 一卡一档分页列表
   *
   * @param queryParams 查询参数
   */
  static getPage(queryParams: CardInventoryQuery) {
    return request<any, PageResult<CardInventoryPageVO[]>>({
      url: "/api/v1/psaCardInventorys/page",
      method: "get",
      params: queryParams,
    });
  }

  /**
   * 一卡一档表单数据（详情）
   *
   * @param id 一卡一档ID
   */
  static getFormData(id: number) {
    return request<any, CardInventoryForm>({
      url: `/api/v1/psaCardInventorys/${id}/form`,
      method: "get",
    });
  }

  /**
   * 新增一卡一档
   *
   * @param data 表单数据
   */
  static add(data: CardInventoryForm) {
    return request({
      url: "/api/v1/psaCardInventorys",
      method: "post",
      data: data,
    });
  }

  /**
   * 修改一卡一档
   *
   * @param id 一卡一档ID
   * @param data 表单数据
   */
  static update(id: number, data: CardInventoryForm) {
    return request({
      url: `/api/v1/psaCardInventorys/${id}`,
      method: "put",
      data: data,
    });
  }

  /**
   * 删除一卡一档
   *
   * @param ids 一卡一档ID，多个以英文逗号(,)分割
   */
  static deleteByIds(ids: string) {
    return request({
      url: `/api/v1/psaCardInventorys/${ids}`,
      method: "delete",
    });
  }

  /**
   * 一卡一档附件上传（图片/视频）
   *
   * @param file 上传的文件对象
   */
  static uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request<any, string>({
      url: "/api/v1/psaCardInventorys/upload",
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * 一卡一档附件批量上传（多图）
   *
   * @param files 上传的文件列表
   */
  static uploadBatch(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    return request<any, string[]>({
      url: "/api/v1/psaCardInventorys/upload/batch",
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export default CardInventoryAPI;
