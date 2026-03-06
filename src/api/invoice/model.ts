export interface BasePageQuery {
  pageNum: number;
  pageSize: number;
}

// 定义主接口
export interface add {
  /*id */
  id?: number;

  /*发票号码 */
  invoiceNumber?: string;

  /*开票日期 */
  invoiceDate?: string;

  /*发票类型 */
  invoiceType?: string;

  /*金额 */
  amount?: string;

  /*税率 */
  taxRate?: string;

  /*税额 */
  taxAmount?: string;

  /*税价合计 */
  totalAmount?: string;

  /*校验重复 0:未重复 1:重复 */
  duplicateCheck?: number;

  /*发票提供人 */
  invoiceProvider?: string;

  /*附件名 */
  fileName?: string;

  /*附件地址 */
  fileUrl?: string;

  /*销售方信息名称 */
  sellerName?: string;

  /*统一社会信用代码/纳税人识别号 */
  sellerTaxCode?: string;
}

export interface FileUploadResponse {
  name: string;
  url: string;
}
