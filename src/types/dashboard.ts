// 招生数据看板类型定义
export interface EnrollmentData {
  data?: {
    // 线索统计
    leadStats: {
      total: number;
      pending: number;
      converted: number;
    };
    // 试听统计
    trialStats: {
      total: number;
      scheduled: number;
      completed: number;
      converted: number;
    };
    // 转化率趋势（最近7天）
    conversionTrend: {
      date: string;
      rate: number;
    }[];
    // 线索来源分布
    leadSourceDistribution: {
      source: string;
      count: number;
    }[];
  };
  // 线索统计
  leadStats: {
    total: number;
    pending: number;
    converted: number;
  };
  // 试听统计
  trialStats: {
    total: number;
    scheduled: number;
    completed: number;
    converted: number;
  };
  // 转化率趋势（最近7天）
  conversionTrend: {
    date: string;
    rate: number;
  }[];
  // 线索来源分布
  leadSourceDistribution: {
    source: string;
    count: number;
  }[];
}

// 营收数据看板类型定义
export interface RevenueData {
  data?: {
    // 收入统计
    revenueStats: {
      today: number;
      week: number;
      month: number;
      year: number;
    };
    // 收款方式分布
    paymentMethodDistribution: {
      method: string;
      amount: number;
    }[];
    // 收入趋势（最近30天）
    revenueTrend: {
      date: string;
      amount: number;
    }[];
    // 欠费统计
    arrearsStats: {
      totalArrears: number;
      studentCount: number;
    };
  };
  // 收入统计
  revenueStats: {
    today: number;
    week: number;
    month: number;
    year: number;
  };
  // 收款方式分布
  paymentMethodDistribution: {
    method: string;
    amount: number;
  }[];
  // 收入趋势（最近30天）
  revenueTrend: {
    date: string;
    amount: number;
  }[];
  // 欠费统计
  arrearsStats: {
    totalArrears: number;
    studentCount: number;
  };
}

// 教学数据看板类型定义
export interface TeachingData {
  data?: {
    // 学员统计
    studentStats: {
      active: number;
      trial: number;
      potential: number;
    };
    // 班级统计
    classStats: {
      total: number;
      active: number;
      full: number;
    };
    // 教师统计
    teacherStats: {
      total: number;
      fullTime: number;
      partTime: number;
    };
    // 考勤率统计（最近7天）
    attendanceRate: {
      date: string;
      rate: number;
    }[];
  };
  // 学员统计
  studentStats: {
    active: number;
    trial: number;
    potential: number;
  };
  // 班级统计
  classStats: {
    total: number;
    active: number;
    full: number;
  };
  // 教师统计
  teacherStats: {
    total: number;
    fullTime: number;
    partTime: number;
  };
  // 考勤率统计（最近7天）
  attendanceRate: {
    date: string;
    rate: number;
  }[];
}

// ========== 教学数据看板详细类型定义 ==========

// 教学数据概览
export interface TeachingOverview {
  activeStudentCount: number;
  trialStudentCount: number;
  potentialStudentCount: number;
  totalClassCount: number;
  ongoingClassCount: number;
  fullClassCount: number;
  totalTeacherCount: number;
  fullTimeTeacherCount: number;
  partTimeTeacherCount: number;
  averageAttendanceRate: number;
  averageCompletionRate: number;
  renewalRate: number;
}

// 考勤率趋势项
export interface AttendanceRateItem {
  date: string;
  rate: number;
  expectedCount: number;
  actualCount: number;
}

// 班级统计项
export interface ClassStatsItem {
  classId: number;
  className: string;
  courseName: string;
  status: string;
  statusName: string;
  studentCount: number;
  capacity: number;
  attendanceRate: number;
  completedLessons: number;
  totalLessons: number;
}

// 教师统计项
export interface TeacherStatsItem {
  teacherId: number;
  teacherName: string;
  teacherType: string;
  teacherTypeName: string;
  classCount: number;
  weekScheduleCount: number;
  monthScheduleCount: number;
  studentCount: number;
  averageAttendanceRate: number;
}

// 课程消耗统计项
export interface CourseConsumptionItem {
  courseId: number;
  courseName: string;
  totalHours: number;
  consumedHours: number;
  remainingHours: number;
  consumptionRate: number;
  studentCount: number;
  classCount: number;
}

// 班级状态分布项
export interface ClassStatusDistribution {
  status: string;
  statusName: string;
  count: number;
  percentage: number;
}

// ========== 营收数据看板详细类型定义 ==========

// 营收概览
export interface RevenueOverview {
  incomeToday: number;
  incomeThisWeek: number;
  incomeThisMonth: number;
  incomeThisYear: number;
  totalArrears: number;
  arrearsStudentCount: number;
  arrearsContractCount: number;
  refundThisMonth: number;
  refundRate: number;
}

// 营收趋势项
export interface RevenueTrendItem {
  date: string;
  amount: number;
}

// 收款方式分布项
export interface PaymentMethodItem {
  method: string;
  methodName: string;
  amount: number;
  count: number;
  percentage: number;
}

// 欠费统计项
export interface ArrearsItem {
  studentId: number;
  studentName: string;
  contractNo: string;
  contractId: number;
  paidAmount: number;
  receivedAmount: number;
  arrearsAmount: number;
  campusName: string;
  signDate: string;
  expireDate: string;
}

// 课程营收排行项
export interface CourseRevenueItem {
  courseId: number;
  courseName: string;
  revenue: number;
  contractCount: number;
  studentCount: number;
}
