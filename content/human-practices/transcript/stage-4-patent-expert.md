---
title: "Interview with Mr. Wang Boxiang"
topic: "Intellectual property protection for AI-designed proteins, patent scope and reproducibility, software copyright, and challenges posed by rapid technological development"
interviewee: "Mr. Wang Boxiang"
interviewers: "GreatBay-SCIE 2026"
hasReference: false
navigation: false
---


**GreatBay-SCIE 2026**

Can the input parameters used in protein design form part of patent protection, to prevent others from reproducing the work easily?

**Mr. Wang Boxiang**

I would not recommend relying on parameters unless they consistently produce the same, reproducible results. Otherwise, a patent examiner may object: if the same parameters produce different AI outputs each time, the examiner may consider those parameters ineffective.

Rather than trying to patent the process, why not protect it as a trade secret?

**GreatBay-SCIE 2026**

The process does not really seem secret. It feels as though the parameters are the only part we could protect.

**Mr. Wang Boxiang**

You can protect the final results.

**GreatBay-SCIE 2026**

Do you mean we should not apply for a patent?

**Mr. Wang Boxiang**

No. Your results are the proteins you have screened. Each functional protein you identify can be protected. The result can be protected, even if the process cannot.

**GreatBay-SCIE 2026**

But would it not be easy for others to reproduce the work by running the same parameters?

**Mr. Wang Boxiang**

You would already have protection for the proteins you want.

We have worked on something similar. In one enzyme engineering project, molecular docking identified several important sites and a key loop. We exhaustively explored three sites, each with 20 possible amino acids, giving 20 cubed possible combinations. We then selected roughly 20 of the best combinations and listed their amino acid substitutions.

We initially wanted to protect all proteins containing possible substitutions at those three positions. The examiner said that we could not claim such a broad scope. We could only protect the sequences shown to be most effective in our experiments. At most, we could specify the supported amino acid alternatives at particular positions.

Protection had to be based on the results we had actually obtained. It could not be unlimited.

**GreatBay-SCIE 2026**

For a protein designed de novo, protecting only a few positions or exhaustively enumerating substitutions would not really apply.

**Mr. Wang Boxiang**

If you design the protein de novo, you can protect the whole protein.

**GreatBay-SCIE 2026**

What if someone uses the same tools and happens to obtain a result by chance?

**Mr. Wang Boxiang**

You cannot prevent other people from making discoveries by chance. The patent system also has to preserve room for others to do that.

**GreatBay-SCIE 2026**

You mentioned that AI-related work can be difficult to patent.

**Mr. Wang Boxiang**

In my view, there is a gap in the system because AI is developing so quickly. The central tension is that technological development is rapid, while examination systems lag behind. I think the patent examination system has clear problems and loopholes.

I have discussed this since ProteinMPNN emerged. Once it became publicly available, pharmaceutical companies could use it to redesign existing enzymes or proteins while preserving the key functional residues.

For example, an older patent might claim sequences with more than 80% similarity. Someone could use ProteinMPNN to reduce similarity to 79% while retaining the same function, then attempt to apply for a patent.

**GreatBay-SCIE 2026**

That is one of the main issues we wanted to discuss.

**Mr. Wang Boxiang**

At present, I do not think there is a way to eliminate this entirely. However, the redesigned product would need additional advantages to obtain its own patent. Simply achieving the same effect with a similar protein might not be enough.

For example, suppose you develop a drug and I make a similar protein with only 70% sequence similarity, outside a claim covering sequences above 85% similarity. An examiner might still reject my patent because the invention was clearly suggested by yours.

However, in that example, I might still take the protein into clinical development because it falls outside your patent's claimed scope. Even without my own patent, it might eventually receive approval. I see this as one way developers can work around existing patents.

Patents do not prevent every possible workaround. Resourceful competitors may find ways around them.

Their core value is that, when you have clear evidence that another company has infringed a protected part of your invention, you have a basis for legal action. That might involve an identical component, a protected production method, or another element covered by your claims.

**GreatBay-SCIE 2026**

So patents at least increase the cost of copying.

**Mr. Wang Boxiang**

They force others to proceed more carefully. Suppose you invent a drug and discover a similar product on the market. You buy it, analyze it, and find a component or clear evidence of a production technology covered by your patent. That evidence could support an infringement claim and potentially substantial compensation, in the tens or hundreds of millions of RMB.

A patent is a tool for defending your legal interests when they are infringed. It is not an absolute wall that simply prevents everyone else from working in the area.

This is why I talk about both offense and defense. If you enter a field dominated by major players without patents of your own, you may face lawsuits. Having your own patents gives you something to use in your defense and may make others examine your position more carefully before suing.

I have seen companies around me become involved in such disputes. One example I mentioned was a dispute involving BGI, its sequencing-equipment subsidiary MGI, and Oxford Nanopore Technologies, which developed early third-generation sequencing instruments.

My view was that there were substantial similarities between the equipment. I previously worked at BGI, and I believed the similarities went beyond 70%. The company's position, however, was that it had its own technology: the equipment might look similar, but the underlying chip technology was its own.

The point I was making is that a company with its own technology and patent portfolio can present that technology when challenged and argue that its product is based on its own work.

**GreatBay-SCIE 2026**

Those are most of our questions so far.

**Mr. Wang Boxiang**

The key distinction is that an abstract concept or proposal cannot itself become a patent. Specific technical details and technical results can be protected.

Since your approach largely combines existing workflows, another option to consider is software copyright. Your code, parameter settings, and the way your software calls those parameters could form part of a software copyright registration. That is also a form of intellectual property protection, although I consider its protection more limited than that of an invention patent.

For an invention patent, focus on the results: the binders or inhibitors you have obtained. You may not be able to protect every possible result.

For example, if you submit five binders with similar outcomes and one performs clearly better, the examiner may ask whether protection should be limited to that one. We have encountered this, and it can be frustrating. Patent rules, both in China and overseas, have not kept pace with emerging technologies.

**GreatBay-SCIE 2026**

Why are the rules not updated more quickly?

**Mr. Wang Boxiang**

Legal updates are very slow.

**GreatBay-SCIE 2026**

Would that difference in speed significantly restrict further technological progress?

**Mr. Wang Boxiang**

Honestly, I do not think so. Many inventions and new technologies ultimately do not create practical value.

A technology may become a patent without a downstream manufacturing process or business model capable of turning it into a product. In that situation, the patent can instead become an obstacle for people who later want to enter the field.

**GreatBay-SCIE 2026**

After this discussion, we understand the issues better, but we are still unsure what improvements or future actions we could propose.

**Mr. Wang Boxiang**

You could raise the question of whether patent examination rules need to change.

**GreatBay-SCIE 2026**

In what directions, for example?

**Mr. Wang Boxiang**

Consider a situation in which two teams independently use the same AI workflow to generate different proteins or enzymes. The process is the same, but the outputs are different. How should new drugs or biological products be protected when AI tools make this possible?

That becomes very complex. We have brought out some of that complexity today, and you can reflect on it. Under the current systems in China and the United States, my concern is that these workflows cannot be protected even when they are central to the work.

Another question is whether this could lead to new forms of patent monopoly. Teams with substantial computing resources, large facilities, and robots performing experiments could continuously generate new proteins and drugs.

What happens to people who have technical ideas but lack that computing power? Could better-resourced players restrict their access to computing resources or buy exclusive control over an area, leaving others unable to work in it? Could this become a form of technological domination? That is another worthwhile topic for debate.

**GreatBay-SCIE 2026**

Another expert we interviewed raised similar points. There seem to be benefits and drawbacks on both sides, which makes it difficult to decide what to do next.

**Mr. Wang Boxiang**

I think that is fine. In iGEM, you do not necessarily have to produce a definitive solution that convinces everyone. Bringing the topic into discussion and identifying ideas or possible directions is already valuable.

iGEM encourages diverse perspectives. Raising these questions and creating discussion or debate has considerable value in itself.

I have also clearly told Ms. Zhu that we should prepare the patent disclosure and submit the application as soon as possible. Please provide a list of the inventors. We will try to secure protection for these enzymes during this year's competition season.

**GreatBay-SCIE 2026**

Thank you for your time and advice.
