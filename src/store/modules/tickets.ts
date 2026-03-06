// src/store/ticket.ts
import { ref } from 'vue';
import { TicketPageVO } from "@/api/workorder/model";
const ticketData = ref<PageResult<TicketPageVO[]> | null>(null);
// const ticketData = ref<{ list: TicketPageVO[]; total: number } | null>(null);
// const historyData = ref<{ data: { list: Array<any>, total: number } }>({ data: { list: [], total: 0 } });
// 定义类型
interface PageResult<T> {
  list: T;
  total: number;
}
interface HistoryData {
  data: {
    list: any[];
    total: number;
  };
}
const historyData = ref<HistoryData>({
  data: {
    list: [],
    total: 0,
  },
});
export function useTicketStore() {
  return {
    ticketData,
    historyData
  };
}
