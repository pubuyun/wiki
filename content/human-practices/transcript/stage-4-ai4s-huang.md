---
title: "AI4S Expert Interview — Dr. Huang Wenkang"
interviewee: "Dr. Huang Wenkang"
interviewers: "GreatBay-SCIE 2026"
description: "Full transcript: Stage 4, Cycle 5 — AI4S Expert Dr. Huang"
hasReference: false
order: 11
---

**GreatBay-SCIE 2026**

Dr. Huang, I can see that you have joined the meeting. We can begin the interview.

**Dr. Huang Wenkang**

Are there only two of us here?

**GreatBay-SCIE 2026**

Another teammate may join us later, but we can begin now.

**Dr. Huang Wenkang**

All right.

**GreatBay-SCIE 2026**

Hello, Dr. Huang. We are the iGEM team from Shenzhen College of International Education. In our project, we have extensively used AI for *de novo* protein design, combining structure prediction, molecular dynamics simulations, and experimental validation to establish a screening workflow. As we approach the final stage of project development, we would like to discuss AI-assisted synthetic biology research methods, the safety of *de novo* proteins, authorship and the distribution of research benefits, and the limitations and future development of AI in this field.

Before we begin, do you consent to our taking notes and making an audio or video recording of this interview?

**Dr. Huang Wenkang**

Yes, I agree.

**GreatBay-SCIE 2026**

Do you also consent to our presenting the interview content, along with your name, professional identity, and institutional affiliation, on our project Wiki?

**Dr. Huang Wenkang**

Yes, I agree.

---

**GreatBay-SCIE 2026**

In our project, we added a **Characterize** stage before the traditional Design–Build–Test–Learn (*DBTL*) cycle in synthetic biology. This stage translates information about biological structures and mechanisms into specific design requirements. Traditional DBTL usually begins with Design. As AI becomes more deeply involved in biological design, do you think it is necessary to establish an independent Characterize stage to clarify the biological problem, mechanism of action, and design criteria before starting the design process?

**Dr. Huang Wenkang**

I think it is necessary. The key idea behind *de novo* design is to create something from scratch. However, the outputs of current AI models still depend heavily on their training data. If you want AI to produce something genuinely new and useful, you need to provide appropriate guidance.

The Characterize stage before design is somewhat like preparing a good set of prompts before using a large language model. By defining the problem and the requirements clearly, you can guide the model toward outputs that are more relevant and more likely to meet your expectations.

---

**GreatBay-SCIE 2026**

How should we distinguish Characterize from the traditional Design stage? Is it worth presenting as an independent new stage, or is it essentially preliminary work that has always been part of Design?

**Dr. Huang Wenkang**

When generative AI is deeply involved in the design process, I think Characterize becomes important enough to stand on its own. In this stage, researchers use existing information and evidence to define the biological problem, establish design criteria, and select protein targets. Those early decisions directly affect the direction of subsequent model generation and the quality of the resulting designs.

Of course, decisions made during Characterize may turn out to be incomplete or incorrect as the project progresses. In that case, you should revisit them and make adjustments according to experimental findings. Nevertheless, considering the amount and importance of the work involved, I think Characterize can reasonably be treated as a separate stage.

---

**GreatBay-SCIE 2026**

What are the essential outputs of a complete Characterize stage? For example, among target mechanisms, structural information and confidence, design constraints, success criteria, and potential risks, what must be clarified before entering AI-assisted design?

**Dr. Huang Wenkang**

From the perspective of protein design, I think the most important thing is to establish reliable information about the target protein. If the protein you are designing is relatively large or highly flexible, you may also need to select or design a protein scaffold in advance to support the binding or catalytic core that you intend to create.

Another important aspect is defining the criteria for successful screening. There is also something you may not have considered sufficiently: an **exit mechanism**. During the design process, you may find that, no matter how you adjust the model, it keeps generating structures that are unlikely to exist as real proteins. Or, when you predict the structure of the same designed protein multiple times, the predictions may differ significantly from one another.

When that happens, you need to be cautious. You should reconsider the feasibility of the project, or whether substantial changes are required, rather than simply insisting on completing the design despite the risks. Clear success criteria and an exit mechanism are both important.

---

**GreatBay-SCIE 2026**

In the future, AI may be able to generate candidate solutions directly from a biological problem. Do you think the Characterize stage will become even more important, or perhaps increasingly integrated with AI itself? Do you think the approach could be extended to other AI-assisted synthetic biology projects?

**Dr. Huang Wenkang**

There is a saying that AI itself has no purpose. Before AI begins a design task, researchers still need to give it a research direction. The most important role of Characterize is to establish that direction and define the scope of the work.

Even if AI eventually becomes capable of taking a biological question, performing all the intermediate steps, and proposing a complete solution, Characterize will remain important. More advanced algorithms and computational resources may allow AI to participate in Characterize as well. However, the final judgment about the biological problem and the overall research direction should still be made by people.

I think proposing Characterize as a separate stage is an innovative idea, and it is worth trying to apply this approach to other projects.

---

**GreatBay-SCIE 2026**

When discussing ownership and recognition of AI-assisted scientific research, should we distinguish among authorship of publications, patent inventorship, ownership of research outcomes, and rights to use model outputs?

**Dr. Huang Wenkang**

I think this depends on the circumstances of the specific project. For example, if an AI model is trained from scratch for a particular research project, or fine-tuned from an open-source model, and all its training data come from the same research group, the distinctions among publication authorship, patent inventorship, and rights to use the model's outputs may not need to be handled as strictly within that group.

However, in real research, it is becoming increasingly difficult for one individual, one research group, or even one institution to produce enough training data for a large AI model. These projects often involve extensive collaboration and data from many different sources.

In large-scale collaborations or collaborations between institutions, it is meaningful to define publication authorship, patent inventorship, ownership of outcomes, and rights to use model outputs clearly. Given the way training data are currently collected, such distinctions are especially important in larger collaborative projects.

---

**GreatBay-SCIE 2026**

Suppose a model developer provides a general-purpose model; a model user identifies the target, sets parameters, and screens sequences; and an experimental researcher modifies key residues through experiments to obtain a functional protein. How should authorship and recognition be allocated among these three parties according to their scientific contributions?

**Dr. Huang Wenkang**

I think recognition should depend on the actual contribution each party makes to the project. For example, suppose identifying the target required extensive preliminary experiments, or even led to the discovery of a previously unreported target. If the entire project became possible because of that discovery, the researcher who identified the target could be considered a principal contributor.

Conversely, if the model itself provided the key design or screening capability that made the project possible, the model developer might be the most important contributor and could potentially deserve first authorship.

You cannot simply divide the contribution equally among the three parties without considering the specific project. You have to examine what each party did and how important their work was to the final outcome. The relative value of different contributions varies from project to project.

---

**GreatBay-SCIE 2026**

If one researcher simply enters a short prompt and directly uses the model's output, while another obtains a result through multiple rounds of analysis, screening, and modification, should they be treated equally when determining their contributions to the research outcome?

**Dr. Huang Wenkang**

My view may be different from what people usually expect. In principle, I think these two researchers can be treated equally in terms of sharing in the outcome, depending on what their work contributes to the project.

One of the most important contributions of modern large models is that they greatly reduce repetitive computational work. In the past, when models and computing hardware were less developed, repeatedly adjusting parameters, running calculations, and analyzing results could make a substantial difference to the accuracy of computational results. Today, at least in structure-based biological design, we have relatively mature algorithms and workflows, such as AlphaFold and *RFdiffusion*. These tools have reduced the additional gains in accuracy that can be achieved solely through extensive manual parameter adjustment.

You can think of modern AI models as being somewhat similar to commercial kits used in wet-lab experiments. A kit standardizes and simplifies many experimental procedures. Even if someone does not fully understand every underlying mechanism or every individual step, they may still be able to complete the experiment by following the instructions.

Of course, someone who prepares reagents independently and carefully optimizes experimental conditions may obtain better results, such as a higher yield of purified protein, than someone using a standard kit. But the importance of those additional adjustments may become less significant when considered in the context of all the downstream work. You cannot automatically conclude that the researcher who prepared every reagent personally contributed more than the researcher who used a kit.

Similarly, if a model's output is correct and useful for subsequent experiments, then the model-use stage has successfully achieved its purpose. Exactly how much manual effort was needed to obtain that result is not necessarily the most important factor. You should not judge someone's scientific contribution solely by the amount of work they performed.

---

**GreatBay-SCIE 2026**

AI models are often trained using protein data from publicly accessible research papers and databases. Does public accessibility mean that these data can be used for training without restrictions? Should the original data contributors receive attribution, traceability, or a share of the benefits?

**Dr. Huang Wenkang**

Public accessibility certainly does not mean that data can be used for any kind of training without restrictions. Even open-source models are governed by their respective terms of use, and those terms may restrict certain commercial uses or other activities. For example, there can be restrictions on reusing model-related data for further training or on conducting large-scale screening through a publicly available online service such as AlphaFold. The precise permissions depend on the particular resource and its terms.

Although models such as AlphaFold have been trained using structures reported in publicly available scientific literature, that does not mean every subsequent use of the data or model is unrestricted. The organizations that develop these models also contribute resources to the training process, including model optimization and substantial computational power. Their contributions need to be considered as well.

At the same time, I think the original data contributors should, in principle, have the right to receive attribution and to seek recognition or benefit from their contributions. The practical difficulty is that training a modern model may involve experimental results produced by hundreds or even thousands of researchers. It is not realistic to list every individual contributor as an author on a single research paper.

I think this is an area where laws and regulations will need further development. Under current circumstances, recognizing or sharing outcomes at the level of collaborating research teams may be more practical than trying to account for every individual contribution separately, although the underlying questions of attribution and benefit-sharing remain important.

---

**GreatBay-SCIE 2026**

To reduce future disputes over authorship and ownership, should AI-assisted synthetic biology teams retain records of model versions, input conditions, parameters, screening procedures, and manual modifications? What other records are most useful for demonstrating an individual's actual contribution?

**Dr. Huang Wenkang**

Most AI models used in this context are generative models, and their outputs involve a certain degree of randomness. The model version, input conditions, random seeds, parameters, and screening procedures can all significantly affect the outputs and their reproducibility.

When using AI, you should maintain complete records for every run, just as you would keep a detailed experimental notebook for wet-lab work. Record the input parameters and other conditions each time. This helps you obtain results more consistently, and it also allows other people to reproduce your work. If someone can reproduce the results from your records, that provides evidence that the adjustments and decisions were made through your own research process. Such documentation may also help reduce authorship disputes.

There is still a black-box aspect to many AI models: researchers may not be able to explain directly how every output was generated. In that situation, recording changes to inputs and parameters is particularly valuable. For instance, imagine that you ran a model ten times. For every run, you could record the parameters used, the input and output data, and the results of downstream experiments.

The record of how you adjusted the model and responded to experimental results can show your thinking, your understanding of the research problem, and your ability to use the model effectively. In my opinion, these records of model adjustments and their consequences can be among the clearest demonstrations of an individual's actual contribution.

---

**GreatBay-SCIE 2026**

Considering the limitations and future development of AI protein design, what do you think is the most easily overlooked limitation at the current technological stage? Is it insufficient training data, a lack of negative or failed experimental data, biases in model evaluation, or the inability to simulate complex biological environments accurately?

**Dr. Huang Wenkang**

Accurately simulating a complex biological environment is certainly a limitation, but biological environments are so complicated that even today's computational resources are far from sufficient to simulate them completely. I think it may be more useful to focus on limitations that can be addressed more directly. In my view, one of the most easily overlooked limitations is the shortage of high-quality training data, including reliable positive examples.

Many of the best-known AI models currently used in biology are based on structural biology. Much of the structural data used to train prediction and generation models comes from cryo-electron microscopy or X-ray crystallography. However, structures obtained through these methods are not necessarily perfect representations of proteins in their natural environments.

These techniques often require large amounts of purified protein samples maintained in relatively stable conformations. To obtain sufficiently stable samples, researchers may introduce artificial modifications. This can be particularly relevant for multimers and large protein complexes, where modifications may be used to hold different subunits or components together. Once these modifications are introduced, it becomes difficult to know whether the experimentally determined structure fully represents the protein's natural state inside a living organism.

Another problem is that cryo-electron microscopy and crystallography have limitations in capturing highly flexible regions of proteins. As a result, many of the structures used as AI training data do not adequately represent continuous conformational changes. Proteins in living systems may adopt multiple conformations, and the transitions between those conformations can be essential to their functions.

Therefore, the limitations of experimentally determined structures can affect both the scope and accuracy of structure-based AI models. Although technologies for determining protein structures *in situ* have been developing, they are relatively recent, and the amount of high-quality data from these approaches remains limited. Such data may also be underrepresented in existing training sets.

There is a further problem: biological AI models are still concentrated heavily on protein structure prediction and design. Structural biology produces relatively concrete and well-defined data, which makes it more suitable for early generations of machine-learning models. However, biology also involves a vast range of downstream biochemical and molecular biology experiments.

Models that can connect protein structures to actual protein functions, or reliably predict downstream biochemical and physiological outcomes, are still at a relatively early stage. Compared with structural data, we lack sufficient high-quality information linking proteins to their functional experimental results.

For example, even after groups such as David Baker's team have completed structure-based protein design, they still need wet-lab screening methods, such as yeast surface display, to identify proteins that actually function as intended. I think obtaining high-quality, reproducible biochemical experimental data and using those data to train better models will be a key factor limiting or enabling further progress in AI protein design.

---

**GreatBay-SCIE 2026**

As AI becomes increasingly involved in hypothesis generation, solution design, computational validation, and result analysis, what do you think will remain the most irreplaceable role of human researchers in the future?

**Dr. Huang Wenkang**

As I mentioned earlier, AI itself has no purpose; researchers give it a purpose. The ability to judge and choose a research direction will remain an important skill, regardless of how far AI develops.

Many current large models work by identifying and summarizing patterns in existing human knowledge and experience. In that sense, they have characteristics similar to statistical models. It is much harder for them to obtain or infer knowledge that lies genuinely beyond the experience represented in their training data.

In the future, I think the most important tasks for researchers will still be deciding which scientific directions are worth pursuing and determining how to push the boundaries of human knowledge. Choosing the direction of future scientific development will remain a fundamentally human responsibility.

---

**GreatBay-SCIE 2026**

Could the development of AI-assisted synthetic biology make scientific research increasingly dependent on a small number of platforms or institutions that control large datasets, computing resources, and models? How might such concentration affect openness and innovation in research?

**Dr. Huang Wenkang**

I think that, in the short term, it certainly could. We can already see that well-funded laboratories and companies may have access to clusters containing thousands or even tens of thousands of GPUs, while smaller laboratories may have only a few. The present development of AI is concentrating considerable resources.

It strengthens laboratories that can generate large amounts of data, obtain unpublished data through different channels, and combine substantial computing resources. At the same time, it puts pressure on laboratories that rely mainly on public datasets or on experiments carried out by smaller research groups.

However, I think there may eventually be a limit to how much advantage can be gained from continuously increasing computing power and model complexity. Over the next several years, as algorithms and computing technology develop, the resources required to obtain powerful computational capabilities may decrease. Access to data and computing resources may become more widely distributed, gradually reducing the advantages currently held by the largest institutions.

The concentration of unpublished data in a small number of laboratories is also not a problem created by AI. It has existed in scientific research for a long time, although AI has amplified the advantages of institutions that already possess such resources.

So I think AI may temporarily reduce the room available for smaller, innovation-driven laboratories. In the longer term, however, advances in computing and productivity may gradually weaken this imbalance. I am less pessimistic about the long-term effects than people sometimes are when a major new technology first appears.

---

**GreatBay-SCIE 2026**

Over the next few years, which area should be prioritized in AI-assisted synthetic biology: stronger generative models, more reliable validation systems, more transparent research records, or clearer ethical and governance frameworks?

**Dr. Huang Wenkang**

I think laws, regulations, and clear boundaries for AI use are among the areas that most urgently need improvement. Computing power and AI models have been developing extremely quickly. If we think of AI as a form of productive capability, its abilities can change substantially within just a few months—much faster than many earlier technologies.

Legal and regulatory frameworks need to keep pace with that development. As AI systems become more powerful, their potential impact also grows. Major technology companies now control very substantial AI and computing capabilities, and when regulation falls behind, it becomes difficult to predict or manage all the risks that may arise.

We therefore need governance systems that can respond quickly to technological change. We also need clearer limits on where AI should be used and in which fields its use should be restricted, rather than introducing it excessively into every possible area.

---

**GreatBay-SCIE 2026**

Considering our C-DBTL framework and decision-gated workflow, what do you think is our most important innovation or contribution to thinking about AI-assisted synthetic biology? Is there anything in our approach that still needs improvement?

**Dr. Huang Wenkang**

I think introducing the preliminary Characterize stage is a good idea. It addresses the fact that AI does not have its own research purpose: researchers need to define that purpose and give the model a clear direction.

Regarding your design workflow, I am not sure how many candidate proteins you initially designed for each target structure. I also do not know whether you used RoseTTAFold to predict each designed structure only once, or whether you performed multiple predictions for the same design and compared them to identify a more stable predicted conformation.

Another point is that you used RFdiffusion for generation and RoseTTAFold for structure prediction. The structure produced by RFdiffusion may represent an idealized state, but that does not guarantee the protein can actually adopt that structure under real conditions.

In some published workflows, researchers add another screening step when evaluating large numbers of designs. They compare the structure generated by the diffusion model with the structure obtained from subsequent prediction, calculating the root-mean-square deviation (RMSD) between them, particularly around the binding or catalytic core.

If the structural differences are very large, the protein may be difficult to express or may fail to fold into the intended conformation, even if it can be expressed. Consequently, it may not perform the biological function for which it was designed.

From what I saw, this comparison step was not included in your workflow. Your subsequent experimental results seem reasonably good, and it is possible that the smaller number of designs reduced the impact of omitting that step. Nevertheless, if you want a more complete workflow that other researchers can reproduce reliably, I think it would be worthwhile to predict each design multiple times, assess the stability or consistency of the predicted conformations, and compare the generated structures with the predicted structures.

Apart from that, I think the rest of your work looks good.

---

**GreatBay-SCIE 2026**

Thank you very much. That covers our questions. Would you be comfortable turning on your camera so that we could take a group photograph?

Thank you again for your time!

**Dr. Huang Wenkang**

You're welcome.
