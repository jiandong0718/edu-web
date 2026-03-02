// 教室状态
export type ClassroomStatus = 'available' | 'occupied' | 'maintenance';

// 教室设施
export type ClassroomFacility = '投影仪' | '白板' | '空调' | '音响' | '电脑' | '电视' | '麦克风' | 'WiFi';

// 教室实体
export interface Classroom {
  id: number;
  name: string;
  code: string;
  campusId: number;
  campusName: string;
  building: string;
  floor: number;
  capacity: number;
  area: number;
  facilities: string[];
  status: ClassroomStatus;
  remark?: string;
  createTime: string;
  updateTime?: string;
}

// 教室查询参数
export interface ClassroomQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  campusId?: number;
  status?: ClassroomStatus;
  building?: string;
  minCapacity?: number;
  maxCapacity?: number;
}

// 教室列表响应
export interface ClassroomListResponse {
  code: number;
  msg: string;
  data: {
    list: Classroom[];
    total: number;
    page: number;
    pageSize: number;
  };
}

// 教室表单数据
export interface ClassroomFormData {
  name: string;
  code: string;
  campusId: number;
  building: string;
  floor: number;
  capacity: number;
  area: number;
  facilities: string[];
  status: ClassroomStatus;
  remark?: string;
}

// 教室统计数据
export interface ClassroomStatistics {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  totalCapacity: number;
  totalArea: number;
}
