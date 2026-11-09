# 气味手记 · Scent Atelier

个人香水图鉴、香气聚类与地图、DIY 调香和用香日历 H5。

仓库保持私有；部署的网站按公开链接访问，无账号登录限制。

## 本地启动

在项目目录运行 `启动设计预览.ps1`，或：

```powershell
python -m http.server 4187 --bind 127.0.0.1 --directory prototype
```

## 构建与测试

需要 Node.js 22 或更新版本，无需安装 npm 依赖。

```powershell
node --test prototype/*.test.mjs
node scripts/build-site.mjs
```

构建仅把运行文件、最终图鉴使用的真实图片、可视化数据和许可证复制到 `dist`，排除测试、图片审核页面和研究资料。Vercel 通过 Git 仓库构建该目录。

## 数据边界

- 香柜、调香作品和日记保存在当前浏览器 localStorage；本项目没有云端同步服务。
- 从 localhost 换到部署域名后属于另一个存储空间；如需迁移，请先在原页面导出，再到新页面导入。
- 图鉴图片与资料来源保留在数据文件、`prototype/assets/README.md` 和 `prototype/vendor/` 中。仓库私有不代表网站提供的图片、数据和前端代码不可下载。
- 仓库不包含本地 Python 分析环境、下载分片、原始抓取缓存和实验中间数据；本地研究目录仍保留。

产品与历次验证见 `PRODUCT.md`、`docs/`。公开部署状态以部署完成后的记录为准。
