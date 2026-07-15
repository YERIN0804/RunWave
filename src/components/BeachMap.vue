<template>
  <div id="map" ref="mapEl"></div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, nextTick, defineExpose } from "vue";
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

function invalidateSize(){ if(map) map.invalidateSize(); }
defineExpose({ invalidateSize });

function updateMap(course){
  console.log('[BeachMap] updateMap', course?.id ?? '(none)', 'points=', course?.points?.length ?? 0);
  if(!map){ console.warn('[BeachMap] map not initialized'); return; }
  markerLayer.clearLayers();
  if(!course || !Array.isArray(course.points) || course.points.length === 0){
    console.log('[BeachMap] no points to show'); return;
  }

  const latlngs = [];
  course.points.forEach((p, i) => {
    try {
      const marker = L.marker([p.lat, p.lng], { icon: getIcon() }).bindPopup(p.label || `${course.title || ''} ${i+1}`);
      markerLayer.addLayer(marker);
      latlngs.push([p.lat, p.lng]);
    } catch(e){
      console.error('[BeachMap] marker error', e, p);
    }
  });

  if(latlngs.length){
    const bounds = L.latLngBounds(latlngs);
    if(bounds.isValid()){
      map.fitBounds(bounds.pad(0.18));
    } else {
      map.setView(latlngs[0], 13);
    }
  }
}

onMounted(() => {
  // initialize map
  map = L.map("map", { center: [35.1796, 129.0756], zoom: 12 });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  markerLayer.addTo(map);

  nextTick(() => {
    if(props.selectedCourse) updateMap(props.selectedCourse);
    setTimeout(()=> invalidateSize(), 200);
  });
});

watch(() => props.selectedCourse, (c) => {
  // slight delay to allow layout transitions
  setTimeout(()=> updateMap(c), 60);
});

onUnmounted(() => { if(map) map.remove(); });
</script>

<style>
#map { width: 100%; height: 520px; border-radius: 16px; }
@media (max-width: 1080px) {
  #map { height: 420px; }
}
</style>