---
title: "AI4S Expert Interview — Li Chunjiang"
interviewee: "Li Chunjiang"
interviewers: "GreatBay-SCIE 2026 (Zhou Zhiqing)"
description: "Full transcript: Stage 4, Cycle 5 — AI4S Expert Li Chunjiang"
hasReference: false
order: 12
---

**GreatBay-SCIE 2026**

Hello, and thank you for joining us. We are the iGEM team from Shenzhen College of International Education. In our project, we use AI for protein design and combine structure prediction, molecular dynamics simulations, and experimental validation in a screening workflow. As we approach the final stage of our project, we would like to discuss *AI for Science* (AI4S) research methods, the safety of *de novo* proteins, authorship and the distribution of research benefits, and the limitations and future development of AI4S.

Before we begin, do you consent to our taking notes and making an audio or video recording of this interview?

**Li Chunjiang**

Yes, I agree.

**GreatBay-SCIE 2026**

Do you also consent to our sharing the interview content, your name, professional identity, and workplace on our project Wiki? If any of this is inconvenient, we can anonymize the relevant information.

**Li Chunjiang**

I do not agree.

---

**GreatBay-SCIE 2026**

We have added a **Characterize** stage before the traditional Design–Build–Test–Learn (*DBTL*) cycle in synthetic biology. This stage translates information about biological structures and mechanisms into specific design requirements. As AI becomes more involved in biological design, do you think it is necessary to establish a separate Characterize stage to define the biological problem, mechanism of action, and design criteria before starting Design?

**Li Chunjiang**

I think it is very necessary. I previously tried to reproduce a diffusion-based molecular generation model developed at Tsinghua University. It gradually generated molecular structures through repeated noise addition and removal. One major problem I encountered was that, although the final result appeared to pass various numerical checks—such as hydrophobicity, molecular geometry, and bond lengths—I still did not really understand what the generated molecule was meant to do. I was looking at a set of numbers without a clear biological purpose.

I think a Characterize stage is needed to introduce meaningful constraints. Otherwise, a generative model may produce many results that look acceptable according to computational metrics but have no clear practical value.

---

**GreatBay-SCIE 2026**

How would you distinguish Characterize from the traditional Design stage? Is Characterize worth establishing as an independent stage, or is it simply preliminary work already included in Design?

**Li Chunjiang**

I would separate the two stages into **defining the problem** and **solving the problem**. Characterize should answer questions such as: What are we trying to design? Why should we design it this way? What conditions must be satisfied for the design to count as successful?

Design would then focus on generating candidate sequences or structures under those established constraints. That is how I would distinguish them.

---

**GreatBay-SCIE 2026**

What should a complete Characterize stage produce? Among target mechanisms, structural information and confidence, design constraints, success criteria, and potential risks, which factors must be clarified before entering AI-assisted design?

**Li Chunjiang**

I think **structural confidence, hard constraints, and hypotheses about the mechanism** are especially important. You also need verifiable criteria for success and rejection.

Without standards that can actually be tested, it becomes too easy to judge a result as successful after seeing it. We need a way to determine whether Characterize genuinely helped guide the design, rather than simply accepting a result that happened to meet expectations through a stochastic generation process.

---

**GreatBay-SCIE 2026**

In the future, AI may be able to generate candidate solutions directly from a biological problem. Will Characterize become more important, or could it be integrated into AI? Do you think a Characterize–Design–Build–Test–Learn (CDBTL) approach could be extended to other AI4S projects?

**Li Chunjiang**

I do not think Characterize will disappear as AI becomes more powerful. Instead, it may become a process in which researchers and AI work together to define requirements. For example, AI might help translate natural-language descriptions into candidate constraints, objectives, and validation criteria.

I think the CDBTL approach could also be applied to small-molecule design, materials, peptide design, and antibody design. These fields share a general problem: first define what needs to be achieved, then generate candidates and validate them. So I think the approach has fairly broad potential.

---

**GreatBay-SCIE 2026**

Several experts we interviewed previously emphasized that *de novo* proteins lack the long-term exposure and use history of naturally occurring proteins and therefore require systematic safety evaluation. Compared with modified natural proteins, do *de novo* proteins have particular safety concerns? Which risks are suitable for initial computational screening?

**Li Chunjiang**

*De novo* proteins lack a long history of exposure and evolution, and their sequences and surface properties may fall outside the usual distribution of natural proteins. I would pay particular attention to properties such as unusual stability, degradability, and immunogenicity.

For early computational assessment, possible considerations include physicochemical properties, known off-target interactions, structural stability, aggregation tendencies, and potential immune epitopes. Cytotoxicity and broader systemic effects also matter, although they are more complex to assess.

---

**GreatBay-SCIE 2026**

Is *in silico* screening more suitable for eliminating high-risk candidates, or can it demonstrate that a protein is relatively safe? How can researchers avoid overlooking risks or developing a false sense of security because a model did not detect them?

**Li Chunjiang**

*In silico* screening cannot cover every safety issue. I think it should serve as an initial filtering step. You can set certain hard criteria or thresholds and reject candidates that fail to meet them. The remaining candidates would still need additional analyses and wet-lab experiments to assess risks that computational screening alone cannot resolve.

---

**GreatBay-SCIE 2026**

Could we establish an *in silico* safety-screening workflow to make preliminary assessments of off-target binding, immunogenicity, allergenicity, toxicity, stability, and degradation? Are there any additional modules you think should be prioritized?

**Li Chunjiang**

I think establishing such a screening step would be worthwhile. However, I cannot confidently recommend specific additional modules at the moment. My own experience has been more focused on particular indicators and metrics, so I would rather not speculate about areas I am less familiar with.

---

**GreatBay-SCIE 2026**

Many existing protein safety assessments follow testing procedures developed for conventional medicines. Could wet-lab testing workflows for *de novo* proteins be adapted to their intended use and exposure conditions, retaining the essential tests while avoiding clearly irrelevant ones?

**Li Chunjiang**

Yes, I think that would be possible.

---

**GreatBay-SCIE 2026**

How should computational screening connect with wet-lab experiments? For example, which computational findings should lead to immediate rejection of a candidate, and which should instead trigger more targeted experimental tests?

**Li Chunjiang**

If a candidate has a known high-risk sequence, shows severe aggregation or insolubility, clearly violates the intended design mechanism, or has strong and reproducible evidence of off-target effects, I would consider rejecting it directly.

If the results instead suggest possible immunogenicity, weaker off-target effects, or uncertain conformations, those findings could guide targeted wet-lab experiments to investigate the concerns further.

---

**GreatBay-SCIE 2026**

If we cannot develop a complete safety-screening platform at present, would a *de novo* protein safety-screening guide still be valuable to other teams? What would make such a guide useful?

**Li Chunjiang**

I think it would be very valuable—even for me personally. When I generate a candidate molecule, I would like a single interface where I can input the results I already have and receive screening indicators, along with explanations of what those indicators mean and how they might be interpreted together.

At present, the available open-source screening websites and tools are rather scattered. Each may evaluate only a few metrics, and often it just gives you a number without explaining how to interpret the overall result. A resource that brings these assessments together and helps users understand them would be very useful.

---

**GreatBay-SCIE 2026**

When discussing the ownership of AI-assisted research outcomes, should we distinguish among publication authorship, patent inventorship, ownership of research results, and rights to use model outputs?

**Li Chunjiang**

Yes, I think those should be distinguished. They involve different kinds of contributions and responsibilities. For example, patent inventorship focuses on contributions to the inventive concept reflected in patent claims. Publication authorship is concerned with academic contributions and responsibility for the research. Ownership of intellectual property or research outputs may also depend on employment arrangements, contracts, or assignments.

If these issues are not distinguished, the process can become confusing and potentially open to misuse.

---

**GreatBay-SCIE 2026**

Suppose a model developer provides a general-purpose model, a researcher selects the target, sets parameters, and screens sequences, and an experimental researcher modifies key sites and obtains a functional protein. How should these three contributors receive recognition or authorship?

**Li Chunjiang**

I think recognition should depend on records of each person's actual scientific contribution. Someone who contributes to the project's methodology, design, or interpretation may qualify for authorship. Establishing meaningful constraints or a screening strategy can be a substantial scientific contribution. Experimental researchers who perform experiments, carry out iterations, and help produce the final result should also receive appropriate recognition.

---

**GreatBay-SCIE 2026**

Should a researcher who merely enters a simple prompt and accepts the model's output receive the same credit as someone who conducts multiple rounds of analysis, screening, and modification?

**Li Chunjiang**

I do not think they should automatically be treated equally. What matters is whether the researcher posed an important scientific question, contributed to understanding the mechanism, interpreted the results, and took responsibility for the work.

If someone only enters a simple instruction and accepts the output, that looks more like using a tool than making a substantive contribution to the research design.

---

**GreatBay-SCIE 2026**

AI models may be trained on protein data from publicly accessible papers and databases. Does public access mean those data can be used for training without restriction? Should the original data contributors receive attribution or other benefits?

**Li Chunjiang**

I think there are many different kinds of licenses, and the conditions vary. Some allow users to access and train or modify a model, while others impose restrictions on what can be done with it. On platforms such as GitHub, developers often state these conditions in the relevant license.

The important point is that access and permitted use depend on the applicable terms. The rules cannot simply be assumed to be the same for all public resources.

---

**GreatBay-SCIE 2026**

To reduce future disputes over authorship and ownership, should AI4S teams preserve records of model versions, inputs, parameters, screening decisions, and manual modifications? Which records are particularly useful for demonstrating individual contributions?

**Li Chunjiang**

Yes, I think keeping these records is important. You should document the model and weight versions, code versions, and dataset versions. You should also preserve the constraints and settings used, random seeds, and relevant hyperparameters such as batch size, number of training epochs, and learning rate, along with the training strategy.

The reasons for selecting or rejecting candidates should also be recorded, as should experimental batches and the conditions and structures used in subsequent tests. These records help show how the work developed and what specific decisions were made.

---

**GreatBay-SCIE 2026**

Given the current state of the technology, what limitations of AI protein design are most easily overlooked? Is the main problem insufficient training data, a lack of negative results, biased model evaluations, or the difficulty of simulating complex biological environments?

**Li Chunjiang**

I think a major limitation is the gap between computational evaluations and real biological environments. Even if a molecule scores very well according to a carefully designed computational evaluation system, it may behave differently in a cellular environment.

Factors such as immune responses and metabolism can change the outcome. So even when computational screening identifies promising candidates, substantial wet-lab testing and time may still be needed to establish whether they work as intended and can progress to the next stage.

---

**GreatBay-SCIE 2026**

As AI becomes increasingly capable of proposing hypotheses, generating candidates, performing computational validation, and analyzing results, what role of human researchers do you think will remain the hardest to replace?

**Li Chunjiang**

AI tools are already very powerful and can take over a large amount of work. But I do not think they can replace the researcher's role in deciding what is worth investigating, proposing new hypotheses, and developing new ideas.

AI systems mainly draw on existing knowledge and training data. In my view, researchers remain important because they can use existing results to make judgments and develop ideas that go beyond what is already known.

---

**GreatBay-SCIE 2026**

Could the development of AI4S make research increasingly dependent on a small number of platforms that control data, computing resources, and models? How might that concentration affect openness and innovation in science?

**Li Chunjiang**

I think that is a real possibility. When I was at university, our laboratory had only a couple of RTX 3090 GPUs. I sometimes had to pay out of pocket to rent cloud servers because the laboratory could not reimburse those costs. In my current working environment, access to much more powerful computing resources makes tasks that were previously expensive and time-consuming much easier.

Computing resources create a significant gap between institutions. Some groups cannot even train certain models, while better-resourced groups can run larger experiments, use larger datasets, and produce more results. Those results may then help them obtain still more resources. I worry that this can become a cycle in which research opportunities increasingly depend on financial and computational capacity.

---

**GreatBay-SCIE 2026**

Over the next few years, what should AI4S prioritize: stronger generative models, more reliable validation systems, more transparent research records, or clearer ethical and governance standards?

**Li Chunjiang**

At present, I think transparent and reliable validation is especially important. I am concerned about situations in which a model is presented as having discovered a successful molecule even though that molecule was already known or validated beforehand. Without transparent evidence, it becomes difficult to tell whether a model genuinely produced the reported result.

If every model claims excellent performance but the claims cannot be independently checked, those evaluations are not very meaningful. That is why I think transparent, trustworthy validation is necessary.

---

**GreatBay-SCIE 2026**

Considering our CDBTL framework and decision-gated workflow, what do you think is our most important contribution to AI4S, and what should we improve further?

**Li Chunjiang**

I think the key area for improvement is **quantification**. You need to translate the requirements derived from biological mechanisms into clearly defined standards. For example, you should specify which conditions lead to rejection, what thresholds apply, how uncertain results are handled, and when a candidate is allowed to move to the next stage.

Setting these criteria precisely may be difficult and time-consuming, but I think it is important.

---

**GreatBay-SCIE 2026**

Those are all our questions. Thank you very much for your time and for sharing your perspectives with us.

**Li Chunjiang**

Thank you.
