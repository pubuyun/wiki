---
title: MD Simulation
description: Membrane simulation, structural analysis, and binding-energy evaluation.
order: 330
---

## Membrane System Preparation

::code-group
---
default-value: "0"
label: CHARMM-GUI membrane system configuration
sync: transporter-binder-membrane-system
---
```dict [Summary]
{
  "System Type": "MP",
  "Input Structure": "rank_04_config_peptsh_if_13_model_0_b0_d1.pdb",
  "Membrane": "POPG in both leaflets",
  "Ions": "NaCl",
  "Force Field and Engine": "CHARMM36m with GROMACS",
  "Temperature": "310 K"
}
```

```JSON [Configuration]
{
  "system_type": {
    "system_type": "MP"
  },
  "system_info": {
    "headless": true,
    "path_out": "./gmx/rank04/"
  },
  "details": {
    "path": "C:\\Users\\wzh_z\\Documents\\CharmmGuiAuto\\structures",
    "file_name": "rank_04_config_peptsh_if_13_model_0_b0_d1.pdb",
    "protonations": [
      {
        "chain": "PROA",
        "res_i": "GLU",
        "rid": "418",
        "res_p": "GLUP"
      },
      {
        "chain": "PROA",
        "res_i": "GLU",
        "rid": "33",
        "res_p": "GLUP"
      }
    ],
    "orientation": {
      "option": "Principal"
    },
    "lengthXY": {
      "option": "ratio",
      "value": 90
    },
    "lipids": [
      {
        "lipid": "popg",
        "upper": 1,
        "lower": 1
      }
    ],
    "ions": "NaCl",
    "ff": "c36m",
    "engine": "gmx",
    "temp": 310
  }
}
```
::

## Molecular Dynamics

::code-group{defaultValue="0" sync="transporter-binder-md-workflow" label="Workflow and source code"}

```graph [Workflow]
{
  "nodes": [
    {
      "id": "start",
      "type": "start",
      "label": "Start"
    },
    {
      "id": "configure",
      "type": "input",
      "label": "Configure GROMACS and production settings"
    },
    {
      "id": "minimize",
      "type": "subprocess",
      "label": "Minimize system energy"
    },
    {
      "id": "equilibrate",
      "type": "loop",
      "label": "Run next equilibration step"
    },
    {
      "id": "more-equilibration",
      "type": "decision",
      "label": "More equilibration steps?"
    },
    {
      "id": "produce",
      "type": "loop",
      "label": "Run next production segment"
    },
    {
      "id": "more-production",
      "type": "decision",
      "label": "More production segments?"
    },
    {
      "id": "collect",
      "type": "document",
      "label": "Collect final structures and checkpoints"
    },
    {
      "id": "concatenate",
      "type": "subprocess",
      "label": "Concatenate trajectories with continuous time"
    },
    {
      "id": "complete",
      "type": "end",
      "label": "Complete"
    }
  ],
  "edges": [
    {
      "id": "start-configure",
      "source": "start",
      "target": "configure"
    },
    {
      "id": "configure-minimize",
      "source": "configure",
      "target": "minimize"
    },
    {
      "id": "minimize-equilibrate",
      "source": "minimize",
      "target": "equilibrate"
    },
    {
      "id": "equilibrate-more",
      "source": "equilibrate",
      "target": "more-equilibration"
    },
    {
      "id": "more-equilibration-yes",
      "source": "more-equilibration",
      "target": "equilibrate",
      "label": "Yes",
      "type": "loop"
    },
    {
      "id": "more-equilibration-no",
      "source": "more-equilibration",
      "target": "produce",
      "label": "No"
    },
    {
      "id": "produce-more",
      "source": "produce",
      "target": "more-production"
    },
    {
      "id": "more-production-yes",
      "source": "more-production",
      "target": "produce",
      "label": "Yes",
      "type": "loop"
    },
    {
      "id": "more-production-no",
      "source": "more-production",
      "target": "collect",
      "label": "No"
    },
    {
      "id": "collect-concatenate",
      "source": "collect",
      "target": "concatenate"
    },
    {
      "id": "concatenate-complete",
      "source": "concatenate",
      "target": "complete"
    }
  ]
}
```

```bash [run_md.sh]
#!/usr/bin/env bash
set -euo pipefail

GMX=${GMX:-gmx}

INIT=step5_input
REST_PREFIX=step5_input
MINI=step6.0_minimization
EQUI_PREFIX=step6
PROD_MDP=step7_production
PROD_PREFIX=step7

RUN_DIR=run
STEP6_DIR="${RUN_DIR}/step6"
STEP7_DIR="${RUN_DIR}/step7"
RESULT_DIR="${RUN_DIR}/result"

PROD_NSEG=${PROD_NSEG:-10}
PROD_SEGMENT_NS=${PROD_SEGMENT_NS:-1}

NTMPI=${NTMPI:-1}
NTOMP=${NTOMP:-32}
export OMP_NUM_THREADS=${NTOMP}
export GMX_MAXBACKUP=${GMX_MAXBACKUP:--1}

MDRUN_OPTS=${MDRUN_OPTS:-"-ntmpi ${NTMPI} -ntomp ${NTOMP} -nb gpu -pme gpu -bonded gpu -update gpu"}

mkdir -p "${STEP6_DIR}/0" "${RESULT_DIR}"

TOTAL_NS=$(awk -v n="${PROD_NSEG}" -v seg="${PROD_SEGMENT_NS}" 'BEGIN { printf "%.6g", n * seg }')

echo "Using GROMACS command: ${GMX}"
${GMX} --version

echo
echo "=== Production setting: ${PROD_NSEG} x ${PROD_SEGMENT_NS} ns = ${TOTAL_NS} ns ==="

echo
echo "=== Step 6.0: energy minimization ==="

MINI_OUT="${STEP6_DIR}/0/${MINI}"

${GMX} grompp \
    -f "${MINI}.mdp" \
    -o "${MINI_OUT}.tpr" \
    -c "${INIT}.gro" \
    -r "${REST_PREFIX}.gro" \
    -p topol.top \
    -n index.ndx

${GMX} mdrun \
    -v \
    -deffnm "${MINI_OUT}" \
    -ntmpi "${NTMPI}" \
    -ntomp "${NTOMP}"

echo
echo "=== Step 6.1-6.6: equilibration ==="

for i in $(seq 1 6); do
    mkdir -p "${STEP6_DIR}/${i}"

    ISTEP="${EQUI_PREFIX}.${i}_equilibration"
    ISTEP_OUT="${STEP6_DIR}/${i}/${ISTEP}"

    if [ "${i}" -eq 1 ]; then
        PSTEP_GRO="${MINI_OUT}.gro"
    else
        PREV=$((i - 1))
        PSTEP_GRO="${STEP6_DIR}/${PREV}/${EQUI_PREFIX}.${PREV}_equilibration.gro"
    fi

    echo
    echo "--- Running ${ISTEP}, starting from ${PSTEP_GRO} ---"

    ${GMX} grompp \
        -f "${ISTEP}.mdp" \
        -o "${ISTEP_OUT}.tpr" \
        -c "${PSTEP_GRO}" \
        -r "${REST_PREFIX}.gro" \
        -p topol.top \
        -n index.ndx

    ${GMX} mdrun \
        -v \
        -deffnm "${ISTEP_OUT}" \
        ${MDRUN_OPTS}
done

echo
echo "=== Step 7: production MD, ${PROD_NSEG} x ${PROD_SEGMENT_NS} ns = ${TOTAL_NS} ns ==="

for i in $(seq 1 "${PROD_NSEG}"); do
    mkdir -p "${STEP7_DIR}/${i}"

    ISTEP="${PROD_PREFIX}_${i}"
    ISTEP_OUT="${STEP7_DIR}/${i}/${ISTEP}"

    echo
    echo "--- Running production segment ${i}/${PROD_NSEG}: ${ISTEP} ---"

    if [ "${i}" -eq 1 ]; then
        PSTEP_GRO="${STEP6_DIR}/6/${EQUI_PREFIX}.6_equilibration.gro"

        ${GMX} grompp \
            -f "${PROD_MDP}.mdp" \
            -o "${ISTEP_OUT}.tpr" \
            -c "${PSTEP_GRO}" \
            -p topol.top \
            -n index.ndx
    else
        PREV=$((i - 1))
        PSTEP_OUT="${STEP7_DIR}/${PREV}/${PROD_PREFIX}_${PREV}"

        ${GMX} grompp \
            -f "${PROD_MDP}.mdp" \
            -o "${ISTEP_OUT}.tpr" \
            -c "${PSTEP_OUT}.gro" \
            -t "${PSTEP_OUT}.cpt" \
            -p topol.top \
            -n index.ndx
    fi

    ${GMX} mdrun \
        -v \
        -deffnm "${ISTEP_OUT}" \
        ${MDRUN_OPTS}
done

echo
echo "=== Collecting results ==="

cp "${INIT}.gro" "${RESULT_DIR}/initial_${INIT}.gro"

if [ -f "${INIT}.pdb" ]; then
    cp "${INIT}.pdb" "${RESULT_DIR}/initial_${INIT}.pdb"
fi

FINAL_OUT="${STEP7_DIR}/${PROD_NSEG}/${PROD_PREFIX}_${PROD_NSEG}"

cp "${FINAL_OUT}.gro" "${RESULT_DIR}/${PROD_PREFIX}_${PROD_NSEG}.gro"
cp "${FINAL_OUT}.tpr" "${RESULT_DIR}/${PROD_PREFIX}_${PROD_NSEG}.tpr"
cp "${FINAL_OUT}.edr" "${RESULT_DIR}/${PROD_PREFIX}_${PROD_NSEG}.edr"
cp "${FINAL_OUT}.cpt" "${RESULT_DIR}/${PROD_PREFIX}_${PROD_NSEG}.cpt"

echo
echo "=== Concatenating production trajectories with continuous time ==="

XTC_FILES=()
SETTIME_INPUT=""

for i in $(seq 1 "${PROD_NSEG}"); do
    XTC_FILES+=("${STEP7_DIR}/${i}/${PROD_PREFIX}_${i}.xtc")

    START_PS=$(awk -v i="${i}" -v ns="${PROD_SEGMENT_NS}" 'BEGIN { printf "%.6f", (i - 1) * ns * 1000 }')
    SETTIME_INPUT="${SETTIME_INPUT}${START_PS}\n"
done

MERGED_XTC="${RESULT_DIR}/${PROD_PREFIX}_1-${PROD_NSEG}.xtc"

printf "%b" "${SETTIME_INPUT}" | \
    ${GMX} trjcat \
        -f "${XTC_FILES[@]}" \
        -o "${MERGED_XTC}" \
        -settime

echo
echo "=== Done ==="
echo "Organized run files are under:"
echo "  ${RUN_DIR}/"
echo
echo "Result files are under:"
echo "  ${RESULT_DIR}/"
echo
echo "Important outputs:"
echo "  ${RESULT_DIR}/initial_${INIT}.gro"
echo "  ${MERGED_XTC}"
echo "  ${RESULT_DIR}/${PROD_PREFIX}_${PROD_NSEG}.gro"
echo "  ${RESULT_DIR}/${PROD_PREFIX}_${PROD_NSEG}.tpr"
```

::

## RMSD Analysis

::code-group{defaultValue="0" sync="transporter-binder-rmsd-workflow" label="Workflow and source code"}

```graph [Workflow]
{
  "nodes": [
    {
      "id": "start",
      "type": "start",
      "label": "Start"
    },
    {
      "id": "detect",
      "type": "input",
      "label": "Detect the latest production segment"
    },
    {
      "id": "validate",
      "type": "process",
      "label": "Validate reference and trajectory files"
    },
    {
      "id": "index",
      "type": "subprocess",
      "label": "Build protein and CA index groups"
    },
    {
      "id": "center",
      "type": "subprocess",
      "label": "Correct PBC and center the trajectory"
    },
    {
      "id": "calculate",
      "type": "output",
      "label": "Calculate receptor, binder, and complex RMSD"
    },
    {
      "id": "complete",
      "type": "end",
      "label": "Complete"
    }
  ],
  "edges": [
    {
      "id": "start-detect",
      "source": "start",
      "target": "detect"
    },
    {
      "id": "detect-validate",
      "source": "detect",
      "target": "validate"
    },
    {
      "id": "validate-index",
      "source": "validate",
      "target": "index"
    },
    {
      "id": "index-center",
      "source": "index",
      "target": "center"
    },
    {
      "id": "center-calculate",
      "source": "center",
      "target": "calculate"
    },
    {
      "id": "calculate-complete",
      "source": "calculate",
      "target": "complete"
    }
  ]
}
```

```bash [calculate_rmsd.sh]
#!/usr/bin/env bash
set -euo pipefail

GMX=${GMX:-gmx}

RMSD_DIR="run/result/rmsd"
mkdir -p "${RMSD_DIR}"

REF="run/result/initial_step5_input.gro"
BASE_INDEX="index.ndx"

if [ -z "${PROD_NSEG:-}" ]; then
    PROD_NSEG=$(find run/result -maxdepth 1 -type f -name 'step7_*.gro' \
        | sed -E 's/.*step7_([0-9]+)\.gro/\1/' \
        | sort -n \
        | tail -n 1)
fi

if [ -z "${PROD_NSEG}" ]; then
    echo "ERROR: Cannot detect PROD_NSEG from run/result/step7_*.gro"
    exit 1
fi

GRO="run/result/step7_${PROD_NSEG}.gro"
TPR="run/result/step7_${PROD_NSEG}.tpr"
XTC="run/result/step7_1-${PROD_NSEG}.xtc"

if [ ! -f "${REF}" ]; then
    echo "ERROR: Missing ${REF}"
    exit 1
fi

if [ ! -f "${GRO}" ]; then
    echo "ERROR: Missing ${GRO}"
    exit 1
fi

if [ ! -f "${TPR}" ]; then
    echo "ERROR: Missing ${TPR}"
    exit 1
fi

if [ ! -f "${XTC}" ]; then
    echo "ERROR: Missing ${XTC}"
    exit 1
fi

RMSD_INDEX="${RMSD_DIR}/rmsd_index.ndx"
XTC_CENTER="${RMSD_DIR}/step7_1-${PROD_NSEG}_pbc_center.xtc"

echo "Using:"
echo "  REF: ${REF}"
echo "  GRO: ${GRO}"
echo "  TPR: ${TPR}"
echo "  XTC: ${XTC}"
echo "  PROD_NSEG: ${PROD_NSEG}"

printf "splitch 0\nname 5 MembraneProtein\nname 6 Binder\n5 | 6\nname 7 Complex\n5 & a CA\nname 8 MembraneProtein_CA\n6 & a CA\nname 9 Binder_CA\n8 | 9\nname 10 Complex_CA\nq\n" | \
    "${GMX}" make_ndx \
        -f "${GRO}" \
        -n "${BASE_INDEX}" \
        -o "${RMSD_INDEX}"

echo
echo "=== PBC correction and centering ==="

printf "7\n4\n" | \
    "${GMX}" trjconv \
        -s "${TPR}" \
        -f "${XTC}" \
        -n "${RMSD_INDEX}" \
        -o "${XTC_CENTER}" \
        -pbc mol \
        -center \
        -ur compact

echo
echo "=== RMSD vs initial: MembraneProtein CA ==="
printf "8\n8\n" | \
    "${GMX}" rms \
        -s "${REF}" \
        -f "${XTC_CENTER}" \
        -n "${RMSD_INDEX}" \
        -o "${RMSD_DIR}/rmsd_membrane_protein_ca_vs_initial.xvg" \
        -tu ns

echo
echo "=== RMSD vs initial: Binder CA ==="
printf "9\n9\n" | \
    "${GMX}" rms \
        -s "${REF}" \
        -f "${XTC_CENTER}" \
        -n "${RMSD_INDEX}" \
        -o "${RMSD_DIR}/rmsd_binder_ca_vs_initial.xvg" \
        -tu ns

echo
echo "=== RMSD vs initial: Complex CA ==="
printf "10\n10\n" | \
    "${GMX}" rms \
        -s "${REF}" \
        -f "${XTC_CENTER}" \
        -n "${RMSD_INDEX}" \
        -o "${RMSD_DIR}/rmsd_complex_ca_vs_initial.xvg" \
        -tu ns

echo
echo "=== Done ==="
echo "RMSD outputs are in ${RMSD_DIR}/"
```

::

## MM/PBSA Binding Energy

::code-group{defaultValue="0" sync="transporter-binder-mmpbsa-workflow" label="Workflow and source code"}

```graph [Workflow]
{
  "nodes": [
    {
      "id": "start",
      "type": "start",
      "label": "Start"
    },
    {
      "id": "prepare",
      "type": "input",
      "label": "Prepare paths, groups, and output directories"
    },
    {
      "id": "check",
      "type": "process",
      "label": "Check GROMACS and gmx_MMPBSA"
    },
    {
      "id": "index",
      "type": "subprocess",
      "label": "Create receptor and ligand index groups"
    },
    {
      "id": "configure",
      "type": "document",
      "label": "Write the generalized Born input"
    },
    {
      "id": "calculate",
      "type": "subprocess",
      "label": "Run binding-energy calculation"
    },
    {
      "id": "results",
      "type": "output",
      "label": "Save DAT and CSV results"
    },
    {
      "id": "complete",
      "type": "end",
      "label": "Complete"
    }
  ],
  "edges": [
    {
      "id": "start-prepare",
      "source": "start",
      "target": "prepare"
    },
    {
      "id": "prepare-check",
      "source": "prepare",
      "target": "check"
    },
    {
      "id": "check-index",
      "source": "check",
      "target": "index"
    },
    {
      "id": "index-configure",
      "source": "index",
      "target": "configure"
    },
    {
      "id": "configure-calculate",
      "source": "configure",
      "target": "calculate"
    },
    {
      "id": "calculate-results",
      "source": "calculate",
      "target": "results"
    },
    {
      "id": "results-complete",
      "source": "results",
      "target": "complete"
    }
  ]
}
```

```bash [run_mmpbsa.sh]
#!/usr/bin/env bash
set -euo pipefail

GMX=${GMX:-gmx}

WORKDIR="run/mmpbsa"
RESULT_DIR="run/result"
mkdir -p "${WORKDIR}" "${RESULT_DIR}"

TPR="run/result/step7_10.tpr"
XTC="run/result/step7_1-10.xtc"
GRO="run/result/step7_10.gro"
TOP="topol.top"
BASE_INDEX="index.ndx"

MMPBSA_INDEX="${WORKDIR}/mmpbsa_index.ndx"
MMPBSA_IN="${WORKDIR}/mmpbsa.in"

RECEPTOR_GROUP=${RECEPTOR_GROUP:-5}
LIGAND_GROUP=${LIGAND_GROUP:-6}

echo "=== Checking commands ==="
which "${GMX}"
which gmx_MMPBSA
gmx_MMPBSA --version || true

echo
echo "=== Creating MMPBSA index ==="

printf "splitch 0\nname 5 MembraneProtein\nname 6 BindingProtein\nq\n" | \
    "${GMX}" make_ndx \
        -f "${GRO}" \
        -n "${BASE_INDEX}" \
        -o "${MMPBSA_INDEX}"

echo
echo "=== Writing MMPBSA input ==="

cat > "${MMPBSA_IN}" <<'EOF'
&general
  startframe=1,
  interval=1,
  verbose=1,
  keep_files=0,
/

&gb
  igb=5,
  saltcon=0.150,
/
EOF

echo
echo "=== Running gmx_MMPBSA ==="

gmx_MMPBSA -O \
    -i "${MMPBSA_IN}" \
    -cs "${TPR}" \
    -ct "${XTC}" \
    -ci "${MMPBSA_INDEX}" \
    -cg "${RECEPTOR_GROUP}" "${LIGAND_GROUP}" \
    -cp "${TOP}" \
    -o "${RESULT_DIR}/FINAL_RESULTS_MMPBSA.dat" \
    -eo "${RESULT_DIR}/FINAL_RESULTS_MMPBSA.csv" \
    -nogui

echo
echo "=== Done ==="
echo "Working files:"
echo "  ${WORKDIR}/"
echo
echo "Result files:"
echo "  ${RESULT_DIR}/FINAL_RESULTS_MMPBSA.dat"
echo "  ${RESULT_DIR}/FINAL_RESULTS_MMPBSA.csv"
```

::
