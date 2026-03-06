import request from "@/utils/request";
import {
  ApiResponse,
  OrgRes,
  Form,
  SortGroup,
  resp,
  reqData,
  BasePageQuery,
  processQuery,
  file,
  TaskRequest,
  FileUploadResponse,
} from "./model";

class orgAPI {
  // 查询组织架构树
  static getOrgTree(param: any) {
    return request({
      url: "/api/v1/commonality/tree",
      method: "get",
      params: param,
    });
  }

  // 查询系统角色
  static getRole() {
    return request({
      url: "oa/org/tree",
      method: "get",
    });
  }

  // 搜索人员
  static getUserByName(param: any) {
    return request({
      url: "oa/org/tree/user/search",
      method: "get",
      params: param,
    });
  }

  // 搜索人员
  static getUserDepts(userId: any) {
    return request({
      url: `oa/org/user/${userId}/dept`,
      method: "get",
    });
  }
  // 获取分组
  static getGroup() {
    return request<any, ApiResponse>({
      url: "/api/v1/admin/form/group",
      method: "get",
    });
  }
  // 新增分组
  static addGroup(name: string) {
    return request({
      url: "/api/v1/admin/form/group",
      method: "post",
      data: { name },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }
  // 修改分组
  static modefiyGroup(name: string, groupId: number) {
    return request({
      url: "/api/v1/admin/form/group",
      method: "put",
      data: { name, groupId },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }
  // 删除分组
  static deleteGroup(groupId: number) {
    return request({
      url: `/api/v1/admin/form/group/${groupId}`,
      method: "delete",
      data: { groupId },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }
  // 创建表单以及流程
  static createProcess(formData: Form) {
    return request({
      url: "/api/v1/admin/form",
      method: "post",
      data: formData,
    });
  }
  // 编辑表单详情
  static editDetail(formData: Form) {
    return request({
      url: "/api/v1/admin/form/detail",
      method: "put",
      data: formData,
    });
  }
  // 修改表单状态
  static editStatus(templateId: string, isStop: boolean) {
    return request({
      url: `/api/v1/admin/from/${templateId}/status`,
      method: "patch",
      data: { isStop },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }
  // 移动表单
  static moveForm(templateId: string, groupId: number) {
    return request({
      url: `/api/v1/admin/from/${templateId}/move`,
      method: "patch",
      data: { groupId },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }
  // 删除表单
  static deleteForm(templateId: string) {
    return request({
      url: `/api/v1/admin/form/item/${templateId}`,
      method: "delete",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }
  // 表单分组排序
  static sortGroup(data: SortGroup) {
    return request({
      url: "/api/v1/admin/form/group/sort",
      method: "put",
      data: data,
    });
  }

  // 查询表单数据
  static getFormDetail(groupId: string) {
    return request({
      url: `/api/v1/admin/form/detail/${groupId}`,
      method: "get",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  // 查询所有表单分组
  static getFormGroup() {
    return request({
      url: "/api/v1/user/process/group",
      method: "get",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }
  // 通过模板id查看流程信息，流程模板
  static getProcessDetail(templateId: string) {
    return request<any, resp>({
      url: "/api/v1/user/process/detail",
      method: "get",
      params: { templateId },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }
  // 查询我发起的
  static postApplyList(basePageQuery: BasePageQuery) {
    return request({
      url: "/api/v1/user/process/applyList",
      method: "post",
      data: basePageQuery,
    });
  }
  // 查询我抄送的
  static postccList(basePageQuery: BasePageQuery) {
    return request({
      url: "/api/v1/user/process/ccList",
      method: "post",
      data: basePageQuery,
    });
  }
  // 查询我的待办
  static postToDoList(basePageQuery: BasePageQuery) {
    return request({
      url: "/api/v1/user/process/toDoList",
      method: "post",
      data: basePageQuery,
    });
  }
  // 查询我的已处理
  static postDoneList(basePageQuery: BasePageQuery) {
    return request({
      url: "/api/v1/user/process/doneList",
      method: "post",
      data: basePageQuery,
    });
  }
  // 流程实例详情
  static InstanceProcess(data: processQuery) {
    return request({
      url: "/api/v1/user/process/Instance",
      method: "post",
      data: data,
    });
  }
  // 流程模块 上传文件初始化，获取文件预签名
  static fileInit(data: file) {
    return request({
      url: "/api/v1/user/process/upload/init",
      method: "post",
      data: data,
    });
  }
  // 流程模块 上传文件Oss
  static fileUpload(formData: any) {
    return request<any, FileUploadResponse>({
      url: "/api/v1/user/process/upload",
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    });
  }
  // 删除
  static fileDelete(url: string) {
    return request({
      url: "/api/v1/user/delOss",
      method: "post",
      data: {
        url: url,
      },
    });
  }
  // 流程模块 上传文件完成，同步数据库
  static fileComplete(fileKey: string) {
    return request({
      url: `/api/v1/user/process/upload/complete/${fileKey}`,
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }
  // 流程模块 下载文件
  static fileDownload(fileKey: string) {
    return request({
      url: `/api/v1/user/process/download/${fileKey}`,
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }
  // 同意按钮
  static agreeBtn(data: TaskRequest) {
    return request({
      url: "/api/v1/user/process/agree",
      method: "post",
      data: data,
    });
  }
  // 撤销按钮
  static revokeBtn(data: TaskRequest) {
    return request({
      url: "/api/v1/user/process/revoke",
      method: "post",
      data: data,
    });
  }
  // 拒绝-驳回按钮
  static rollbackBtn(data: TaskRequest) {
    return request({
      url: "/api/v1/user/process/rollback",
      method: "post",
      data: data,
    });
  }
  // 评论按钮
  static commentsBtn(data: TaskRequest) {
    return request({
      url: "/api/v1/user/process/comments",
      method: "post",
      data: data,
    });
  }
  // 开始流程
  static startProcess(data: reqData) {
    return request({
      url: "/api/v1/user/process/start",
      method: "post",
      data: data,
    });
  }
  // 财务模块 我发起的
  static getReimbursement(basePageQuery: BasePageQuery) {
    return request({
      url: "/api/v1/user/process/reimbursement",
      method: "post",
      data: basePageQuery,
    });
  }
  // 财务模块 待我处理
  static getFinanceToDoList(basePageQuery: BasePageQuery) {
    return request({
      url: "/api/v1/user/process/financeToDoList",
      method: "post",
      data: basePageQuery,
    });
  }
  // 财务模块 已处理的
  static getFinanceDoneList(basePageQuery: BasePageQuery) {
    return request({
      url: "/api/v1/user/process/financeDoneList",
      method: "post",
      data: basePageQuery,
    });
  }
  // 财务模块 抄送我的
  static getFinanceCcList(basePageQuery: BasePageQuery) {
    return request({
      url: "/api/v1/user/process/financeCcList",
      method: "post",
      data: basePageQuery,
    });
  }
  // 财务模块 重要文件 文件分页
  static getFinanceFiles(params: BasePageQuery) {
    return request({
      url: "/api/v1/financeFiles/page",
      method: "get",
      params: params,
    });
  }
  // 重要文件上传任务初始化
  /* static initFiles(data: file) {
    return request({
      url: "/api/v1/financeFiles/upload/init",
      method: "post",
      data: data,
    });
  }
  // 重要文件上传完成
  static financeComplete(fileKey: string) {
    return request({
      url: `/api/v1/financeFiles/upload/complete/${fileKey}`,
      method: "post",
    });
  }
  // 重要文件下载
  static financeDownload(fileKey: string) {
    return request({
      url: `/api/v1/financeFiles/download/${fileKey}`,
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  } */

  // 重要文件 上传文件Oss
  static fileOss(formData: any) {
    return request({
      url: "/api/v1/financeFiles/upload",
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData, // 将 FormData 作为请求体传递
    });
  }
  // 重要文件删除
  static financeFilesDelete(ids: string) {
    return request({
      url: `/api/v1/financeFiles/${ids}`,
      method: "delete",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }
  // 重要文件校验是否绑定
  static financeFilesCheck() {
    return request({
      url: "/api/v1/financeFiles/validateSecretKey",
      method: "get",
    });
  }
  // 重要获取secretKey(扫码绑定)
  static getSecretKey() {
    return request({
      url: "/api/v1/financeFiles/getSecretKey",
      method: "get",
    });
  }
  // 重要文件校验验证码（输入动态口令）
  static checkCode(data: any) {
    return request({
      url: "/api/v1/financeFiles/validateCode",
      method: "get",
      params: data,
    });
  }
  // 重要文件删除用户绑定MFA
  static deleteMfa() {
    return request({
      url: "/api/v1/financeFiles/deleteSecretKey",
      method: "delete",
    });
  }
}

export default orgAPI;
