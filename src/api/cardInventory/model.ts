/**
 * 一卡一档查询参数
 */
export interface CardInventoryQuery extends PageQuery {
  /** 关键字 */
  keywords?: string;
}

/**
 * 一卡一档分页列表项 (PageVO)
 */
export interface CardInventoryPageVO {
  /** id */
  id?: number;
  /** PSA证书 */
  psaCertNo?: string;
  /** 卡片名称 */
  cardName?: string;
  /** 卡图描述 */
  cardDesc?: string;
  /** PSA评级（字典） */
  psaGrade?: number;
  /** 证书验证 */
  certVerifyStatus?: string;
  /** 采购日期 */
  purchaseDate?: string;
  /** 采购渠道(字典) */
  purchaseChannel?: number;
  /** 来源平台名称 */
  sourceStore?: string;
  /** 成交价格（含运费总价） */
  purchasePrice?: number;
  /** 市场均价(¥) */
  marketAvgPrice?: number;
  /** 价格比(%) */
  priceRatio?: number;
  /** 单笔金额分级 */
  amountTier?: string;
  /** 老板确认状态 */
  bossConfirmStatus?: number;
  /** 入库日期 */
  inboundDate?: string;
  /** 入库状态 */
  inventoryStatus?: number;
  /** 库龄（天） */
  inventoryAgeDays?: string;
  /** 售出日期 */
  saleDate?: string;
  /** 售出价格(¥) */
  salePrice?: number;
  /** 盈亏(¥) */
  profitLoss?: number;
  /** 开箱录像 */
  unboxingVideoUrl?: string;
  /** 证书截图 */
  certScreenshotUrl?: string;
  /** 壳体照片 */
  shellPhotoUrl?: string;
  /** 卡面照片 */
  cardFacePhotoUrl?: string;
  /** 订单截图 */
  orderScreenshotUrl?: string;
  /** 转账记录 */
  transferRecordUrl?: string;
  /** 快递单号 */
  trackingNo?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
}

/**
 * 一卡一档表单对象
 */
export interface CardInventoryForm {
  /** id */
  id?: number;
  /** PSA证书 */
  psaCertNo?: string;
  /** 卡片名称 */
  cardName?: string;
  /** 卡图描述 */
  cardDesc?: string;
  /** PSA评级（字典） */
  psaGrade?: number;
  /** 证书验证 */
  certVerifyStatus?: string;
  /** 采购日期 */
  purchaseDate?: string;
  /** 采购渠道(字典) */
  purchaseChannel?: number;
  /** 来源平台名称 */
  sourceStore?: string;
  /** 成交价格（含运费总价） */
  purchasePrice?: number;
  /** 市场均价(¥) */
  marketAvgPrice?: number;
  /** 价格比(%) */
  priceRatio?: number;
  /** 单笔金额分级 */
  amountTier?: string;
  /** 老板确认状态 */
  bossConfirmStatus?: number;
  /** 入库日期 */
  inboundDate?: string;
  /** 入库状态 */
  inventoryStatus?: number;
  /** 库龄（天） */
  inventoryAgeDays?: string;
  /** 售出日期 */
  saleDate?: string;
  /** 售出价格(¥) */
  salePrice?: number;
  /** 盈亏(¥) */
  profitLoss?: number;
  /** 开箱录像 */
  unboxingVideoUrl?: string;
  /** 证书截图 */
  certScreenshotUrl?: string;
  /** 壳体照片 */
  shellPhotoUrl?: string;
  /** 卡面照片 */
  cardFacePhotoUrl?: string;
  /** 订单截图 */
  orderScreenshotUrl?: string;
  /** 转账记录 */
  transferRecordUrl?: string;
  /** 快递单号 */
  trackingNo?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
}
