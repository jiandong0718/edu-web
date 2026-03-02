import React from 'react';
import { Button, Space, Tag } from 'antd';
import { CommonTable } from '../../components/CommonTable';
import type { ColumnType } from 'antd/es/table';

// 简单示例数据
interface SimpleData {
  id: number;
  name: string;
  status: string;
  date: string;
}

const simpleColumns: ColumnType<SimpleData>[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Tag color={status === '正常' ? 'success' : 'warning'}>{status}</Tag>
    ),
  },
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date',
  },
];

const simpleData: SimpleData[] = [
  { id: 1, name: '项目A', status: '正常', date: '2026-01-01' },
  { id: 2, name: '项目B', status: '异常', date: '2026-01-15' },
  { id: 3, name: '项目C', status: '正常', date: '2026-01-20' },
  { id: 4, name: '项目D', status: '正常', date: '2026-01-25' },
  { id: 5, name: '项目E', status: '异常', date: '2026-01-30' },
];

/**
 * CommonTable 简单示例
 */
export default function SimpleTableExample() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ color: '#fff', marginBottom: 24 }}>
        CommonTable 简单示例
      </h1>

      <CommonTable<SimpleData>
        columns={simpleColumns}
        dataSource={simpleData}
        rowKey="id"
        searchable
        exportable
        exportFileName="简单示例"
        showRefresh
        showColumnSetting
        pagination={{
          pageSize: 5,
        }}
      />
    </div>
  );
}
