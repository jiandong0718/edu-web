// 课表状态
export type ScheduleStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

// 重复规则类型
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly';

// 课表实体
export interface Schedule {
  id: number;
  classId: number;
  className: string;
  courseId: number;
  courseName: string;
  teacherId: number;
  teacherName: string;
  classroomId?: number;
  classroomName?: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  actualTeacherId?: number;
  actualTeacherName?: string;
  cancelReason?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

// 课表查询参数
export interface ScheduleQueryParams {
  pageNum?: number;
  pageSize?: number;
  classId?: number;
  courseId?: number;
  teacherId?: number;
  classroomId?: number;
  status?: ScheduleStatus;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

// 课表列表响应
export interface ScheduleListResponse {
  list: Schedule[];
  total: number;
}

// 批量排课请求
export interface BatchScheduleRequest {
  classId: number;
  courseId: number;
  teacherId: number;
  classroomId?: number;
  startDate: string;
  endDate?: string;
  totalSessions?: number;
  repeatType: RepeatType;
  repeatValue?: number[]; // 周几重复 [1,3,5] 表示周一、三、五
  timeSlots: TimeSlot[];
  skipHolidays: boolean;
  skipWeekends: boolean;
  remark?: string;
}

// 时间段
export interface TimeSlot {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

// 冲突检测请求
export interface ConflictCheckRequest {
  teacherId?: number;
  classroomId?: number;
  classId?: number;
  startTime: string;
  endTime: string;
  excludeScheduleId?: number;
}

// 冲突检测响应
export interface ConflictCheckResponse {
  hasConflict: boolean;
  conflicts: ConflictInfo[];
}

// 冲突信息
export interface ConflictInfo {
  type: 'teacher' | 'classroom' | 'class';
  scheduleId: number;
  className: string;
  courseName: string;
  teacherName: string;
  classroomName?: string;
  startTime: string;
  endTime: string;
}

// 调课请求
export interface RescheduleRequest {
  scheduleId: number;
  newStartTime?: string;
  newEndTime?: string;
  newTeacherId?: number;
  newClassroomId?: number;
  reason: string;
}

// 代课请求
export interface SubstituteRequest {
  scheduleId: number;
  substituteTeacherId: number;
  reason: string;
}

// 停课请求
export interface CancelScheduleRequest {
  scheduleId: number;
  reason: string;
}

// 课表预览项
export interface SchedulePreviewItem {
  date: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
}
