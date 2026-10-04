# Software document migration

Converted all 8 source Markdown files from `assets/software` into `content/software`. Original source files and attachments were retained. Folder and file names are lowercase, with spaces replaced by hyphens. The directory-level Example Workflows document is now `example-workflows/index.md`.

Updated metadata, grammar, code transcription, links, figure captions, and two table captions. Added 13 glossary entries and first-occurrence annotations. General biological and chemical terms, including chirality and de novo protein design, are excluded. Definitions are independent of the project. Software entries link to official GitHub repositories; file-format entries link to Wikipedia; specialized confidence metrics and RFdiffusion3 contig syntax link to authoritative explanations. The RFdiffusion3 contig entry uses a qualified name rather than the general biological term contig. Completed the original unfinished Foundry citation as `^1` and added a Vancouver Reference page using the [official Foundry repository](https://github.com/RosettaCommons/foundry). Existing destination pages contain no custom MDC components. No source material requires a four-panel layout.

## Uploaded attachments

All 6 attachments were uploaded sequentially to `drylab/software/`. No subfolders or overwrites were used. Images were not visually inspected.

| Source attachment                                         | Actual stored CDN URL                                                                                                                                                       |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 图片和附件/FoundryUI/image.png                            | [software-foundryui-fig1.avif](https://static.igem.wiki/teams/6133/wiki/drylab/software/software-foundryui-fig1.avif)                                                       |
| 图片和附件/Usage/image.png                                | [software-usage-fig1.avif](https://static.igem.wiki/teams/6133/wiki/drylab/software/software-usage-fig1.avif)                                                               |
| 图片和附件/Usage/image 1.png                              | [software-usage-fig2.avif](https://static.igem.wiki/teams/6133/wiki/drylab/software/software-usage-fig2.avif)                                                               |
| Example Workflows/图片和附件/Folding Prediction/image.png | [software-example-workflows-folding-prediction-fig1.avif](https://static.igem.wiki/teams/6133/wiki/drylab/software/software-example-workflows-folding-prediction-fig1.avif) |
| Example Workflows/图片和附件/Ligand Binder/image.png      | [software-example-workflows-ligand-binder-fig1.avif](https://static.igem.wiki/teams/6133/wiki/drylab/software/software-example-workflows-ligand-binder-fig1.avif)           |
| Example Workflows/图片和附件/Protein Binder/image.png     | [software-example-workflows-protein-binder-fig1.avif](https://static.igem.wiki/teams/6133/wiki/drylab/software/software-example-workflows-protein-binder-fig1.avif)         |

## Original placeholders requiring assets or a link

The following source instructions have no matching image attachment or URL. They remain as HTML comments in the converted documents.

- `development.md`: illustration of the frontend, FastAPI, workflow runtime, node classes, external tools, and artifact store.
- `example-workflows/folding-prediction.md`: image of a sequence input and optional ligand connected to RosettaFold3.
- `example-workflows/folding-prediction.md`: image of a predicted fold in the PDB Viewer beside its confidence scores.
- `example-workflows/ligand-binder.md`: image of ligand atoms selected in the Structure Viewer dialog.
- `example-workflows/ligand-binder.md`: image of generated ligand-binding candidates being compared in the PDB Viewer.
- `example-workflows/protein-binder.md`: image of hotspot residues and atoms highlighted on the target protein.
- `example-workflows/protein-binder.md`: illustration of target and generated binder sequences entering RosettaFold3 co-folding.
- `foundryui.md`: illustration of a protein-design workflow progressing from biological input to selected candidates.
- `foundryui.md`: image of school club members learning protein-design workflows with FoundryUI.
- `foundryui.md`: Link to education activity.
- `installation.md`: image of the FoundryUI header with the API endpoint and green connection-status dot.
- `installation.md`: image of the Colab notebook running FoundryUI with a T4 GPU selected.

## Validation

All 10 created or updated Markdown pages parsed successfully. The 8 source-to-destination mappings, 6 image references and figure captions, 13 glossary entries, 28 first-occurrence annotations, metadata, and both directions of the citation link passed validation. The corrected Python example also passed a syntax check. The [remote upload folder](https://teams.igem.org/6133/deliverables/wiki/uploads?path=drylab%2Fsoftware) lists all 6 stored AVIF files. Port 3000 was unavailable, so browser rendering was not verified. No Nuxt build was run and no development server was started.

## Lightbox caption update

Following `lightboximage.md`, all 6 captions now use quoted Markdown image titles instead of separate paragraphs. Figure numbering, alternative text, and image URLs are preserved. The first RosettaFold3 glossary annotation in Usage was moved into the adjacent introductory paragraph because captions are rendered as plain text. The existing development server on port 3000 was available for this update; its HTML responses confirmed that each caption renders once through LightboxImage. No images were visually inspected, no build was run, and no server was started.
