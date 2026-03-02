import type { ColumnType } from 'antd/es/table';
import type { ExportConfig } from './types';

/**
 * 导出Excel工具函数
 * 注意：需要安装 xlsx 库: npm install xlsx
 */
export async function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: ColumnType<T>[],
  config?: ExportConfig
) {
  try {
    // 动态导入xlsx库
    const XLSX = await import('xlsx');

    const fileName = config?.fileName || 'export';
    const sheetName = config?.sheetName || 'Sheet1';
    const exportColumns = config?.columns;

    // 过滤要导出的列
    const filteredColumns = exportColumns
      ? columns.filter((col) => exportColumns.includes(col.key as string))
      : columns.filter((col) => col.key && col.title);

    // 构建表头
    const headers = filteredColumns.map((col) => col.title as string);

    // 构建数据行
    const rows = data.map((record) => {
      return filteredColumns.map((col) => {
        const dataIndex = col.dataIndex as string;
        let value = record[dataIndex];

        // 如果有自定义render，尝试获取渲染后的值
        if (col.render && typeof value !== 'object') {
          const rendered = col.render(value, record, 0);
          // 如果render返回的是简单值，使用它
          if (typeof rendered === 'string' || typeof rendered === 'number') {
            value = rendered;
          }
        }

        return value ?? '';
      });
    });

    // 合并表头和数据
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // 设置列宽
    const colWidths = filteredColumns.map((col) => ({
      wch: Math.max(
        String(col.title).length * 2,
        15
      ),
    }));
    worksheet['!cols'] = colWidths;

    // 创建工作簿
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 导出文件
    XLSX.writeFile(workbook, `${fileName}.xlsx`);

    return true;
  } catch (error) {
    console.error('导出Excel失败:', error);
    throw new Error('导出失败，请确保已安装 xlsx 库');
  }
}

/**
 * 格式化文件名（添加时间戳）
 */
export function formatFileName(fileName: string): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  return `${fileName}_${timestamp}`;
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }

  return cloned;
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let previous = 0;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    const now = Date.now();

    if (now - previous > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      func.apply(context, args);
      previous = now;
    } else if (!timeout) {
      timeout = setTimeout(() => {
        func.apply(context, args);
        previous = Date.now();
        timeout = null;
      }, wait);
    }
  };
}
