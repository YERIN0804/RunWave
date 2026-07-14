<template>
  <div id="map" class="w-full h-[500px] rounded-2xl shadow-lg"></div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, ref } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const props = defineProps({
  runningSpots: { type: Array, required: true }
});

let map = null;
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// 마커를 관리할 그룹 생성 (지우기 쉽게 하기 위함)
const markersLayer = L.layerGroup();

onMounted(() => {
  map = L.map('map').setView([35.1796, 129.0756], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  
  markersLayer.addTo(map);
});

// 데이터 변경 시 마커 업데이트
watch(() => props.runningSpots, (newData) => {
  if (!map) return;
  markersLayer.clearLayers(); // 기존 마커 삭제
  
  newData.forEach(spot => {
    const lat = parseFloat(spot.mapy);
    const lng = parseFloat(spot.mapx);
    if (!isNaN(lat) && !isNaN(lng)) {
      L.marker([lat, lng], { icon: DefaultIcon })
        .addTo(markersLayer)
        .bindPopup(`<b>${spot.title}</b><br>${spot.addr1 || ''}`);
    }
  });
}, { deep: true });

onUnmounted(() => {
  if (map) map.remove();
});
</script>

<style scoped>
/* scoped를 사용하면 이 컴포넌트에만 적용됩니다 */
#map {
  width: 100%;
  height: 500px;
}
</style>