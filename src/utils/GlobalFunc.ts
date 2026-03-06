// 导入生成随机节点 ID 的工具函数
import { getRandNodeId } from "@/utils/ProcessUtil";

// 生成一个随机字符串
export function generateStr(len: number): string {
  let result = '';  // 初始化结果字符串
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';  // 可选字符集
  const charactersLength = characters.length;   // 字符集长度
  for (let i = 0; i < len; i++) {
    // 从字符集中随机选择一个字符添加到结果字符串
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;  // 返回生成的随机字符串
}

// 深拷贝对象
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));  // 使用 JSON 序列化和反序列化实现深拷贝
}

// 删除数组中的指定元素
export function delField<T>(cols: T[], i: number): void {
  cols.splice(i, 1);  // 使用 splice 方法删除指定索引的元素
}

// 复制数组中的指定元素，并为复制的元素生成新的 ID 和 key
export function copyField<T extends { id?: string; key?: string; type?: string }>(
  cols: T[],
  i: number
): void {
  const col = deepCopy(cols[i]);  // 深拷贝指定索引的元素
  col.id = getRandNodeId();  // 为复制的元素设置新的随机 ID
  col.key = col.type ? `${col.type}_${generateStr(8)}` : generateStr(8);  // 生成一个新的 key，包括类型和随机字符串
  cols.push(col);  // 将复制的元素添加到数组末尾
}

export default {
  deepCopy,
};
