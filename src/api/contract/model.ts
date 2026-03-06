export interface BasePageQuery {
  pageNum: number;
  pageSize: number;
}

// 定义主接口
export interface add {
  id?: number;
  paymentCustomerCompanyName?: string;
  handlingFee?: string;
  processStatus?: string;
  paymentArrivalDate?: string;
  bankPaymentAmount?: string;
  receivingBankName?: string;
  customerAbbreviation?: string;
  receivingCurrency?: string;
  customerRemittanceAmount?: string;
  companyContractNumber?: string;
  currentPaymentAmount?: string;
  transactionCompletionTime?: string;
  natureOfPayment?: string;
  countryChineseName?: string;
  payee?: string;
}

export interface FileUploadResponse {
  name: string;
  url: string;
}
