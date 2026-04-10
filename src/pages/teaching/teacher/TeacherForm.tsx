import { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, Radio, Alert, message, Row, Col } from 'antd';
import { CommonForm } from '@/components/CommonForm';
import type { TeacherFormData } from '@/types/teacher';
import { getTeacherDetail, createTeacher, updateTeacher } from '@/api/teacher';
import { getCampusList } from '@/api/campus';
import dayjs, { type Dayjs } from 'dayjs';
import { FileUpload } from '@/components/FileUpload';

const { Option } = Select;
const { TextArea } = Input;

interface TeacherFormProps {
  id?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

type TeacherFormValues = Omit<
  TeacherFormData,
  'birthday' | 'address' | 'teacherType' | 'joinDate' | 'leaveDate' | 'avatar'
> & {
  joinDate?: Dayjs;
};

// 科目选项
const SUBJECT_OPTIONS = [
  '语文', '数学', '英语', '物理', '化学', '生物',
  '历史', '地理', '政治', '音乐', '美术', '体育',
  '信息技术', '通用技术', '心理健康'
];

// 教师等级选项
const LEVEL_OPTIONS = ['初级', '中级', '高级', '特级', '正高级'];

export default function TeacherForm({ id, onSuccess, onCancel }: TeacherFormProps) {
  const [form] = Form.useForm();
  const [, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<string>();
  const [campusOptions, setCampusOptions] = useState<{ label: string; value: number }[]>([]);

  // 加载校区列表
  useEffect(() => {
    getCampusList().then((res) => {
      setCampusOptions(
        (res.list || []).map((c) => ({ label: c.name, value: c.id }))
      );
    }).catch(() => {
      message.error('加载校区列表失败');
    });
  }, []);

  // 加载教师详情
  useEffect(() => {
    if (!id) return;
    const loadDetail = async () => {
      setLoading(true);
      try {
        const data = await getTeacherDetail(id);
        form.setFieldsValue({
          ...data,
          joinDate: data.joinDate ? dayjs(data.joinDate) : undefined,
        });
        setAvatar(data.avatar);
      } catch {
        message.error('加载教师信息失败');
      } finally {
        setLoading(false);
      }
    };
    void loadDetail();
  }, [form, id]);

  // 提交表单
  const handleSubmit = async (values: TeacherFormValues) => {
    if (!values.joinDate) {
      throw new Error('请填写入职日期');
    }

    const formData: TeacherFormData = {
      ...values,
      avatar,
      birthday: '',
      address: '',
      teacherType: 'full_time',
      joinDate: values.joinDate.format('YYYY-MM-DD'),
      leaveDate: undefined,
    };

    try {
      if (id) {
        await updateTeacher(id, formData);
        message.success('更新成功');
      } else {
        await createTeacher(formData);
        message.success('创建成功');
      }
      onSuccess();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '操作失败');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <CommonForm
        form={form}
        onSubmit={(values) => handleSubmit(values as TeacherFormValues)}
        onCancel={onCancel}
        submitText={id ? '更新' : '创建'}
        showActions={true}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Alert
              type="warning"
              showIcon
              message="当前版本仅保存后端已支持字段，出生日期、地址、教师类型、离职日期已从编辑表单下线。"
            />
          </Col>

          {/* 头像上传 */}
          <Col span={24}>
            <Form.Item
              label={<span style={{ color: '#fff' }}>头像</span>}
            >
              <FileUpload
                onChange={(fileList) => {
                  if (fileList && fileList.length > 0) {
                    setAvatar(fileList[0].url || fileList[0].response?.url);
                  } else {
                    setAvatar(undefined);
                  }
                }}
                accept="image/*"
                maxSize={2}
              />
            </Form.Item>
          </Col>

          {/* 基本信息 */}
          <Col span={12}>
            <Form.Item
              label={<span style={{ color: '#fff' }}>姓名</span>}
              name="name"
              rules={[
                { required: true, message: '请输入姓名' },
                { max: 50, message: '姓名不能超过50个字符' },
              ]}
            >
              <Input placeholder="请输入姓名" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={<span style={{ color: '#fff' }}>性别</span>}
              name="gender"
              rules={[{ required: true, message: '请选择性别' }]}
            >
              <Radio.Group>
                <Radio value="male">男</Radio>
                <Radio value="female">女</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={<span style={{ color: '#fff' }}>手机号</span>}
              name="phone"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
              ]}
            >
              <Input placeholder="请输入手机号" maxLength={11} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={<span style={{ color: '#fff' }}>邮箱</span>}
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入正确的邮箱' },
              ]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={<span style={{ color: '#fff' }}>身份证号</span>}
              name="idCard"
              rules={[
                { required: true, message: '请输入身份证号' },
                {
                  pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
                  message: '请输入正确的身份证号'
                },
              ]}
            >
              <Input placeholder="请输入身份证号" maxLength={18} />
            </Form.Item>
          </Col>

          {/* 教学信息 */}
          <Col span={12}>
            <Form.Item
              label={<span style={{ color: '#fff' }}>教师等级</span>}
              name="level"
              rules={[{ required: true, message: '请选择教师等级' }]}
            >
              <Select placeholder="请选择教师等级">
                {LEVEL_OPTIONS.map(level => (
                  <Option key={level} value={level}>{level}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={<span style={{ color: '#fff' }}>教授科目</span>}
              name="subjects"
              rules={[
                { required: true, message: '请选择教授科目' },
                { type: 'array', min: 1, message: '至少选择一个科目' },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="请选择教授科目"
                maxTagCount="responsive"
              >
                {SUBJECT_OPTIONS.map(subject => (
                  <Option key={subject} value={subject}>{subject}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* 状态信息 */}
          <Col span={12}>
            <Form.Item
              label={<span style={{ color: '#fff' }}>状态</span>}
              name="status"
              rules={[{ required: true, message: '请选择状态' }]}
              initialValue="active"
            >
              <Select placeholder="请选择状态">
                <Option value="active">在职</Option>
                <Option value="inactive">休假</Option>
                <Option value="leave">离职</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={<span style={{ color: '#fff' }}>所属校区</span>}
              name="campusId"
              rules={[{ required: true, message: '请选择所属校区' }]}
            >
              <Select placeholder="请选择所属校区">
                {campusOptions.map(campus => (
                  <Option key={campus.value} value={campus.value}>
                    {campus.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* 入职信息 */}
          <Col span={12}>
            <Form.Item
              label={<span style={{ color: '#fff' }}>入职日期</span>}
              name="joinDate"
              rules={[{ required: true, message: '请选择入职日期' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="请选择入职日期"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>
          </Col>

          {/* 备注信息 */}
          <Col span={24}>
            <Form.Item
              label={<span style={{ color: '#fff' }}>备注</span>}
              name="remark"
            >
              <TextArea
                rows={4}
                placeholder="请输入备注信息"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>
      </CommonForm>
    </div>
  );
}
