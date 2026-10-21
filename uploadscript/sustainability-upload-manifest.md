# Sustainability 图片上传清单

状态：**待手动上传，以下 CDN 地址均为预测值，尚未经远端验证。**

- 本地文件夹：`D:\wiki\assets\sustainability-upload-ready`
- 远程目录：`hp/sustainability`（不要再新建子目录）
- 共 9 张图片；仅复制和重命名，未重新编码或压缩。SHA-256 已逐一与原件核对。
- 全选图片上传后，预计 iGEM 会将图片转换为同名 `.avif`。页面已预填以下地址；如实际返回地址不同，需要同步更新。

| 原文件 | 上传文件 | 预测 CDN 地址 |
| --- | --- | --- |
| wiki sustainability 插图-4.png | sustainability-index-fig1.png | [预测地址](https://static.igem.wiki/teams/6133/wiki/hp/sustainability/sustainability-index-fig1.avif) |
| b8e42a8b753145d5bb2b58e7b0f0708d.png | sustainability-index-fig2.png | [预测地址](https://static.igem.wiki/teams/6133/wiki/hp/sustainability/sustainability-index-fig2.avif) |
| 576befe3-a4cd-477f-a19b-61bfefefb950.png | sustainability-index-fig3.png | [预测地址](https://static.igem.wiki/teams/6133/wiki/hp/sustainability/sustainability-index-fig3.avif) |
| 442.jpeg | sustainability-index-fig4.jpeg | [预测地址](https://static.igem.wiki/teams/6133/wiki/hp/sustainability/sustainability-index-fig4.avif) |
| Untitled | sustainability-index-fig5.jpeg | [预测地址](https://static.igem.wiki/teams/6133/wiki/hp/sustainability/sustainability-index-fig5.avif) |
| image 1.png | sustainability-index-fig6.png | [预测地址](https://static.igem.wiki/teams/6133/wiki/hp/sustainability/sustainability-index-fig6.avif) |
| image.png | sustainability-index-fig7-a.png | [预测地址](https://static.igem.wiki/teams/6133/wiki/hp/sustainability/sustainability-index-fig7-a.avif) |
| test.jpg | sustainability-index-fig7-b.jpg | [预测地址](https://static.igem.wiki/teams/6133/wiki/hp/sustainability/sustainability-index-fig7-b.avif) |
| IMG_4617.jpeg | sustainability-index-fig7-c.jpeg | [预测地址](https://static.igem.wiki/teams/6133/wiki/hp/sustainability/sustainability-index-fig7-c.avif) |

## 图号与排版

- Fig. 1：SDG 关系示意图。
- Fig. 2–6：Lu、Zhang、Cheng、Chen、Li 访谈截图。
- Fig. 7：(a) 蛋白设计讲座；(b) 触觉图形测试；(c) 叶片结构课程。三联图自动添加 (a)–(c)。

## 内容核查记录

- 原始参考文献 8 和 9 为同一 EPA 页面，合并为 8；原 10–12 重排为 9–11。正文共 13 处引用，对应 11 条独立参考文献。
- “欧盟报告称气雾剂含 VOC 可达 95%”与原附 EPA 页面不匹配，保留主张并记录于 `uploadscript/Unresolved Links.md`。
- 主文参考文献保留在 `content/sustainability/index.md`，四篇访谈保留在 `content/sustainability/interviews/` 子目录内。
- 保留已有页面横幅。没有运行 Nuxt 构建或启动开发服务。
- 5 篇文档已通过 Markdown/MDC 解析核对：7 个图组件、9 个图片地址、13 处引用和 11 条参考文献均对应完整。
- 访谈目录已统一为 `content/sustainability/interviews/`；访谈页继续使用显式 `path` 指定 `/sustainability/interviews/...` 英文路径。
- 主文 Interviews 部分使用与 iHP 相同的 `content-components-human-practices-interview-script` 可折叠组件读取四篇访谈；原始访谈 Markdown 从侧栏导航隐藏。
