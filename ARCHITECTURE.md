# AED 定位器 - 产品架构

## 功能需求

### 1. 真实导航
- 高德/百度地图 SDK 集成
- 实时路线规划
- 语音导航

### 2. 后台管理系统
- AED 位置管理（增删改查）
- AED 状态管理（可用/维修中/过期）
- 管理员权限控制
- 操作日志

### 3. 科普模块
- AED 使用教程
- 急救知识文章
- 视频教程
- 后台可编辑

### 4. AI 助手
- 急救问答
- 使用指导
- 语音交互

---

## 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   Pages     │    │   Workers   │    │     D1      │ │
│  │  (前端)     │───▶│   (API)     │───▶│  (数据库)   │ │
│  │             │    │             │    │             │ │
│  │ - 用户端    │    │ - REST API  │    │ - AED 数据  │ │
│  │ - 管理后台  │    │ - AI 接口   │    │ - 用户数据  │ │
│  └─────────────┘    │ - 认证      │    │ - 文章内容  │ │
│                     └─────────────┘    └─────────────┘ │
│                                                         │
│  ┌─────────────┐    ┌─────────────┐                   │
│  │   R2/KV     │    │   AI        │                   │
│  │  (存储)     │    │  (智谱)     │                   │
│  │             │    │             │                   │
│  │ - 图片      │    │ - 问答      │                   │
│  │ - 文件      │    │ - 科普      │                   │
│  └─────────────┘    └─────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 数据库设计 (D1)

### AED 表
```sql
CREATE TABLE aeds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  available BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active', -- active, maintenance, expired
  contact TEXT,
  hours TEXT,
  image_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 文章表 (科普)
```sql
CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- tutorial, knowledge, video
  image_url TEXT,
  video_url TEXT,
  sort_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 管理员表
```sql
CREATE TABLE admins (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin', -- superadmin, admin, editor
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## API 设计

### 公开 API
- `GET /api/aeds` - 获取 AED 列表
- `GET /api/aeds/nearby?lat=&lng=` - 获取附近 AED
- `GET /api/articles` - 获取科普文章
- `POST /api/ai/chat` - AI 问答

### 管理 API (需认证)
- `POST /api/admin/login` - 登录
- `GET /api/admin/aeds` - 获取所有 AED
- `POST /api/admin/aeds` - 创建 AED
- `PUT /api/admin/aeds/:id` - 更新 AED
- `DELETE /api/admin/aeds/:id` - 删除 AED
- `GET /api/admin/articles` - 获取所有文章
- `POST /api/admin/articles` - 创建文章
- `PUT /api/admin/articles/:id` - 更新文章
- `DELETE /api/admin/articles/:id` - 删除文章

## 前端页面

### 用户端
- `/` - 首页（地图 + AED 列表）
- `/aed/:id` - AED 详情
- `/knowledge` - 科普列表
- `/knowledge/:id` - 科普详情
- `/ai` - AI 助手

### 管理后台
- `/admin` - 后台首页
- `/admin/login` - 登录
- `/admin/aeds` - AED 管理
- `/admin/articles` - 文章管理
- `/admin/settings` - 设置

## 开发计划

### Phase 1: 基础架构 (1-2天)
- [ ] 初始化项目结构
- [ ] 设置 D1 数据库
- [ ] 创建 Workers API
- [ ] 管理后台基础框架

### Phase 2: 核心功能 (2-3天)
- [ ] AED CRUD
- [ ] 真实导航集成
- [ ] 用户端地图优化

### Phase 3: 内容系统 (1-2天)
- [ ] 文章管理
- [ ] 科普页面
- [ ] 富文本编辑器

### Phase 4: AI 助手 (1-2天)
- [ ] 智谱 AI 集成
- [ ] 急救知识库
- [ ] 对话界面

---

*创建时间: 2026-04-01*
