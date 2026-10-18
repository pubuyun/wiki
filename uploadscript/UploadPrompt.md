目标目录: 用户指定
图片上传远端目录：用户指定
任务
把所有目标目录下的md，保留相同结构放在content/同名目录下，文件和目录名改成全小写，空格改成 - 连接符。每个目录的index.md里放此目录同名md文档.
meta格式
---
title: 文档原title
description: 按照文档内容生成
hasReference: false， 只有在文档标题为Reference时为true
order: 删除文档前的有序列表编号，填写order
---
要求
- Overview标题的文档改为index.md, 如果只有一个category同名md，直接放在index.md内,reference也放在index.md内，不建新reference文档，如果是多个，建一个reference文档并把全部reference放进去。
- 修复明显的拼写和语法错误，不要更改内容
- 确保所有引用按Vancouver 标准，所有正文上标(如^42)按正文出现顺序重排序。Reference文档中的顺序按照正文重排重排.
- 确保图表编号正确 Fig. n
- 如果有图片或内容需要四宫格排版(比如声明了2x2 grid,或图例里写了(a), (b), (c), (d) 等)， 阅读LayoutPanelGuide.md并实现排版. 需要时使用PanelLayout的autolabels
- 如果遇到图片，按照uploadscript/PROMPT.md的指示，上传图片，不要在远端目录再新建文件夹，全部放在一个目录，命名为 目录*-文档名-fign，如 precursor-binder/characterize.md下的fig1 为 precursor-binder-characterize-fig1.avif。 然后查看lightboximage.md，保证md文档内使用LightBox组件正确显示图片，注意查看图片并按照无障碍标准自动写相应图片的替代文字(alt属性)。如果图注已经完全描述图片，alt留空。 在上传的文档内，图注一般写在图片下面,斜体或引用格式,确保把图注加到lightbox里。出现只有(a)(b)的图片时，默认左右，除非说明了是上下如 (a up) (b down)， 此时删除图注内的up 和 down并排成上下。
- 遇到附件pdf, 上传pdf并根据文档内容添加链接或渲染. iframe要加#page=1&view=Fit
- 如果有些专有名词的大小写,格式不统一,自动更改成按照Glossary内的格式. 如所有PeptSh, peptsh改为PepT<sub>Sh</sub>; de novo改为de novo;
- 如果有难以理解的专有名词(不包括通用生物/化学名词,以及reference文档里的词)，加入glossary，自动写描述和link* (如需要）， link优先github仓库(软件)，可信来源（如官网）的解释(专有名词)，wikipedia(简单名词) 。glossary内的解释不应该与项目上下文相关.
- 每个文章(除了reference)中第一次出现Glossary中的词时，把词标成斜体以触发行内注释识别.
- 如果遇到content/相同位置已经有文档，里面有自定义mdc组件，找到文档内容中指示的合适位置把组件插入到文档内容中。
- 遇到中括号括起来的内容，一般是文档内的链接或指示。优先在同category内寻找链接目标，如[Precursor Binder]可能表示链接到同category下的Precursor Binder文档, [engineering/cycle1]表示链接到engineering下的cycle1文档。如果遇到现在还解决不了的链接（如对应页还没上传，或应有的外部链接没写），先简短写到Unresolved Links.md里，且不要删除原文的中括号，一个一行。
- 遇到中括号括起来的h3-h6标题，看CollapsibleTitle.md