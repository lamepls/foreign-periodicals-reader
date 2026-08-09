# Render 永久部署指南

本指南会一步步带你把 `natgeo-reader` 部署到 Render，获得一个长期稳定的公网链接，手机随时访问。

## 前置条件

1. 一个 GitHub 账号（免费注册：https://github.com/signup）
2. 电脑上安装 Git（Windows 下载：https://git-scm.com/download/win）
3. 一个 Render 账号（免费注册：https://render.com）

## 第一步：把项目上传到 GitHub

### 1.1 初始化 Git 仓库

打开终端，进入项目文件夹：

```bash
cd natgeo-reader
```

初始化仓库并提交所有文件：

```bash
git init
git add .
git commit -m "Initial commit for Render deployment"
```

### 1.2 在 GitHub 创建仓库

1. 登录 GitHub，点击右上角 **+ → New repository**。
2. 仓库名可以叫 `natgeo-reader`（或其他你喜欢的名字）。
3. 保持 **Public**（公开），这样 Render 可以直接连接。
4. 不要勾选 “Initialize this repository with a README”，因为我们本地已经有 README 了。
5. 点击 **Create repository**。

### 1.3 把本地代码推送到 GitHub

创建仓库后，GitHub 会显示类似下面的命令，复制并在终端执行：

```bash
git remote add origin https://github.com/你的用户名/natgeo-reader.git
git branch -M main
git push -u origin main
```

> 第一次 `git push` 会要求你登录 GitHub，按提示输入用户名和个人访问令牌（PAT）即可。

推送完成后，刷新 GitHub 页面，应该能看到所有文件。

## 第二步：在 Render 上部署

### 2.1 连接 GitHub 仓库

1. 登录 [Render](https://render.com)。
2. 点击 Dashboard 右上角的 **New + → Web Service**。
3. 选择 **Build and deploy from a Git repository**。
4. 找到并选择你的 `natgeo-reader` 仓库，点击 **Connect**。

### 2.2 配置部署参数

Render 会自动读取项目根目录的 `render.yaml`，大部分配置已经填好。你可以检查以下字段：

| 配置项 | 建议值 |
|---|---|
| Name | `natgeo-study-reader` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn app:app` |
| Plan | Free |

如果没有自动识别 `render.yaml`，就按上面手动填写。

### 2.3 开始部署

点击 **Create Web Service**。Render 会自动：

1. 安装 `requirements.txt` 里的依赖。
2. 启动 Gunicorn 运行 Flask 应用。
3. 分配一个永久域名，例如：

```
https://natgeo-study-reader.onrender.com
```

部署大约需要 2-5 分钟。页面顶部会显示部署日志，看到 `Your service is live` 就表示成功了。

## 第三步：访问与验证

1. 部署完成后，Render 会给出域名，复制到浏览器或手机打开。
2. 测试功能：
   - 粘贴 National Geographic 文章链接，点击“获取信息”。
   - 编辑标题和正文。
   - 点击“下载 DOCX”，确认文件能正常下载。

## 常见问题

### Q1：免费套餐会休眠吗？

会的。Render 免费套餐在一段时间无人访问后会进入休眠，首次访问需要等待约 30 秒唤醒。这是正常现象。

### Q2：可以绑定自己的域名吗？

可以。在 Render 服务页面的 **Settings → Custom Domains** 里添加你自己的域名，并按提示配置 DNS。

### Q3：如何更新网站？

以后只要修改本地代码，然后执行：

```bash
git add .
git commit -m "更新内容"
git push origin main
```

Render 会自动重新部署。

### Q4：部署失败怎么办？

请检查 Render 日志里是否有以下常见错误：

- `ModuleNotFoundError`：说明 `requirements.txt` 里缺少依赖，请补全后重新 push。
- `gunicorn: command not found`：请确认 `requirements.txt` 里包含 `gunicorn`。
- `Bind error`：通常是端口问题，确保 Flask 使用 `port = int(os.environ.get("PORT", 5000))`，不要写死端口。

如果仍有问题，把 Render 日志截图发给我，我帮你排查。
