//查询所有表单分组响应参数
export interface Item {
  formName: string;
  icon: string;
  isStop: boolean;
  remark: string;
  sort: number;
  background: string;
  updated: string;
  templateId: string;
}

export interface Group {
  id: number;
  group_name: string;
  items: Item[];
}

export interface ApiResponse {
  code: string;
  data: Group[];
  msg: string;
}

export interface OrgRes {
  code: string;
  data: Record<string, any>;
  msg: string;
}
// 创建表单以及流程
export interface FormPerms {
  id: string;
  key: string;
  perm: string;
}

export interface Dept {
  id: string;
  name: string;
  type: string;
  avatar: string;
}

export interface AssignedUser {
  id: string;
  type: string;
}

export interface AssignDept {
  dept: Dept[];
  type: string;
}

export interface Condition {
  group: string;
  symbol: string;
  name: string[];
  type: string;
  valueType: string;
  compare: string;
  compareVal: any[];
}

export interface Groups {
  logic: boolean;
  conditions: Condition[];
}

export interface Props {
  mode: string;
  ruleType: string;
  type: string;
  formPerms: FormPerms[];
  taskMode: string;
  needSign: boolean;
  assignedUser: AssignedUser[];
  assignDept: AssignDept;
  branch: Record<string, unknown>[];
  logic: boolean;
  groups: Groups[];
  rootSelect: {
    multiple: boolean;
  };
  noUserHandler: {
    type: string;
    assigned: AssignedUser[];
  };
  sameRoot: {
    type: string;
    assigned: AssignedUser[];
  };
  timeLimit: {
    enable: boolean;
    time: number;
    timeUnit: string;
    type: string;
  };
}

export interface Process {
  id: string;
  type: string;
  name: string;
  parentId: string;
  props: Props;
  branch: Record<string, unknown>[];
}

export interface Form {
  formId: string;
  name: string;
  groupId: number;
  icon: string;
  formConf: string;
  process: Process[];
  remark: string;
}
// 表单分组排序
export interface SortGroup {
  id: number;
  group_name: string;
  items: {
    formName: string;
    icon: string;
    isStop: boolean;
    remark: string;
    sort?: Record<string, unknown>;
    updated: string;
    templateId: string;
  }[];
}

export interface Component {
  name: string;
  type: string;
  icon: string;
  props: Record<string, any>;
  key: string;
  id: string;
}

export interface FormConfig {
  conf: {
    labelPosition: string;
    labelWidth: number;
    size: string;
  };
  components: Component[];
}

export interface AssignedUser {
  id: string;
  type: string;
  name: string;
  avatar: string;
}

export interface Dept {
  id: string;
  type: string;
  name: string;
  avatar: string;
}

export interface Condition {
  group: string;
  symbol: string;
  name: string[];
  type: string;
  valueType: string;
  compare: string;
  compareVal: any[];
}

export interface Group {
  logic: boolean;
  conditions: Condition[];
}

export interface ProcessProps {
  ruleType: string;
  assignedUser: AssignedUser[];
  type: string;
  assignDept: {
    dept: Dept[];
    type: string;
  };
  branch: Record<string, any>[];
  groups: Group[];
  rootSelect: {
    multiple: boolean;
  };
  logic: boolean;
}

export interface Process {
  id: string;
  type: string;
  name: string;
  props: Props;
  branch: Record<string, unknown>[];
}

export interface Group {
  templateId: string;
  templateName: string;
  formConfig: FormConfig;
  remark: string;
  processDefinitionId: string;
  process: Process[];
}

export interface resp {
  code: string;
  data: Group[];
  msg: string;
}

export interface BasePageQuery {
  pageNum: number;
  pageSize: number;
}
// 流程实例详情
export interface processQuery {
  processInstanceId: string;
  taskId: string;
  nodeId: string;
}
// 上传文件初始化，获取文件预签名
export interface file {
  fileMd5: string;
  fullFileName: string;
  fileSize: number;
  isPrivate: Boolean;
}
// 同意按钮 撤销按钮 拒绝-驳回按钮 评论按钮
export interface Attachment {
  fileKey: string;
  name: string;
  url: string;
  isImage: boolean;
  size: number;
}

export interface TaskRequest {
  taskId: string;
  processInstanceId: string;
  attachments: Attachment[];
  comments: string;
}

// 开始流程
export interface FormDataItem {
  id: string;
  value: Record<string, any>;
}

export interface User {
  id: string;
  type: string;
  name: string;
  avatar: string;
}

export interface ProcessUser {
  nodeId: string;
  assignedUsers: User[];
}

export interface reqData {
  processDefinitionId: string;
  formData: FormDataItem[];
  processUsers: ProcessUser[];
}

export interface FileUploadResponse {
  name: string;
  url: string;
}
