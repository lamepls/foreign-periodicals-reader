# PythonAnywhere 免费部署指南

PythonAnywhere 是一个免费的 Python 云端托管平台，**不需要信用卡**，支持 Flask 后端，适合长期稳定运行。

部署后会得到一个类似 `https://你的用户名.pythonanywhere.com` 的永久链接。

## 前置条件

1. 一个 PythonAnywhere 账号（免费注册：https://www.pythonanywhere.com/registration/register/begin/）
2. 你的 GitHub 仓库已上传代码：`https://github.com/lamepls/foreign-periodicals-reader`

## 第一步：在 PythonAnywhere 打开 Bash

登录后，点击顶部 **Consoles → Bash**，打开一个命令行窗口。

## 第二步：克隆代码并安装依赖

在 Bash 中依次执行下面命令（把 `你的用户名` 改成你的 PythonAnywhere 用户名）：

```bash
cd ~
git clone https://github.com/lamepls/foreign-periodicals-reader.git
cd foreign-periodicals-reader
python3.10 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

等待安装完成。

## 第三步：创建 Web 应用

1. 点击顶部 **Web** 标签。
2. 点击 **Add a new web app**。
3. 选择 **Manual configuration**。
4. Python 版本选择 **Python 3.10**。
5. 点击 **Next**，完成创建。

## 第四步：配置 WSGI 文件

1. 在 Web 应用配置页面，找到 **WSGI configuration file**，点击文件名（例如 `/var/www/你的用户名_pythonanywhere_com_wsgi.py`）。
2. 把文件内容全部删除，替换为：

```python
import sys
path = '/home/你的用户名/foreign-periodicals-reader'
if path not in sys.path:
    sys.path.insert(0, path)

from wsgi import application
```

> 注意：把 `你的用户名` 替换成你的 PythonAnywhere 用户名。

3. 点击右上角 **Save**。

## 第五步：配置虚拟环境路径

回到 Web 应用配置页面：

1. 找到 **Virtualenv** 部分。
2. 输入虚拟环境路径：

```text
/home/你的用户名/foreign-periodicals-reader/venv
```

3. 点击 **OK**。

## 第六步：配置静态文件

在 Web 应用配置页面找到 **Static files** 部分：

1. 点击 **Add a new static file mapping**。
2. URL 填：`/static/`
3. Directory 填：`/home/你的用户名/foreign-periodicals-reader/static`
4. 点击 **OK**。

## 第七步：重启应用

回到 Web 应用配置页面顶部，点击 **Reload 你的用户名.pythonanywhere.com**。

等待几秒后，在浏览器打开页面顶部显示的域名，应该就能看到网站了。

## 后续更新

如果以后修改了代码，只需要在 Bash 里执行：

```bash
cd ~/foreign-periodicals-reader
git pull
```

然后在 Web 页面点击 **Reload** 即可。

## 常见问题

- **网站打不开 404**：检查 WSGI 文件路径和用户名是否填写正确。
- **CSS/JS 没加载**：检查静态文件映射的目录路径是否正确。
- **提示某个模块找不到**：确认虚拟环境里已安装 `requirements.txt` 的依赖。
