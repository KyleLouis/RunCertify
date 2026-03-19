<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# RunCertify - 马拉松完赛与志愿者证书管理系统

这是一个用于管理马拉松赛事成绩、志愿者信息，并自动生成专属电子证书的系统。

## 特性
- 🏃‍♂️ **双端支持**：包含选手端查询和管理员后台管理
- 🏅 **AI 智能增强**：集成 Gemini AI 自动生成专属名言与勋章
- 🎨 **高度可定制**：支持自定义赛事 Logo、底图、签名及排版样式
- 📦 **批量处理**：支持大量数据的批量导入和证书批量打包下载
- 💾 **本地化存储**：图片素材自动本地化存储，节省数据库空间

## 本地运行指南

**环境要求:** Node.js (v16+)

### 1. 安装依赖

根目录下安装前端依赖：
```bash
npm install
```

进入 `backend` 目录安装后端依赖（如果尚未安装）：
```bash
cd backend
npm install
npm install uuid  # 用于生成唯一图片名称
cd ..
```

### 2. 配置环境变量

在 `backend` 目录下创建或修改 `.env.local` 文件，并填入以下内容：
```env
PORT=3001
# 填入您的 Gemini API Key
GEMINI_API_KEY=您的_GEMINI_API_KEY
# 图片本地存储路径配置 (可选，默认为 ./data/images/runcertify)
IMAGE_SAVE_PATH=./data/images/runcertify
```

### 3. 运行应用

回到项目根目录，启动前后端联调服务：
```bash
npm run dev
```

- 前端地址: `http://localhost:3000`
- 后端 API 地址: `http://localhost:3001`
- 默认管理员账号: `13800009999` / 密码: `123456`

## 数据存储说明
- 数据库文件保存在 `backend/data.db` (SQLite)
- 用户上传的证书底图、Logo 等素材图片将自动保存在 `backend/data/images/runcertify` 目录下。
- 最终的合成证书仅在用户点击下载时由前端实时渲染生成，不会占用服务器存储空间。
