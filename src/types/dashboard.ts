// 招生数据看板类型定义
export interface EnrollmentData {
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
