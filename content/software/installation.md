---
title: "Installation"
description: "Install FoundryUI locally on Linux or try prepared AutoDL and Google Colab environments."
hasReference: false
order: 2
---

## Local Linux installation

FoundryUI requires Linux, Git, `curl`, npm, and Node.js 20 or newer. Models require an NVIDIA GPU and compatible _CUDA_-enabled _PyTorch_. Model checkpoints require additional disk space of about 10 GB.

The automatic setup installs a local Python 3.12 environment, backend packages, _Foundry_, model checkpoints, and frontend dependencies:

```bash
git clone https://gitlab.igem.org/2026/software/greatbay-scie/foundryui.git
cd FoundryUI
chmod +x setup.sh
./setup.sh
chmod +x install-foundryui.sh
./install-foundryui.sh
```

Start the application:

```bash
./run-foundryui-service.sh
```

Open `http://127.0.0.1:3000`; the backend API runs at `http://127.0.0.1:3000/api`.

::content-components-lightbox-image
---

src:

- https://static.igem.wiki/teams/6133/wiki/drylab/software/software-installation-fig1.avif
  alt: ""
  caption: "Fig. 1 | FoundryUI header showing the API endpoint and green connection-status dot, session and workflow controls, Presets list, and Run button."

---

::

## Hosted options

The shared [FoundryUI _AutoDL_ image](https://www.autodl.art/i/pubuyun/FoundryUI/FoundryUI) provides a prepared GPU environment.

The [FoundryUI _Colab_ notebook](https://colab.research.google.com/drive/1D6h8yXTDaWO5cN0eClfx7FMFXIZ_t4N3) provides a free quick trial. Use conservative batch sizes and download workflows and archives before the temporary session ends.

We also adapted _RF3_ to the compute capability of a free-tier NVIDIA T4 GPU.

::content-components-lightbox-image
---

src:

- https://static.igem.wiki/teams/6133/wiki/drylab/software/software-installation-fig2.avif
  alt: "A dark-themed Google Colab notebook displaying setup and execution code cells."
  caption: "Fig. 2 | FoundryUI running in Google Colab."

---

::

## Verification

```bash
curl http://127.0.0.1:8000/health
source .venv/bin/activate
python -m pytest backend/tests/test_health.py backend/tests/test_validation.py -q
cd frontend
npm run typecheck
```

Test a small workflow before a large GPU run. Missing checkpoints or executables are reported as structured node errors.
