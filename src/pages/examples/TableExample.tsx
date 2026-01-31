import React, { useState } from 'react';
import { Button, Space, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { CommonTable } from '../../components/CommonTable';
import type { PageResult, FetchParams } from '../../components/CommonTable';
import type { ColumnType } from 'antd/es/table';

// 示例数据类型
interface Student {
  id: number;
  name: string;
  age: number;
  gender: string;
  grade: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'graduated';
  enrollDate: string;
  score: number;
}

// 模拟数据
const mockData: Student[] = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  name: `学生${index + 1}`,
  age: 18 + Math.floor(Math.random() * 10),
  gender: Math.random() > 0.5 ? '男' : '女',
  grade: `${Math.floor(Math.random() * 3) + 1}年级`,
  phone: `138${Math.random().toString().slice(2, 10)}`,
  email: `student${index + 1}@example.com`,
  status: ['active', 'inactive', 'graduated'][Math.floor(Math.random() * 3)] as Student['status'],
  enrollDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1)
    .toISOString()
    .split('T')[0],
  score: Math.floor(Math.random() * 40) + 60,
}));

/**
 * CommonTable使用示例页面
 */
export default function TableExample() {
  const [selectedRows, setSelectedRows] = useState<Student[]>([]);

  // 定义表格列
  const columns: ColumnType<Student>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left',
      sorter: true,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      fixed: 'left',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 80,
      sorter: true,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      filters: [
        { text: '男', value: '男' },
        { text: '女', value: '女' },
      ],
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      width: 100,
      filters: [
        { text: '1年级', value: '1年级' },
        { text: '2年级', value: '2年级' },
        { text: '3年级', value: '3年级' },
      ],
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: Student['status']) => {
        const statusMap = {
          active: { color: 'success', text: '在读' },
          inactive: { color: 'warning', text: '休学' },
          graduated: { color: 'default', text: '毕业' },
        };
        const config = statusMap[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      filters: [
        { text: '在读', value: 'active' },
        { text: '休学', value: 'inactive' },
        { text: '毕业', value: 'graduated' },
      ],
    },
    {
      title: '入学日期',
      dataIndex: 'enrollDate',
      key: 'enrollDate',
      width: 120,
      sorter: true,
    },
    {
      title: '成绩',
      dataIndex: 'score',
      key: 'score',
      width: 100,
      sorter: true,
      render: (score: number) => {
        const color = score >= 90 ? '#00ff88' : score >= 60 ? '#00d4ff' : '#ff6b6b';
        return <span style={{ color, fontWeight: 'bold' }}>{score}</span>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 模拟数据获取（后端分页）
  const fetchData = async (params: FetchParams): Promise<PageResult<Student>> => {
    console.log('请求参数:', params);

    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredData = [...mockData];

    // 搜索过滤
    if (params.search) {
      filteredData = filteredData.filter(
        (item) =>
          item.name.includes(params.search!) ||
          item.phone.includes(params.search!) ||
          item.email.includes(params.search!)
      );
    }

    // 筛选
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value && value.length > 0) {
          filteredData = filteredData.filter((item) =>
            value.includes(item[key as keyof Student] as string)
          );
        }
      });
    }

    // 排序
    if (params.sorter && !Array.isArray(params.sorter)) {
      const { field, order } = params.sorter;
      if (field && order) {
        filteredData.sort((a, b) => {
          const aValue = a[field as keyof Student];
          const bValue = b[field as keyof Student];
          if (order === 'ascend') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
      }
    }

    // 分页
    const start = (params.current - 1) * params.pageSize;
    const end = start + params.pageSize;
    const pageData = filteredData.slice(start, end);

    return {
      data: pageData,
      total: filteredData.length,
      current: params.current,
      pageSize: params.pageSize,
    };
  };

  // 处理编辑
  const handleEdit = (record: Student) => {
    message.info(`编辑学生: ${record.name}`);
  };

  // 处理删除
  const handleDelete = (record: Student) => {
    message.warning(`删除学生: ${record.name}`);
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedRows.length === 0) {
      message.warning('请先选择要删除的数据');
      return;
    }
    message.success(`批量删除 ${selectedRows.length} 条数据`);
  };

  // 处理批量导出
  const handleBatchExport = () => {
    if (selectedRows.length === 0) {
      message.warning('请先选择要导出的数据');
      return;
    }
    message.success(`批量导出 ${selectedRows.length} 条数据`);
  };

  // 自定义导出函数
  const handleCustomExport = async (data: Student[]) => {
    console.log('自定义导出:', data);
    // 这里可以实现自定义的导出逻辑
    // 例如：调用后端API导出
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#fff', fontSize: 24, marginBottom: 8 }}>
          CommonTable 使用示例
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
          展示通用表格组件的各种功能：分页、筛选、排序、搜索、导出、列设置等
        </p>
      </div>

      {/* 示例1: 完整功能表格 */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#00d4ff', fontSize: 18, marginBottom: 16 }}>
          示例1: 完整功能表格（后端分页）
        </h2>
        <CommonTable<Student>
          columns={columns}
          onFetch={fetchData}
          rowKey="id"
          searchable
          searchPlaceholder="搜索姓名、手机号、邮箱"
          exportable
          exportFileName="学生列表"
          showRefresh
          showColumnSetting
          rowSelection
          onSelectionChange={(keys, rows) => {
            console.log('选中的行:', keys, rows);
            setSelectedRows(rows);
          }}
          toolbarRender={() => (
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
                  border: 'none',
                }}
              >
                新增学生
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
                disabled={selectedRows.length === 0}
              >
                批量删除
              </Button>
            </Space>
          )}
          scroll={{ x: 1500 }}
        />
      </div>

      {/* 示例2: 简单表格（前端分页） */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#00d4ff', fontSize: 18, marginBottom: 16 }}>
          示例2: 简单表格（前端分页）
        </h2>
        <CommonTable<Student>
          columns={columns.slice(0, 6)}
          dataSource={mockData.slice(0, 20)}
          rowKey="id"
          pagination={{
            pageSize: 5,
          }}
        />
      </div>

      {/* 示例3: 无分页表格 */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#00d4ff', fontSize: 18, marginBottom: 16 }}>
          示例3: 无分页表格
        </h2>
        <CommonTable<Student>
          columns={columns.slice(0, 5)}
          dataSource={mockData.slice(0, 10)}
          rowKey="id"
          pagination={false}
          showRefresh={false}
        />
      </div>
    </div>
  );
}
