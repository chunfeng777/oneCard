<template>
  <div class="app-container card-archive-page">
    <div class="page-heading">
      <div>
        <h2>一卡一档</h2>
        <p>集中维护 PSA 卡片的采购、入库、出售及留痕资料。</p>
      </div>
      <el-button type="primary" @click="openCreateDialog">
        <template #icon><i-ep-plus /></template>
        新增卡片档案
      </el-button>
    </div>

    <!-- 搜索筛选区 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="关键字">
          <el-input
            v-model="query.keywords"
            clearable
            placeholder="搜索证书号/卡名/描述"
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <template #icon><i-ep-search /></template>
            查询
          </el-button>
          <el-button @click="resetQuery">
            <template #icon><i-ep-refresh /></template>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计信息区 -->
    <el-row :gutter="16" class="summary-row">
      <el-col :xs="12" :sm="6">
        <div class="summary-card">
          <span>总记录数</span>
          <strong>{{ total }}</strong>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="summary-card">
          <span>已入库</span>
          <strong>{{ statusCount(1) }}</strong>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="summary-card">
          <span>待入库</span>
          <strong>{{ statusCount(2) }}</strong>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="summary-card">
          <span>已售出</span>
          <strong>{{ statusCount(4) }}</strong>
        </div>
      </el-col>
    </el-row>

    <!-- 数据表格区 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="records"
        row-key="id"
        empty-text="暂无卡片档案"
      >
        <el-table-column label="PSA证书号" prop="psaCertNo" min-width="130" />
        <el-table-column label="卡片信息" min-width="230">
          <template #default="{ row }">
            <div class="card-name">{{ row.cardName || "-" }}</div>
            <div class="muted-text">
              {{ row.cardDesc || "暂无描述" }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="卡面照片" width="110" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.cardFacePhotoUrl"
              class="table-card-photo"
              :src="row.cardFacePhotoUrl"
              :preview-src-list="[row.cardFacePhotoUrl]"
              fit="cover"
              preview-teleported
            />
            <span v-else class="photo-empty">未上传</span>
          </template>
        </el-table-column>
        <el-table-column label="PSA评级" prop="psaGrade" width="100">
          <template #default="{ row }">
            {{ formatPsaGrade(row.psaGrade) }}
          </template>
        </el-table-column>
        <el-table-column label="采购信息" min-width="160">
          <template #default="{ row }">
            <div>{{ formatPurchaseChannel(row.purchaseChannel) }}</div>
            <div class="muted-text">{{ row.purchaseDate || "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column label="成交价" width="120" align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.purchasePrice) }}
          </template>
        </el-table-column>
        <el-table-column label="市场均价" width="120" align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.marketAvgPrice) }}
          </template>
        </el-table-column>
        <el-table-column label="价格比" width="100" align="right">
          <template #default="{ row }">
            {{ formatPriceRatio(row) }}
          </template>
        </el-table-column>
        <el-table-column label="入库状态" width="110">
          <template #default="{ row }">
            <el-tag :type="getInventoryStatusType(row.inventoryStatus)">
              {{ formatInventoryStatus(row.inventoryStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="库龄" width="90" align="right">
          <template #default="{ row }">
            {{ row.inventoryAgeDays ? `${row.inventoryAgeDays}天` : "-" }}
          </template>
        </el-table-column>
        <el-table-column label="盈亏" width="120" align="right">
          <template #default="{ row }">
            <span :class="getProfitClass(row.profitLoss)">
              {{ formatProfit(row.profitLoss) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="190" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">查看</el-button>
            <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控制组件 -->
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="query.pageNum"
          v-model:page-size="query.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 新增 / 编辑 弹窗 -->
    <el-dialog
      v-model="formDialog.visible"
      :title="formDialog.title"
      append-to-body
      destroy-on-close
      width="min(1120px, 94vw)"
      top="4vh"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="125px"
      >
        <section class="form-section">
          <h3>基础信息</h3>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="PSA证书号" prop="psaCertNo">
                <el-input v-model="formData.psaCertNo" placeholder="如 92541237" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="卡名" prop="cardName">
                <el-input
                  v-model="formData.cardName"
                  placeholder="中文名 + 系列/包名"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="卡图描述">
                <el-input
                  v-model="formData.cardDesc"
                  placeholder="如：闪耀命运 HR 皮卡丘 VMAX"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="PSA评级">
                <el-select
                  v-model="formData.psaGrade"
                  clearable
                  placeholder="请选择评级"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in psaGradeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="证书验证">
                <el-input
                  v-model="formData.certVerifyStatus"
                  placeholder="填写 psacard.com/cert 验证结果或链接"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="form-section">
          <h3>采购与入库</h3>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="采购日期">
                <el-date-picker
                  v-model="formData.purchaseDate"
                  type="date"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  placeholder="选择采购日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="采购渠道">
                <el-select
                  v-model="formData.purchaseChannel"
                  clearable
                  placeholder="请选择渠道"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in purchaseChannelOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="来源平台/卡店">
                <el-input
                  v-model="formData.sourceStore"
                  placeholder="具体平台或卡店名称"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="成交价格(¥)">
                <el-input-number
                  v-model="formData.purchasePrice"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="含运费总价"
                  style="width: 100%"
                  @change="syncAmountTier"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="市场均价(¥)">
                <el-input-number
                  v-model="formData.marketAvgPrice"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="至少2个数据源交叉验证"
                  style="width: 100%"
                  @change="calcPriceRatio"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="价格比(%)">
                <el-input-number
                  v-model="formData.priceRatio"
                  :precision="2"
                  :controls="false"
                  placeholder="如 120.5"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="单笔金额分级">
                <el-select
                  v-model="formData.amountTier"
                  clearable
                  placeholder="按金额自动建议，也可调整"
                  style="width: 100%"
                >
                  <el-option label="≤5000" value="≤5000" />
                  <el-option label=">5000" value=">5000" />
                  <el-option label=">20000或跨境" value=">20000或跨境" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="老板确认">
                <el-select
                  v-model="formData.bossConfirmStatus"
                  clearable
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in bossConfirmOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="入库日期">
                <el-date-picker
                  v-model="formData.inboundDate"
                  type="date"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  placeholder="选择入库日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="入库状态">
                <el-select
                  v-model="formData.inventoryStatus"
                  clearable
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in inventoryStatusOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="库龄(天)">
                <el-input v-model="formData.inventoryAgeDays" placeholder="如 15" />
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="form-section">
          <h3>售出信息</h3>
          <el-row :gutter="20">
            <el-col :xs="24" :md="8">
              <el-form-item label="售出日期">
                <el-date-picker
                  v-model="formData.saleDate"
                  type="date"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  placeholder="未售出可留空"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="8">
              <el-form-item label="售出价格(¥)">
                <el-input-number
                  v-model="formData.salePrice"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="实际成交价"
                  style="width: 100%"
                  @change="calcProfitLoss"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="8">
              <el-form-item label="盈亏(¥)">
                <el-input-number
                  v-model="formData.profitLoss"
                  :precision="2"
                  :controls="false"
                  placeholder="自动计算"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="form-section evidence-section">
          <h3>留痕材料</h3>
          <el-alert
            :closable="false"
            type="warning"
            show-icon
            title="开箱录像至少保存1年；证书截图、订单截图、转账记录建议保存1至2年。"
          />
          <el-row :gutter="20">
            <!-- 开箱录像 (支持点击选择或拖入本地文件) -->
            <el-col :span="24">
              <el-form-item label="开箱录像">
                <div class="video-field">
                  <el-upload
                    class="video-uploader"
                    action="#"
                    accept="video/*"
                    drag
                    :auto-upload="false"
                    :show-file-list="false"
                    :on-change="(file) => handleFileUpload(file, 'unboxingVideoUrl')"
                  >
                    <div v-if="formData.unboxingVideoUrl" class="video-preview-wrap">
                      <video
                        class="video-player"
                        :src="formData.unboxingVideoUrl"
                        controls
                        @click.stop
                      />
                      <span class="video-tip">点击或拖拽本地视频文件替换</span>
                    </div>
                    <div v-else class="video-placeholder">
                      <el-icon class="el-icon--upload" style="font-size: 38px; color: var(--el-color-primary); margin-bottom: 8px;">
                        <i-ep-upload-filled />
                      </el-icon>
                      <div class="el-upload__text">
                        将视频文件拖到此处，或 <em>点击选择本地视频</em>
                      </div>
                      <div class="el-upload__tip">
                        支持 MP4、WebM、MOV 等格式，选择或拖入后自动上传至服务器
                      </div>
                    </div>
                  </el-upload>
                  <div v-if="formData.unboxingVideoUrl" class="video-actions">
                    <el-input
                      v-model="formData.unboxingVideoUrl"
                      placeholder="视频链接"
                      style="flex: 1"
                    />
                    <el-button
                      link
                      type="danger"
                      @click="formData.unboxingVideoUrl = ''"
                    >
                      移除视频
                    </el-button>
                  </div>
                </div>
              </el-form-item>
            </el-col>

            <!-- 图片留痕 (支持点击选择或拖入本地文件) -->
            <el-col
              v-for="item in imageEvidenceFields"
              :key="item.key"
              :xs="24"
              :md="12"
            >
              <el-form-item :label="item.label">
                <div class="image-field">
                  <el-upload
                    class="evidence-uploader"
                    action="#"
                    accept="image/*"
                    drag
                    :auto-upload="false"
                    :show-file-list="false"
                    :on-change="(file) => handleFileUpload(file, item.key)"
                  >
                    <div
                      v-if="formData[item.key]"
                      class="evidence-preview"
                    >
                      <el-image
                        :src="formData[item.key]"
                        fit="cover"
                        @click.stop
                      />
                      <span>点击或拖拽更换图片</span>
                    </div>
                    <div v-else class="evidence-placeholder">
                      <el-icon class="el-icon--upload" style="font-size: 28px; color: var(--el-color-primary); margin-bottom: 4px;">
                        <i-ep-upload-filled />
                      </el-icon>
                      <strong>选择或拖入图片</strong>
                      <span>支持 JPG、PNG、WebP，单张不超过10MB</span>
                    </div>
                  </el-upload>
                  <el-button
                    v-if="formData[item.key]"
                    link
                    type="danger"
                    @click="formData[item.key] = ''"
                  >
                    移除图片
                  </el-button>
                </div>
              </el-form-item>
            </el-col>

            <el-col :xs="24" :md="12">
              <el-form-item label="物流单号">
                <el-input
                  v-model="formData.trackingNo"
                  placeholder="快递单号"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="备注">
                <el-input
                  v-model="formData.remark"
                  :rows="3"
                  maxlength="500"
                  placeholder="其他需说明事项"
                  show-word-limit
                  type="textarea"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </section>
      </el-form>

      <template #footer>
        <el-button @click="formDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <!-- 详情 Drawer -->
    <el-drawer
      v-model="detailVisible"
      title="卡片档案详情"
      size="min(680px, 92vw)"
    >
      <template v-if="detailRecord">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="PSA证书号">
            {{ detailRecord.psaCertNo || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="卡名">
            {{ detailRecord.cardName || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="卡图描述">
            {{ detailRecord.cardDesc || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="PSA评级">
            {{ formatPsaGrade(detailRecord.psaGrade) }}
          </el-descriptions-item>
          <el-descriptions-item label="证书验证" :span="2">
            {{ detailRecord.certVerifyStatus || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="采购日期">
            {{ detailRecord.purchaseDate || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="采购渠道">
            {{ formatPurchaseChannel(detailRecord.purchaseChannel) }}
          </el-descriptions-item>
          <el-descriptions-item label="来源平台/卡店" :span="2">
            {{ detailRecord.sourceStore || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="成交价格">
            {{ formatCurrency(detailRecord.purchasePrice) }}
          </el-descriptions-item>
          <el-descriptions-item label="市场均价">
            {{ formatCurrency(detailRecord.marketAvgPrice) }}
          </el-descriptions-item>
          <el-descriptions-item label="价格比">
            {{ formatPriceRatio(detailRecord) }}
          </el-descriptions-item>
          <el-descriptions-item label="单笔金额分级">
            {{ detailRecord.amountTier || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="老板确认">
            {{ formatBossConfirm(detailRecord.bossConfirmStatus) }}
          </el-descriptions-item>
          <el-descriptions-item label="入库状态">
            {{ formatInventoryStatus(detailRecord.inventoryStatus) }}
          </el-descriptions-item>
          <el-descriptions-item label="入库日期">
            {{ detailRecord.inboundDate || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="库龄">
            {{ detailRecord.inventoryAgeDays ? `${detailRecord.inventoryAgeDays}天` : "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="售出日期">
            {{ detailRecord.saleDate || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="售出价格">
            {{ formatCurrency(detailRecord.salePrice) }}
          </el-descriptions-item>
          <el-descriptions-item label="盈亏">
            <span :class="getProfitClass(detailRecord.profitLoss)">
              {{ formatProfit(detailRecord.profitLoss) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="开箱录像" :span="2">
            <div v-if="detailRecord.unboxingVideoUrl" class="detail-video-wrap">
              <video
                class="detail-video-player"
                :src="detailRecord.unboxingVideoUrl"
                controls
              />
            </div>
            <span v-else>未上传</span>
          </el-descriptions-item>
          <el-descriptions-item
            v-for="item in imageEvidenceFields"
            :key="item.key"
            :label="item.label"
            :span="2"
          >
            <el-image
              v-if="detailRecord[item.key]"
              class="detail-evidence-image"
              :src="detailRecord[item.key]"
              :preview-src-list="[detailRecord[item.key]!]"
              fit="contain"
              preview-teleported
            />
            <span v-else>未上传</span>
          </el-descriptions-item>
          <el-descriptions-item label="物流单号" :span="2">
            {{ detailRecord.trackingNo || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            {{ detailRecord.remark || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ detailRecord.createTime || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ detailRecord.updateTime || "-" }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import type { UploadFile } from "element-plus";
import CardInventoryAPI from "@/api/cardInventory";
import type { CardInventoryQuery, CardInventoryPageVO, CardInventoryForm } from "@/api/cardInventory/model";

defineOptions({ name: "CardArchive" });

type ImageEvidenceKey =
  | "certScreenshotUrl"
  | "shellPhotoUrl"
  | "cardFacePhotoUrl"
  | "orderScreenshotUrl"
  | "transferRecordUrl";

// 状态字典列表
const inventoryStatusOptions = [
  { label: "已入库", value: 1, type: "success" },
  { label: "待入库", value: 2, type: "warning" },
  { label: "已退货", value: 3, type: "danger" },
  { label: "已售出", value: 4, type: "info" },
];

const purchaseChannelOptions = [
  { label: "集换社", value: 1 },
  { label: "卡淘", value: 2 },
  { label: "闲鱼", value: 3 },
  { label: "卡店", value: 4 },
];

const bossConfirmOptions = [
  { label: "无需", value: 0 },
  { label: "已确认", value: 1 },
  { label: "已报备", value: 2 },
];

const psaGradeOptions = [
  { label: "PSA 10", value: 10 },
  { label: "PSA 9", value: 9 },
  { label: "PSA 8", value: 8 },
  { label: "PSA 7", value: 7 },
  { label: "其他", value: 0 },
];

const imageEvidenceFields: Array<{
  key: ImageEvidenceKey;
  label: string;
}> = [
  { key: "certScreenshotUrl", label: "证书截图" },
  { key: "shellPhotoUrl", label: "壳体照片" },
  { key: "cardFacePhotoUrl", label: "卡面照片" },
  { key: "orderScreenshotUrl", label: "订单截图" },
  { key: "transferRecordUrl", label: "转账记录" },
];

// 数据列表与加载状态
const loading = ref(false);
const submitting = ref(false);
const records = ref<CardInventoryPageVO[]>([]);
const total = ref(0);

// 查询参数
const query = reactive<CardInventoryQuery>({
  keywords: "",
  pageNum: 1,
  pageSize: 10,
});

// 表单与弹窗
const formRef = ref();
const formDialog = reactive({ visible: false, title: "" });

function getCurrentDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatToIsoDateTime(dateStr?: string) {
  if (!dateStr) return dateStr;
  const trimmed = dateStr.trim();
  if (!trimmed) return "";
  if (trimmed.includes("T")) return trimmed;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T00:00:00`;
  }
  return trimmed;
}

function formatToDateOnly(dateStr?: string) {
  if (!dateStr) return "";
  return dateStr.slice(0, 10);
}

function normalizeFormForSubmit(form: CardInventoryForm): CardInventoryForm {
  const submitData = { ...form };
  if (submitData.purchaseDate) {
    submitData.purchaseDate = formatToIsoDateTime(submitData.purchaseDate);
  }
  if (submitData.inboundDate) {
    submitData.inboundDate = formatToIsoDateTime(submitData.inboundDate);
  }
  if (submitData.saleDate) {
    submitData.saleDate = formatToIsoDateTime(submitData.saleDate);
  }
  return submitData;
}

const createEmptyForm = (): CardInventoryForm => ({
  id: undefined,
  psaCertNo: "",
  cardName: "",
  cardDesc: "",
  psaGrade: undefined,
  certVerifyStatus: "",
  purchaseDate: getCurrentDateString(),
  purchaseChannel: undefined,
  sourceStore: "",
  purchasePrice: undefined,
  marketAvgPrice: undefined,
  priceRatio: undefined,
  amountTier: "",
  bossConfirmStatus: undefined,
  inboundDate: getCurrentDateString(),
  inventoryStatus: undefined,
  inventoryAgeDays: "",
  saleDate: "",
  salePrice: undefined,
  profitLoss: undefined,
  unboxingVideoUrl: "",
  certScreenshotUrl: "",
  shellPhotoUrl: "",
  cardFacePhotoUrl: "",
  orderScreenshotUrl: "",
  transferRecordUrl: "",
  trackingNo: "",
  remark: "",
});

const formData = reactive<CardInventoryForm>(createEmptyForm());
const detailVisible = ref(false);
const detailRecord = ref<CardInventoryForm>();

const formRules = {
  psaCertNo: [{ required: true, message: "请输入PSA证书号", trigger: "blur" }],
  cardName: [{ required: true, message: "请输入卡名", trigger: "blur" }],
};

// 获取列表数据
async function fetchData() {
  loading.value = true;
  try {
    const res: any = await CardInventoryAPI.getPage(query);
    if (res) {
      records.value = res.list || [];
      total.value = res.total || 0;
    }
  } catch (error) {
    console.error("加载一卡一档列表失败", error);
  } finally {
    loading.value = false;
  }
}

function handleQuery() {
  query.pageNum = 1;
  fetchData();
}

function resetQuery() {
  query.keywords = "";
  query.pageNum = 1;
  fetchData();
}

function openCreateDialog() {
  Object.assign(formData, createEmptyForm());
  formDialog.title = "新增卡片档案";
  formDialog.visible = true;
  nextTick(() => formRef.value?.clearValidate());
}

async function openEditDialog(record: CardInventoryPageVO) {
  formDialog.title = "编辑卡片档案";
  formDialog.visible = true;
  nextTick(() => formRef.value?.clearValidate());

  let targetData: CardInventoryForm = { ...record };
  if (record.id) {
    try {
      const res: any = await CardInventoryAPI.getFormData(record.id);
      if (res) targetData = { ...res };
    } catch {
      // fallback
    }
  }

  targetData.purchaseDate = formatToDateOnly(targetData.purchaseDate);
  targetData.inboundDate = formatToDateOnly(targetData.inboundDate);
  targetData.saleDate = formatToDateOnly(targetData.saleDate);

  Object.assign(formData, targetData);
}

async function openDetail(record: CardInventoryPageVO) {
  if (record.id) {
    try {
      const res: any = await CardInventoryAPI.getFormData(record.id);
      detailRecord.value = res || record;
    } catch {
      detailRecord.value = record;
    }
  } else {
    detailRecord.value = record;
  }
  detailVisible.value = true;
}

async function submitForm() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  const payload = normalizeFormForSubmit(formData);
  try {
    if (payload.id) {
      await CardInventoryAPI.update(payload.id, payload);
      ElMessage.success("档案修改成功");
    } else {
      await CardInventoryAPI.add(payload);
      ElMessage.success("档案新增成功");
    }
    formDialog.visible = false;
    fetchData();
  } catch (error) {
    console.error("提交档案失败", error);
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(record: CardInventoryPageVO) {
  if (!record.id) return;
  try {
    await ElMessageBox.confirm(
      `确定删除卡片档案“${record.cardName || record.psaCertNo}”吗？`,
      "删除确认",
      {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    await CardInventoryAPI.deleteByIds(record.id.toString());
    ElMessage.success("档案已删除");
    fetchData();
  } catch {
    // 取消删除
  }
}

// 附件上传处理 (支持视频/图片，自动调用后端接口上传)
async function handleFileUpload(
  uploadFile: UploadFile,
  key: keyof CardInventoryForm
) {
  const file = uploadFile.raw;
  if (!file) return;

  try {
    ElMessage.info("正在上传文件...");
    const url = await CardInventoryAPI.uploadFile(file);
    if (url) {
      (formData as any)[key] = url;
      ElMessage.success("上传成功");
    }
  } catch (error) {
    console.error("文件上传失败", error);
  }
}

// 计算与同步
function syncAmountTier(value?: number) {
  if (value === undefined || value === null) {
    formData.amountTier = "";
  } else if (value > 20000) {
    formData.amountTier = ">20000或跨境";
  } else if (value > 5000) {
    formData.amountTier = ">5000";
  } else {
    formData.amountTier = "≤5000";
  }
  calcPriceRatio();
  calcProfitLoss();
}

function calcPriceRatio() {
  if (formData.purchasePrice && formData.marketAvgPrice) {
    formData.priceRatio = Number(
      ((formData.purchasePrice / formData.marketAvgPrice) * 100).toFixed(1)
    );
  }
}

function calcProfitLoss() {
  if (formData.purchasePrice !== undefined && formData.salePrice !== undefined) {
    formData.profitLoss = Number((formData.salePrice - formData.purchasePrice).toFixed(2));
  }
}

// 格式化展示辅助方法
function formatCurrency(value?: number) {
  if (value === undefined || value === null) return "-";
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatPriceRatio(row: CardInventoryPageVO) {
  if (row.priceRatio !== undefined && row.priceRatio !== null) {
    return `${row.priceRatio}%`;
  }
  if (row.purchasePrice && row.marketAvgPrice) {
    return `${((row.purchasePrice / row.marketAvgPrice) * 100).toFixed(1)}%`;
  }
  return "-";
}

function formatProfit(profit?: number) {
  if (profit === undefined || profit === null) return "-";
  const prefix = profit > 0 ? "+" : "";
  return `${prefix}${formatCurrency(profit)}`;
}

function getProfitClass(profit?: number) {
  if (profit === undefined || profit === null || profit === 0) return "";
  return profit > 0 ? "profit-positive" : "profit-negative";
}

function formatPsaGrade(grade?: number | string) {
  if (grade === undefined || grade === null) return "-";
  if (typeof grade === "number") {
    return grade === 0 ? "其他" : `PSA ${grade}`;
  }
  return grade;
}

function formatPurchaseChannel(channel?: number | string) {
  if (channel === undefined || channel === null) return "-";
  const found = purchaseChannelOptions.find((opt) => opt.value === Number(channel));
  return found ? found.label : String(channel);
}

function formatBossConfirm(status?: number | string) {
  if (status === undefined || status === null) return "-";
  const found = bossConfirmOptions.find((opt) => opt.value === Number(status));
  return found ? found.label : String(status);
}

function formatInventoryStatus(status?: number | string) {
  if (status === undefined || status === null) return "未设置";
  const found = inventoryStatusOptions.find((opt) => opt.value === Number(status));
  return found ? found.label : String(status);
}

function getInventoryStatusType(status?: number | string) {
  const found = inventoryStatusOptions.find((opt) => opt.value === Number(status));
  return found ? (found.type as "success" | "warning" | "danger" | "info") : "info";
}

function statusCount(statusVal: number) {
  return records.value.filter((r) => Number(r.inventoryStatus) === statusVal).length;
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="scss">
.card-archive-page {
  .page-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    h2 {
      margin: 0 0 6px;
      font-size: 22px;
      color: var(--el-text-color-primary);
    }

    p {
      margin: 0;
      color: var(--el-text-color-secondary);
    }
  }

  .search-card {
    margin-bottom: 16px;

    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }

  .summary-row {
    margin-bottom: 16px;
  }

  .summary-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 18px 20px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;

    span {
      color: var(--el-text-color-secondary);
    }

    strong {
      font-size: 26px;
      color: var(--el-color-primary);
    }
  }

  .card-name {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .muted-text {
    margin-top: 4px;
    overflow: hidden;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .table-card-photo {
    width: 54px;
    height: 68px;
    cursor: zoom-in;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
  }

  .photo-empty {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }

  .profit-positive {
    color: var(--el-color-success);
  }

  .profit-negative {
    color: var(--el-color-danger);
  }

  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}

.form-section {
  padding: 0 4px 8px;

  & + & {
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  h3 {
    margin: 0 0 18px;
    font-size: 16px;
    color: var(--el-text-color-primary);
  }
}

.evidence-section :deep(.el-alert) {
  margin-bottom: 20px;
}

/* 视频拖拽上传区样式 */
.video-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.video-uploader {
  width: 100%;

  :deep(.el-upload) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 16px;
    background: var(--el-fill-color-lighter);
    border: 1px dashed var(--el-border-color);
    border-radius: 8px;

    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.video-preview-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  .video-player {
    width: 100%;
    max-height: 240px;
    background: #000;
    border-radius: 6px;
  }

  .video-tip {
    margin-top: 6px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 0;

  .el-upload__text {
    font-size: 14px;
    color: var(--el-text-color-regular);

    em {
      font-style: normal;
      color: var(--el-color-primary);
    }
  }

  .el-upload__tip {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.video-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 图片拖拽上传区样式 */
.image-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.evidence-uploader {
  width: 100%;

  :deep(.el-upload) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 160px;
    padding: 0;
    background: var(--el-fill-color-lighter);
    border: 1px dashed var(--el-border-color);
    border-radius: 8px;

    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.evidence-placeholder {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--el-text-color-secondary);

  strong {
    font-size: 13px;
    color: var(--el-color-primary);
  }

  span {
    font-size: 12px;
  }
}

.evidence-preview {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  border-radius: 8px;

  .el-image {
    width: 100%;
    height: 100%;
  }

  span {
    position: absolute;
    right: 8px;
    bottom: 8px;
    padding: 4px 8px;
    font-size: 12px;
    color: #fff;
    background: rgb(0 0 0 / 60%);
    border-radius: 4px;
  }
}

.detail-evidence-image {
  width: 240px;
  max-width: 100%;
  height: 180px;
  cursor: zoom-in;
  border-radius: 6px;
}

.detail-video-wrap {
  width: 100%;
  max-width: 480px;

  .detail-video-player {
    width: 100%;
    max-height: 260px;
    background: #000;
    border-radius: 6px;
  }
}

@media (width <= 767px) {
  .card-archive-page {
    .page-heading {
      flex-direction: column;
      gap: 14px;
      align-items: flex-start;
    }

    .search-card :deep(.el-form-item) {
      display: flex;
      margin-bottom: 14px;
    }

    .summary-card {
      margin-bottom: 12px;
    }
  }
}
</style>
