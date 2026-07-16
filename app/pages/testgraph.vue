<template>
    <div class="flex min-h-dvh flex-col gap-4 bg-surface p-4 text-on-surface">
        <ClientOnly>
            <LazyRmsdXvgChartClient
                :xvg="[rmsdLigXvg, rmsdProtXvg]"
                title="RMSD"
                :series-name="['Ligand', 'Protein']"
                height-class="min-h-[28rem]"
            />
            <template #fallback>
                <div class="min-h-[28rem]" aria-hidden="true" />
            </template>
        </ClientOnly>
    </div>
</template>
<script setup lang="ts">
import rmsdLigXvg from "~/data/model/samples/cycle1/run_complex_job_0_n_42_id_26_beam_orig3_bm1-s0to100br0-s100to200br2_mpnn_seq1_complex_model_lig.js?raw";
import rmsdProtXvg from "~/data/model/samples/cycle1/run_complex_job_0_n_42_id_26_beam_orig3_bm1-s0to100br0-s100to200br2_mpnn_seq1_complex_model_prot.js?raw";

definePageMeta({
    layout: "static",
});
</script>
