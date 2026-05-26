<template>
    <div>
        <h3>Counter: {{ count }}</h3>
        <button @click="increment" class="mr-2">Increment</button>
        <button @click="decrement" class="mr-2">Decrement</button>
    </div>
</template>

<script setup lang="ts">
const count = ref(0);

const increment = () => {
    count.value++;
};

const decrement = () => {
    count.value--;
};
</script>

<style scoped></style>
