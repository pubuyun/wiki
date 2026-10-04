---
title: "Installation"
description: "Install FoundryUI on Linux, use hosted GPU environments, and verify a new installation."
hasReference: false
order: 2
---

## Local Linux installation

FoundryUI requires Linux, Git, `curl`, npm, and Node.js 20 or newer. Models require an NVIDIA GPU and compatible CUDA-enabled PyTorch. Model checkpoints require additional disk space of about 10 GB.

The automatic setup installs a local Python 3.12 environment, backend packages, _Foundry_, model checkpoints, and frontend dependencies:

```bash
git clone https://gitlab.igem.org/2026/software/greatbay-scie/foundryui.git
cd foundryui
chmod +x setup.sh
./setup.sh
chmod +x install-foundryui.sh
./install-foundryui.sh
```

Start the application:

```bash
./run-foundryui-service.sh
```

Open `http://127.0.0.1:3000`. The backend API runs at `http://127.0.0.1:3000/api`.

<!-- Illustration pending: image of the FoundryUI header with the API endpoint and green connection-status dot. -->

## Hosted options

The shared [FoundryUI AutoDL image](https://www.autodl.art/i/pubuyun/FoundryUI/FoundryUI) provides a prepared GPU environment.

The [FoundryUI Colab notebook](https://colab.research.google.com/drive/1D6h8yXTDaWO5cN0eClfx7FMFXIZ_t4N3) provides a free quick trial. Use conservative batch sizes and download workflows and archives before the temporary session ends.

We also adapted _RF3_ to the compute capability of a free-tier NVIDIA T4 GPU.

<!-- Illustration pending: image of the Colab notebook running FoundryUI with a T4 GPU selected. -->

## Verification

```bash
curl http://127.0.0.1:8000/health
source .venv/bin/activate
python -m pytest backend/tests/test_health.py backend/tests/test_validation.py -q
cd frontend
npm run typecheck
```

Test a small workflow before a large GPU run. Missing checkpoints or executables are reported as structured node errors.
