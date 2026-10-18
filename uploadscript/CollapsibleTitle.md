# 折叠标题写法

在内容 Markdown 中使用：

```md
::content-components-collapsible-title{title="Serviceable Obtainable Market (SOM)" heading-tag="h3" id="som"}
这里是折叠正文，支持 **加粗**、列表等 Markdown 内容。

预计市场规模为 **USD 0.27 billion**。
::
```

- `title`：必填，显示的标题文字。
- `heading-tag`：可选，支持 `h3`、`h4`、`h5`、`h6`，默认 `h3`，样式与对应普通标题一致。
- `id`：可选，设置页面内唯一的标题锚点，例如 `som` 对应 `#som`。

正文默认折叠，点击标题或聚焦后按 Enter / 空格键可展开、收起。
