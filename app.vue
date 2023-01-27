<template>
  <div>
    hello
  </div>
</template>

<script setup lang="ts">
console.log('hello from client');

useFetch('/api/log');
</script>
