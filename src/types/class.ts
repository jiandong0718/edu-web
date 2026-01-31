// 班级类型定义

// 班级状态
export type ClassStatus = 'pending' | 'active' | 'completed' | 'cancelled';

// 班级类型
export type ClassType = 'regular' | 'trial' | 'intensive';

// 班级基本信息
export interface Class {
  id: number;
  name: string;
  code: string;
  courseId: number;
  courseName: string;
  teacherId: number;
  teacherName: string;
  campusId: number;
  campusName: string;
  classroomId?: number;
  classroomName?: string;
  type: ClassType;
  status: ClassStatus;
  capacity: number;
  currentStudents: number;
  startDate: string;
  endDate: string;
  totalHours: number;
  completedHours: number;
  schedule: string; // 上课时间安排，如"周一、周三 18:00-20:00"
  remark?: string;
  createTime: string;
  updateTime: string;
}

// 班级学员
export interface ClassStudent {
  id: number;
  classId: number;
  studentId: number;
  studentName: string;
  studentAvatar?: string;
  studentPhone: string;
  parentPhone: string;
  joinDate: string;
  leaveDate?: string;
  status: 'active' | 'left';
  attendanceRate: number; // 出勤率
  completedHours: number; // 已完成课时
  remark?: string;
}

// 班级课程安排
export interface ClassSchedule {
  id: number;
  classId: number;
  date: string;
  startTime: string;
  endTime: string;
  teacherId: number;
  teacherName: string;
  classroomId?: number;
  classroomName?: string;
  hours: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  attendanceCount?: number; // 出勤人数
  remark?: string;
}

// 班级考勤统计
export interface ClassAttendanceStats {
  totalSchedules: number; // 总排课次数
  completedSchedules: number; // 已完成次数
  totalStudents: number; // 总学员数
  averageAttendanceRate: number; // 平均出勤率
  monthlyStats: Array<{
    month: string;
    attendanceRate: number;
    scheduleCount: number;
  }>;
}

// 班级列表查询参数
export interface ClassQueryParams {
  page: number;
  pageSize: number;
  name?: string;
  code?: string;
  courseId?: number;
  teacherId?: number;
  campusId?: number;
  status?: ClassStatus;
  type?: ClassType;
}

// 班级列表响应
export interface ClassListResponse {
  list: Class[];
  total: number;
  page: number;
  pageSize: number;
}

// 班级新增/编辑参数
export interface ClassFormData {
  id?: number;
  name: string;
  code: string;
  courseId: number;
  teacherId: number;
  campusId: number;
  classroomId?: number;
  type: ClassType;
  status: ClassStatus;
  capacity: number;
  startDate: string;
  endDate: string;
  totalHours: number;
  schedule: string;
  remark?: string;
}

// 学员分班参数
export interface AssignStudentParams {
  classId: number;
  studentIds: number[];
  joinDate: string;
  remark?: string;
}

// 学员退班参数
export interface RemoveStudentParams {
  classId: number;
  studentId: number;
  leaveDate: string;
  reason?: string;
}

// 班级升班参数
export interface UpgradeClassParams {
  classId: number;
  newClassName: string;
  newCourseId: number;
  newTeacherId: number;
  startDate: string;
  studentIds: number[]; // 升班学员ID列表
}

// 班级结业参数
export interface CompleteClassParams {
  classId: number;
  completeDate: string;
  remark?: string;
}
