<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

const props = defineProps(['selectedCourse']);
const mapContainer = ref(null);
const map = ref(null);
const currentPolyline = ref(null);

const currentStartMarker = ref(null);
const currentEndMarker = ref(null);

const clearMarkers = () => {
  if (currentStartMarker.value) {
    currentStartMarker.value.setMap(null);
    currentStartMarker.value = null;
  }
  if (currentEndMarker.value) {
    currentEndMarker.value.setMap(null);
    currentEndMarker.value = null;
  }
};

const createMarker = (position, title) => {
  return new kakao.maps.Marker({
    position,
    map: map.value,
    title
  });
};

const drawRoute = (pathPositions, course) => {
  if (currentPolyline.value) currentPolyline.value.setMap(null);
  clearMarkers();

  currentPolyline.value = new kakao.maps.Polyline({
    path: pathPositions,
    strokeWeight: 6,
    strokeColor: '#FF3E00',
    strokeOpacity: 0.8
  });
  currentPolyline.value.setMap(map.value);

  if (course?.points?.length) {
    const startPos = new kakao.maps.LatLng(course.points[0].lat, course.points[0].lng);
    const endPos = new kakao.maps.LatLng(course.points[course.points.length - 1].lat, course.points[course.points.length - 1].lng);

    currentStartMarker.value = createMarker(startPos, '출발');
    currentEndMarker.value = createMarker(endPos, '도착');
  }

  if (pathPositions.length > 0) {
    const bounds = new kakao.maps.LatLngBounds();
    pathPositions.forEach(p => bounds.extend(p));
    map.value.setBounds(bounds);
  }
};

const initMap = () => {
  const options = {
    center: new kakao.maps.LatLng(35.1587, 129.1604),
    level: 5
  };
  map.value = new kakao.maps.Map(mapContainer.value, options);
};


const updateRoute = async (course) => {
  if (!map.value || !course?.points?.length) return;

  try {
    const start = course.points[0];
    const end = course.points[course.points.length - 1];

    // 티맵 API 호출
    const response = await axios.post("https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1", {
      startX: start.lng,
      startY: start.lat,
      endX: end.lng,
      endY: end.lat,
      startName: "출발",
      endName: "도착",
      reqCoordType: "WGS84GEO",
      resCoordType: "WGS84GEO"
    }, {
      headers: { "appKey": import.meta.env.VITE_TMAP_APP_KEY }
    });

    const path = [];
    response.data.features.forEach(f => {
      if (f.geometry.type === "LineString") {
        f.geometry.coordinates.forEach(c => path.push(new kakao.maps.LatLng(c[1], c[0])));
      }
    });
    drawRoute(path, course);
  } catch (e) {
    console.error("티맵 경로 탐색 실패 (CORS 가능성):", e);
    // 경로를 못 가져와도 기본 마커라도 찍고 싶다면 여기에 추가 로직 작성
  }
};

onMounted(() => {
  // 카카오맵 스크립트 로드
  const script = document.createElement('script');
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${import.meta.env.VITE_KAKAO_MAP_KEY}`;
  script.onload = () => kakao.maps.load(() => {
    initMap();
    if (props.selectedCourse) updateRoute(props.selectedCourse);
  });
  document.head.appendChild(script);
});

watch(() => props.selectedCourse, (newVal) => {
  if (map.value) updateRoute(newVal);
});
</script>

<style scoped>
.map-container { width: 100%; height: 520px; border-radius: 16px; }
</style>