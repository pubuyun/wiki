# Model 文案一致性与事实核查

检查日期：2026-10-14。

已核对移回工作区的 `model/` 全部 22 篇 Markdown。正文与此前飞书原生导出的版本一致，差异为图片引用路径。检查包括跨页比对、部分结果图核对，以及原始论文、PDB 和官方软件文档查证；未修改原文。

下文区分“确定的文字矛盾/事实遗漏”和“需要原始实验或计算记录确认的问题”。没有实验数据、脚本、配置文件、序列或轨迹时，不将待确认项当成已证明的数据错误。

## 优先处理的问题

### 1. 前体 binder 的数量口径没有闭合

位置：[Overview 第 5 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/1. Overview.md:5>)、[Overview 第 155 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/1. Overview.md:155>)、[前体 MD 第 46 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/2. Precursor Binder/4. MD Simulation.md:46>)。

- Overview 写实际测试 9 个。
- 同一页 Design 写测试 12 个，两个设计分支各 6 个。
- 详细 MD 页写筛选 11 个送实验。
- 结果图 RFdiffusion 分支有 4 个点（BR5、BR7、BR8、BR10），Proteina 分支有 5 个点（BC1、BC2、BC6、BC7、BC11），共 9 个。

这些数量可能分别代表计划、送样、表达成功、最终纳入分析，并非必然证明实验数字错误，但目前都被写作测试数量，读者无法重建筛选过程。应补一张按分支列出的数量表，写清每个阶段及排除原因，并统一 Overview 与详细页。

### 2. Overview 的前体图注 n=5 与 RFdiffusion 图不符

位置：[Overview 第 163 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/1. Overview.md:163>)。

图注先统一说 n=5，后面又说 RFdiffusion 分支有 4 个 binder。实际图中该分支确实只有 4 个点，另一分支为 5 个。应分别标注 `RFdiffusion3: n=4; Proteina-Complexa: n=5`，不要将候选数与实验重复数混用。该图注的 A/B 与 G–I 子图编号也需要与最终拼图对应。

### 3. RFdiffusion 入选数量同时为 40 和 20

位置：[RFdiffusion Design 第 29 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/2. Precursor Binder/2. Design_ RFdiffusion.md:29>)、同文件第 35、57 行。

Validation 写保留 40 个，Parameter 和 TopN 脚本说明都写 top 20。若 40 是初筛、20 是送 MD 的最终数量，应明确增加这一步筛选；否则按照真实脚本输出统一数字。

### 4. 热稳定性优化母本混用 T370K 与 T370L

位置：[Overview 第 43 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/1. Overview.md:43>)、[Optimization 第 3 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/5. Optimization.md:3>)、[Thermostability 第 25 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/5. Optimization/1. CGTase Thermostability.md:25>)、[CGTase Discussion 第 25 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/4. CGTase/4. Discussion.md:25>)。

Overview 和热稳定性详细页用 T370K 与 T370R/F183W；Optimization 总页用 T370L 与 T370R/F183W；CGTase Discussion 说明原本要做 T370K，却实际得到 T370L。需要根据序列确认：计算以哪个母本进行，送实验的是哪个母本，热稳定性样品是否重新构建了 T370K。不同阶段可以使用不同母本，但必须显式交代，不能将它们当作同一实验对象。

### 5. 1CXL 不是野生型：必须交代 E257Q 的处理

位置：[CGTase Characterize 第 41 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/4. CGTase/1. Characterize.md:41>)、[CGTase MD 第 15 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/4. CGTase/3. MD Simulation.md:15>)、[Overview 第 287 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/1. Overview.md:287>)。

PDB 官方记录明确将 1CXL 标为 **E257Q 突变体与共价反应中间体的复合物**。正文使用该模板，却反复称模拟对象为 wild-type CGTase，未说明是否将 Q257 回变为 E257。若确实回变，应补出建模步骤与共价中间体参数化方式；若没有回变，wild-type 的称呼和对野生型催化的推断就需要修改。不能仅凭文案断言实际模拟一定遗漏了回变。

热稳定性页的 1CXI 则是野生型结构，两个 PDB ID 各自用途不同，不能随意统一替换。来源：[1CXL 官方记录](https://www.rcsb.org/structure/1CXL)、[1CXI 官方记录](https://www.rcsb.org/structure/1CXI)。

### 6. 折叠工具混用了 RoseTTAFold All-Atom 与 RF3

位置：[RFdiffusion Design 第 7 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/2. Precursor Binder/2. Design_ RFdiffusion.md:7>)、同文件第 25、51 行。

Summary 写 RosettaFold AA，Validation 写 RosettaFold3，PrepareRF3BatchInput 的说明又写 RosettaFoldAA。这不只是大小写差异：RFAA 与 RF3 是不同模型，配置和可复现性不同。应根据实际运行程序和 checkpoint 写清使用哪一个；若分阶段用了两者，逐步标注用途。RF3 的标准名称可统一为 `RoseTTAFold3 (RF3)`。来源：[Foundry 官方 RF3 文档](https://github.com/RosettaCommons/foundry/blob/production/models/rf3/README.md)。

### 7. CGTase 候选与实验对象数量也不一致

位置：[CGTase Design 第 5 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/4. CGTase/2. Design.md:5>)、同文件第 31 行；[CGTase MD 第 35 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/4. CGTase/3. MD Simulation.md:35>)；[CGTase Discussion 第 21 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/4. CGTase/4. Discussion.md:21>)。

Summary 写 6 个候选，表题写 9 个组合，MD 决策写选择 T370R/F183W、T370K、T370R 三个突变体，Discussion 却说只有一个正确候选被测试。目前无法知道双突变体是否失败、是否未测试，以及 T370L 是否作为意外变体保留。应列出每个候选的设计序列、测序确认、表达状态、是否纳入实验和排除原因。

### 8. A412 降低不能单独证明糖基化或直接结合机制

位置：[Overview 第 5 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/1. Overview.md:5>)、[Overview 第 41 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/1. Overview.md:41>)、[CGTase Discussion 第 17 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/4. CGTase/4. Discussion.md:17>)、[Overview 第 37 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/1. Overview.md:37>)。

文案由 Ellman/A412 信号下降，进一步表述为已鉴定 CGTase 对前体的化学修饰、binder 已具备直接结合能力，以及 3M3SH 产量下降。Ellman 读数首先反映可反应的游离巯基，并不特异鉴定糖基化产物，也不直接测量 Kd。Cys-Gly-3M3SH 的硫是结合状态，与游离 3M3SH 的检测必须区分。

若 wet-lab 部分另有明确的转化步骤、背景扣除、样品干扰控制或产物/结合验证，可以据此支持更强结论；但这些依据未在本组文案中交代。建议将现有结论写为“降低该 assay 的 A412 readout，结果与所提机制相容”，并链接实验方法。确认糖基化产物可提供 LC-MS 等直接依据；直接亲和力需相应结合测量。此项是证据与结论的边界问题，不等于实验结果被证明无效。来源：[Thermo Fisher Ellman 说明书](https://documents.thermofisher.com/TFS-Assets/LSG/manuals/MAN0011216_Ellmans_Reag_UG.pdf)。

## 事实表述与引用问题

### 9. 引用编号存在系统性错配

以本目录唯一的 [Reference](<C:/Users/wzh_z/Documents/feishu-export-md/model/6. Reference.md:5>) 为编号表，下面的引用与所支持内容不符。若原意为各页独立编号，各页必须附独立参考文献列表，当前文档没有。

| 位置                                             | 当前编号           | 实际所指                                | 建议核对为                                           |
| ------------------------------------------------ | ------------------ | --------------------------------------- | ---------------------------------------------------- |
| Overview 第 195 行，PepTSh 和 6EXS               | 1                  | RFdiffusion3                            | 12                                                   |
| Overview 第 199 行，PepTSh 动力学                | 3                  | RF3                                     | 11                                                   |
| Transporter Characterize 第 19 行，6EXS          | 2                  | LigandMPNN                              | 12                                                   |
| Transporter Characterize 第 59 行，细胞壁 25 kDa | 3                  | RF3                                     | 13，并考虑原始通透性论文                             |
| Transporter MD 第 7 行，MM/GBSA 软件             | 5                  | Proteina-Complexa 相关论文              | 9                                                    |
| CGTase Characterize 第 11 行，腋窝 pH            | 2                  | LigandMPNN                              | 22                                                   |
| CGTase Characterize 第 43 行，RMSD 聚类          | 27                 | MTGase 底物特异性                       | 应替换为真正使用的聚类方法来源，或作为自定义方法描述 |
| CGTase MD 第 5 行，GROMACS                       | 2                  | LigandMPNN                              | 8                                                    |
| CGTase MD 第 5 行，实验结构                      | 1                  | RFdiffusion3                            | 28，及具体 PDB                                       |
| Proteina Design 第 5、15 行，Proteina 系列       | 1、2、3、4 或 1234 | 混入 RFD3、LigandMPNN、RF3；1234 不存在 | 核对 4–7 各自支持的组件                              |
| Proteina Design 第 25 行，RF3                    | 5                  | Proteina 相关论文                       | 3                                                    |
| Proteina Design 第 9 行，LigandMPNN              | 6                  | La-Proteina                             | 2                                                    |

Reference 的第 24 条与第 27 条是同一篇 Ohtsuka 论文，宜去重并同步更新所有编号。不要只局部改几个编号。

### 10. 前体尾部的化学名称写错了羟基位置

位置：[CGTase Design 第 19 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/4. CGTase/2. Design.md:19>)。

该处写 `3-methylhexan-3-ol-derived moiety`，把羟基放在 3 位；3M3SH 是 3-methyl-3-sulfanylhexan-1-ol，羟基在 1 位。前体中该结构通过硫与 cysteinylglycine 相连。建议使用 `the 3M3SH-derived hydroxyalkyl moiety`，或准确写出完整连接结构。来源：[3M3SH 原始研究](https://pubmed.ncbi.nlm.nih.gov/17191896/)、[前体结构及转运论文](https://elifesciences.org/articles/34995)。

### 11. RF3 ranking score 公式省略 clash 惩罚

位置：[前体 Discussion 第 21 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/2. Precursor Binder/5. Discussion.md:21>)。

文案写 `0.8 ipTM + 0.2 pTM`。当前官方实现为 `0.8 ipTM + 0.2 pTM − 100 × has_clash`。若入选样本均无 clash，数值简化成立，但应说明这个前提；同时记录实际使用的 Foundry 版本，不能用当前版本反推历史计算必然错误。来源：[Foundry 官方实现](https://github.com/RosettaCommons/foundry/blob/production/models/rf3/src/rf3/inference_engines/rf3.py)。

### 12. 热稳定性 beam search 的增益条件文字方向有歧义

位置：[Thermostability 第 63 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/5. Optimization/1. CGTase Thermostability.md:63>)。

这里说新增突变 contributes “at least −0.5”。按数值大小，at least 意味着 ≥−0.5，可能纳入零或正的、没有稳定化收益的结果；与前文越负越稳定的规则不一致。若意图要求至少 0.5 kcal/mol 的稳定化收益，应明确写：`ΔΔG(S∪{m}) − ΔΔG(S) ≤ −0.5 kcal/mol`。需要核对代码是否按这一方向实现；仅凭文字不能认定算法实际筛反了。

### 13. “IF→OF 是整个周期的限速步”写得过于确定

位置：[Transporter Characterize 第 11 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/3. Transporter Binder/1. Characterize.md:11>)、[Overview 第 199 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/1. Overview.md:199>)。

引用论文支持慢速全局构象变化是重要动力学瓶颈，并讨论 IF-OC 状态搜索、耦合水合和不同路径；不宜压缩成已确证、唯一的整个周期限速步骤。建议改为“the multiscale simulations suggest that slow global conformational rearrangements can be a major kinetic bottleneck”。选择稳定 IF 的 binder 是设计假设，不能由此直接认定已提高能垒或已抑制转运。来源：[Li et al. 原始论文](https://pmc.ncbi.nlm.nih.gov/articles/PMC9279349/)。

### 14. 将 <25 kDa 直接外推为能到达 S. hominis 膜表面，依据不足

位置：[Transporter Characterize 第 59 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/3. Transporter Binder/1. Characterize.md:59>)。

该大小估计来自纯化 B. subtilis 肽聚糖的实验背景；细胞壁通透性还受交联、表面电荷和动态重塑影响。80–120 aa 作为提高可达性的设计考虑合理，但不能视为已验证穿过完整 S. hominis 细胞壁。建议增加物种和实验体系限定，并将可达性保留为待验证假设。来源：[所引细胞壁综述](https://pmc.ncbi.nlm.nih.gov/articles/PMC3331896/)。

## 方法定义与结果解释需补充

### 15. CGTase“2、4、6、8 点突变”需要说明是新增数量

位置：[Overview 第 373 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/1. Overview.md:373>)、[Thermostability 第 91 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/5. Optimization/1. CGTase Thermostability.md:91>)。

T370K 支线的最终序列实际包含 3、5、7、9 个相对 WT 的变化；F183W/T370R 支线则为 4、6、8、10 个。若所谓 2/4/6/8 是在母本上新增的突变，设计本身不矛盾，但必须这样标注，并将“相对母本”与“相对 WT”分开。

### 16. ligand RMSD 的拟合对象不清楚，影响“结合姿态保持”的解释

位置：[前体 MD 第 38 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/2. Precursor Binder/4. MD Simulation.md:38>)、同文件第 60 行。

正文说 ligand RMSD 衡量 binding-pose retention，脚本说明却写 ligand self RMSD。若计算先将配体拟合到自身，其整体平移/旋转会被消去，只能主要描述配体内部构象；评价是否停留在口袋，应在拟合蛋白后计算配体 RMSD，或补充接触、距离等指标。需要核对实际轨迹处理脚本，明确 atom selection、fit group、PBC、参考结构和统计时间窗。

Transporter 部分图注写拟合 transporter Cα，脚本/筛选文字又写 membrane fit，也需统一说明实际拟合对象。位置：[Transporter Discussion 第 7 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/3. Transporter Binder/4. Discussion.md:7>)、[Transporter MD 第 47 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/3. Transporter Binder/3. MD Simulation.md:47>)。

### 17. pTM 的“strong agreement”与图中结果不匹配

位置：[前体 Discussion 第 19 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/2. Precursor Binder/5. Discussion.md:19>)。

这里把 i_pAE、ipTM、pTM 一起归入 strong agreement，但 RFdiffusion 图中 pTM 只有 r=0.40、ρ=0.20（4 个样本）。最多可说方向相符、关联较弱；不宜和 i_pAE/ipTM 一起作强关联结论。其余相关系数也应作为很小样本的探索性描述，并避免把选中子集的相关性写成泛化预测能力。

### 18. 计算详情在本地导出中仍是占位符，不能复现

多页保留 `[Config]`、`[Binders Parameter]`、`[RMSD component]`、`[Algorithm Image]` 等文字，并且有表题却没有表体。

例：[Proteina Design 第 31 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/2. Precursor Binder/3. Design_ Proteina-Complexa.md:31>)、[CGTase Design 第 31 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/4. CGTase/2. Design.md:31>)、[Overview 第 89 行](<C:/Users/wzh_z/Documents/feishu-export-md/model/1. Overview.md:89>)。

这可能是文案尚未填完，也可能是导出未包含某些嵌入块；不能仅从导出判断飞书原文一定缺失。发布前应补真实表格/链接，并提供生成量、去重规则、模型版本、力场、配体参数化、温度、重复轨迹数、归一化与复合评分定义。Proteina 的 PAE 尤其需要注明是否使用原始归一化值或乘 31 后的 Å 值，pLDDT 应注明 0–1 或 0–100，避免改动评分量级。来源：[Proteina 官方指标说明](https://github.com/NVIDIA-BioNeMo/Proteina-Complexa/blob/aggregator-compat/docs/EVALUATION_METRICS.md)。

## 已核对、目前不应改成“错误”的内容

- `(S)-3M3SH` 的 sweat/onion-like 与 `(R)-3M3SH` 的 fruity/grapefruit-like 描述有原始研究支持。[来源](https://pubmed.ncbi.nlm.nih.gov/17191896/)
- 6EXS 作为 PepTSh 的 IF 结合态结构有论文依据。[来源](https://pmc.ncbi.nlm.nih.gov/articles/PMC9279349/)
- SPURS 文献确实使用负 ΔΔG 表示稳定化，<−0.5 kcal/mol 的阈值有依据；其组合预测扩展训练于单/双突变数据。因此不能把本文的负号或这项训练描述本身判为错误。[来源](https://pmc.ncbi.nlm.nih.gov/articles/PMC12830971/)
- Affinity 页中定义 a 为原氨基酸、b 为候选时，`ΔNLL = ln[P(a)/P(b)]` 为负意味着候选概率更高，符号一致。不过这是模型偏好，而非实测亲和力。[方法来源](https://doi.org/10.1038/s41586-026-10670-w)
- Transporter 详细 MD 页已说明无显式熵校正、无隐式膜模型，且将 MM/GBSA 当成近似筛选依据；它没有直接把该近似当成实验 Kd，此处应保留限制说明。
- Optimization Discussion 明确说 Tm 测量未成功、亲和力实验尚不可用，不能在 Overview 其它位置声称优化已被实验证明有效。

## 建议处理顺序

先统一候选数量、母本身份、模型名称与引用编号；其次交代 1CXL 的 E257Q 回变和体系制备；再将 A412、相关性、MD 与机制结论调整到实际证据能支持的范围；最后补齐配置、表格和样品状态。

实验显著性、21% 的最大降幅以及各变体的真实身份仍需原始数据和测序记录确认。本报告没有据文字猜测正确数字，也没有代替作者改动实验结论。
