---
title: "Development"
description: "FoundryUI architecture, custom node development, artifact registration, and workflow APIs."
hasReference: false
order: 4
---

## Architecture

The Nuxt and Vue frontend renders the BaklavaJS graph and 3Dmol.js viewer. FastAPI provides workflow, run, session, event, and artifact endpoints. RyvenCore executes validated graphs. Node classes call biological helpers or external-tool adapters and register their outputs in the artifact store.

<!-- Illustration pending: illustration of the frontend, FastAPI, workflow runtime, node classes, external tools, and artifact store. -->

## Adding a node

Create a Python file under `backend/nodes/<category>/` and subclass the relevant category base class. Define:

- a stable `type_name`, title, and description;

- typed input and output ports;

- validated options;

- an asynchronous `execute` method returning `TypedPayload` objects.

```python
from backend.nodes.scoring.base import ScoringNode
from backend.workflow.catalog import PortSpec as P

class CountStructures(ScoringNode):
    type_name = "CountStructures"
    title = "Count Structures"
    description = "Count structures in an input batch."
    inputs = (P("structures", "Batch Protein", label="Structures"),)
    outputs = (P("score", "Score", label="Score"),)

    @classmethod
    async def execute(cls, ctx, node, inputs):
        # Create and register a Score artifact, then return a TypedPayload.
        ...
```

Register every output file through the execution context. Batch nodes must preserve item order and alignment with scores.

## APIs

External clients can get node lists with `GET /api/nodes`, validate workflows with `POST /api/workflows/validate`, create runs with `POST /api/runs`, follow Server-Sent Events, and download outputs.
