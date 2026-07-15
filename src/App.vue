<script setup>

import BeachRunView from "./views/BeachRunView.vue";
import { ref } from 'vue'
// import HelloWorld from './components/HelloWorld.vue'
import RunChat from './components/RunChat.vue';
import BeachMap from './components/BeachMap.vue';
import WeatherDashBoard from './components/WeatherDashBoard.vue';

const touristSpots = ref([]) // 실제 데이터로 채울 경우 loadAllLocalData와 연동하세요

</script>


<template>

<BeachRunView />
  <!-- <HelloWorld /> -->
   <header class="app-header">
      <h1>부산 러닝 메이트 🏃‍♂️</h1>
    </header>

    <main class="app-content">
      <BeachMap :runningSpots="touristSpots" />
      
      <section class="weather-section">
        <WeatherDashBoard />
      </section>

      <RunChat/>
      
    </main>

    <footer class="app-footer">
      <p>© 2026 부산 러닝 메이트. All rights reserved.</p>
    </footer>
   
</template>
