<template>
  <div id="map" class="w-full h-[500px] rounded-2xl shadow-lg"></div>
</template>

<script setup>
import { onMounted } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 핀 아이콘 설정을 위한 기본 경로 수정 (Vite 환경)
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const props = defineProps({
  runningSpots: { type: Array, required: true }
});

onMounted(() => {
  // 1. 지도 초기화 (부산 좌표: 35.1796, 129.0756)
  const map = L.map('map').setView([35.1796, 129.0756], 12);

  // 2. 오픈스트리트맵 타일 레이어 추가
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // 3. 마커 아이콘 설정
  const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });

  // 4. JSON 데이터를 이용해 마커 생성
  props.runningSpots.forEach(spot => {
    if (spot.mapy && spot.mapx) {
      L.marker([parseFloat(spot.mapy), parseFloat(spot.mapx)], { icon: DefaultIcon })
        .addTo(map)
        .bindPopup(`<b>${spot.title}</b><br>${spot.addr1}`);
    }
  });

  // 5. 추천 경로(Line) 예시 그리기
  const polyline = L.polyline([
    [35.1587, 129.1604], // 해운대
    [35.1534, 129.1180]  // 광안리
  ], { color: 'orange', weight: 5 }).addTo(map);
});
</script>

<style>
/* Leaflet의 기본 스타일이 깨지지 않도록 import */
@import 'leaflet/dist/leaflet.css';
</style>