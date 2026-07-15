<script setup>
import { ref } from 'vue'
// import HelloWorld from './components/HelloWorld.vue'
import RunChat from './components/RunChat.vue';
import BeachMap from './components/BeachMap.vue';

const touristSpots = ref([]) // 실제 데이터로 채울 경우 loadAllLocalData와 연동하세요

</script>

<template>
  <!-- <HelloWorld /> -->
   <BeachMap :runningSpots="touristSpots" />
   <RunChat/>
</template>
