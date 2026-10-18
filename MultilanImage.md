# 中英文图片切换组件使用说明

在 `content/` 下的 Markdown 文档中，使用 `content-components-bilingual-image-panels` 插入可切换中英文版本的单图或四宫格。组件使用 Reka UI Tabs，选中语言显示 accent 色文字及下划线；点击图片可打开当前语言的灯箱。

组件只负责切换图片，需要提前准备英文和中文两套图片。以下示例中的 `example.com` 地址是占位地址，请替换为实际图片链接。项目中的使用示例见 [IHP 页面源文件](content/human-practices/index.md)。

## 单图写法

在正文中直接粘贴以下 MDC 块，无需导入 Vue 组件。`srcEn` 和 `srcZh` 分别填写英文版、中文版图片地址。

<!-- prettier-ignore -->
```markdown
::content-components-bilingual-image-panels
---
srcEn: https://example.com/interview-en.avif
srcZh: https://example.com/interview-zh.avif
altEn: Interview summary showing customer needs and product feedback.
altZh: 展示客户需求与产品反馈的访谈总结。
label: Interview summary image language
caption: "Fig. 1 | Interview summary / 访谈总结。"
defaultLanguage: en
---
::
```

单图占满可用宽度，默认不显示 `(a)` 编号。`srcEn`、`srcZh` 也可以写成各包含一个地址的列表。

## 四宫格写法

将每种语言的图片地址写成四项列表。图片按“左上、右上、左下、右下”的顺序排列；两套图片应保持相同数量与内容顺序。

<!-- prettier-ignore -->
```markdown
::content-components-bilingual-image-panels
---
srcEn:
  - https://example.com/interview-en-a.avif
  - https://example.com/interview-en-b.avif
  - https://example.com/interview-en-c.avif
  - https://example.com/interview-en-d.avif
srcZh:
  - https://example.com/interview-zh-a.avif
  - https://example.com/interview-zh-b.avif
  - https://example.com/interview-zh-c.avif
  - https://example.com/interview-zh-d.avif
altEn:
  - Customer needs collected during the interview.
  - Feedback on existing deodorant products.
  - Customer expectations for the proposed product.
  - Product improvements based on interview feedback.
altZh:
  - 访谈中收集的客户需求。
  - 客户对现有除臭产品的反馈。
  - 客户对拟开发产品的期望。
  - 根据访谈反馈制定的产品改进方案。
label: Interview panels image language
caption: "Fig. 2 | **(a)** Needs. **(b)** Existing products. **(c)** Expectations. **(d)** Improvements."
defaultLanguage: en
imageBackground: "#fff"
---
::
```

四宫格默认自动显示 `(a)` 至 `(d)`。图片保持原始比例，同一行的图片高度一致；窄屏下自动堆叠为单列。切换语言时整组图片一起切换，各组件的语言选择互不影响。

## 参数说明

参数写在组件块的两条 `---` 之间，名称使用下表中的大小写。

| 参数              | 类型               | 默认值             | 说明                                                                         |
| ----------------- | ------------------ | ------------------ | ---------------------------------------------------------------------------- |
| `srcEn`           | 字符串或字符串列表 | 必填               | 英文图片地址。单图可用字符串，四宫格使用四项列表。                           |
| `srcZh`           | 字符串或字符串列表 | 必填               | 中文图片地址，与英文图片顺序对应。                                           |
| `altEn`           | 字符串或字符串列表 | 空文本             | 英文替代文本。列表中的每项对应同一位置的图片；字符串会用于该语言的所有图片。 |
| `altZh`           | 字符串或字符串列表 | 空文本             | 中文替代文本，填写方式同 `altEn`。                                           |
| `caption`         | 字符串             | 不显示             | 两种语言共用的图注，支持 `**加粗**` 等行内 Markdown。图号需自行填写。        |
| `label`           | 字符串             | `Image language`   | 语言切换栏的无障碍名称，建议说明对应图片的主题。                             |
| `defaultLanguage` | `en` 或 `zh`       | `en`               | 初次显示的图片语言，设置为 `zh` 可默认显示中文。                             |
| `imageBackground` | CSS 颜色字符串     | `#fff`             | 图片背景色，例如 `"#fff"`、`"transparent"`。                                 |
| `autoLabels`      | 布尔值             | 单图关闭，多图开启 | 是否显示 `(a)`、`(b)` 等面板编号。                                           |

## 编写要点

- 为每张有信息的图片填写对应语言的 `altEn`、`altZh`，描述图片的内容或结论，不要只写“图片”或文件名。图注不会自动填入替代文本。
- 图片已经包含 `(a)`、`(b)` 等编号时，添加 `autoLabels: false`，避免重复编号。布尔值使用 `true` 或 `false`，不加引号。
- `caption` 是共用图注。需要双语图注时，在同一个字符串中写出两种语言；当前组件不提供 `captionEn` 或 `captionZh` 参数。
- 颜色值以 `#` 开头时必须加引号，例如 `imageBackground: "#fff"`。图注含有冒号、竖线或 Markdown 标记时，建议也用引号包住。
- 示例代码展示的是文件中应写入的内容；实际使用时，只粘贴 `::content-components-bilingual-image-panels` 到结尾 `::` 的部分，不包含外层代码围栏。

组件实现见 [BilingualImagePanels.vue](app/components/ContentComponents/BilingualImagePanels.vue)。
