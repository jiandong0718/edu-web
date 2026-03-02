# 教育机构学生管理系统

Education Student Management System - 一套完整的教育培训机构管理解决方案。

## 项目简介

本系统面向教育培训机构，提供从招生、教学、财务到运营的全流程数字化管理能力。

### 核心功能

- **招生管理**：线索管理、试听安排、转化跟踪
- **学员管理**：学员档案、联系人、标签分组
- **教学管理**：课程、班级、排课、考勤、作业
- **财务管理**：合同、收费、退费、课时消耗
- **运营支撑**：消息通知、营销活动、数据看板

## 项目结构

```
edu/
├── edu-admin-api/     # 后端服务 (Java + Spring Boot)
├── edu-admin-web/     # 前端管理后台 (React + Ant Design Pro)
└── docs/              # 项目文档
```

## 技术栈

### 后端
- Java 17+
- Spring Boot 3.x
- MyBatis-Plus
- MySQL 8.0+
- Redis

### 前端
- React 18+
- TypeScript
- Vite
- Ant Design Pro
- Zustand

## 快速开始

### 环境要求

- JDK 17+
- Node.js 18+
- MySQL 8.0+
- Redis 6.0+
- Maven 3.8+

### 后端启动

```bash
cd edu-admin-api
mvn clean install
mvn spring-boot:run -pl edu-admin
```

### 前端启动

```bash
cd edu-admin-web
npm install
npm run dev
```

## 开发规范

详见各子项目的 README.md 文档。

## License

MIT License
