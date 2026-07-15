<template>
  <div id="map"></div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const props = defineProps({ selectedCourse: Object });
let map = null;
const markerLayer = L.layerGroup();

const getIcon = () => L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

const updateMap = (course) => {
  if (!map || !course?.points) return;
  markerLayer.clearLayers();
  course.points.forEach(p => {
    L.marker([p.lat, p.lng], { icon: getIcon() }).bindPopup(p.label).addTo(markerLayer);
  });
  const bounds = L.featureGroup(markerLayer.getLayers()).getBounds();
  map.fitBounds(bounds, { padding: [50, 50] });
};

onMounted(() => {
  map = L.map("map").setView([35.1796, 129.0756], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  markerLayer.addTo(map);
  if (props.selectedCourse) updateMap(props.selectedCourse);
});

watch(
  ()=>props.selectedCourse,
  updateMap,
  {
    deep:true,
    immediate:true
  }
);
onUnmounted(() => { if (map) map.remove(); });
</script>

<style>
#map { width: 100%; height: 500px; border-radius: 20px; }
</style>