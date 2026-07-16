<template>
  <div ref="mapContainer" class="map-container" :style="{ height: mapHeight }"></div>
</template>

<script setup>
import { ref, computed, watch, defineExpose, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({ 
  selectedCourse: Object,
  large: Boolean // 부모로부터 크게 보기 상태를 받음
});

// 1. 상태에 따른 높이 계산
const mapHeight = computed(() => (props.large ? '760px' : '520px'));

const mapContainer = ref(null);
const map = ref(null);
const currentPolyline = ref(null);
const currentStartMarker = ref(null);
const currentEndMarker = ref(null);

// 2. 카카오맵 레이아웃 재계산 함수
const relayout = () => {
  if (map.value) {
    map.value.relayout();
    // 필요 시 중심 좌표 재설정 로직 추가 가능
  }
};

// 3. large 상태 변경 감지
watch(() => props.large, () => {
  // CSS transition(0.3s)이 끝날 시간을 고려하여 relayout 실행
  setTimeout(relayout, 350); 
});

// 4. 노출할 함수들을 하나로 합쳐서 한 번만 호출
defineExpose({ 
  relayout,
  // 기존 invalidateSize가 필요하다면 여기서 함께 노출
});

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
  if (currentPolyline.value) {
    currentPolyline.value.setMap(null);
    currentPolyline.value = null;
  }
  clearMarkers();

  if (pathPositions.length > 0) {
    currentPolyline.value = new kakao.maps.Polyline({
      path: pathPositions,
      strokeWeight: 6,
      strokeColor: '#FF3E00',
      strokeOpacity: 0.8
    });
    currentPolyline.value.setMap(map.value);
  }

  if (course?.points?.length) {
    const startPos = new kakao.maps.LatLng(course.points[0].lat, course.points[0].lng);
    const endPos = new kakao.maps.LatLng(
      course.points[course.points.length - 1].lat,
      course.points[course.points.length - 1].lng
    );
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
    level: 7
  };
  map.value = new kakao.maps.Map(mapContainer.value, options);
};

const updateRoute = async (course) => {
  if (!map.value || !course?.points?.length) return;

  try {
    const start = course.points[0];
    const end = course.points[course.points.length - 1];
    const viaPoints = course.points.slice(1, -1).map((point, index) => ({
      viaPointId: String(index + 1),
      viaPointName: point.label || `경유${index + 1}`,
      viaX: point.lng,
      viaY: point.lat,
      reqCoordType: 'WGS84GEO',
      resCoordType: 'WGS84GEO'
    }));

    const response = await axios.post(
      'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1',
      {
        startX: start.lng,
        startY: start.lat,
        endX: end.lng,
        endY: end.lat,
        startName: '출발',
        endName: '도착',
        reqCoordType: 'WGS84GEO',
        resCoordType: 'WGS84GEO',
        searchOption: '0',
        viaPoints
      },
      {
        headers: { appKey: import.meta.env.VITE_TMAP_APP_KEY }
      }
    );

    const path = [];
    (response.data.features || []).forEach((feature) => {
      if (feature.geometry?.type === 'LineString') {
        feature.geometry.coordinates.forEach((coord) => {
          path.push(new kakao.maps.LatLng(coord[1], coord[0]));
        });
      }
    });

    drawRoute(path, course);
  } catch (e) {
    console.error('티맵 경로 탐색 실패:', e);
    drawRoute([], course);
  }
};

onMounted(() => {
  const script = document.createElement('script');
  script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${import.meta.env.VITE_KAKAO_MAP_KEY}`;
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
.map-container {
  width: 100%;
  transition: height 0.3s ease; /* 부드러운 높이 변화 */
  border-radius: 16px;
  overflow: hidden; /* 지도 렌더링 시 여백 방지 */
}
</style>