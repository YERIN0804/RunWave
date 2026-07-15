<template>
  <div class="app-wrap">
    <h1>부산 비치런 코스 안내</h1>
    
    <div class="controls">
      <button
        v-for="course in courses"
        :key="course.id"
        :class="{ active: selectedCourse?.id === course.id }"
        @click="selectedCourse = course"
      >
        {{ course.title.replace('🏃 ', '') }}
      </button>
    </div>

    <div class="layout">
      <div class="map-container">
        <BeachMap :selectedCourse="selectedCourse" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import BeachMap from "./components/BeachMap.vue";

const courses = [
  {
    id: "gwangalli",
    title: "🏃 광안리 해변 5km",
    distance: "약 5km",
    points: [
      {
        label: "출발 - 민락수변공원",
        lat: 35.1539,
        lng: 129.1305
      },
      {
        label: "중간1 - 광안대교 전망대",
        lat: 35.1536,
        lng: 129.1238
      },
      {
        label: "중간2 - 광안리 해수욕장 중앙",
        lat: 35.1534,
        lng: 129.1186
      },
      {
        label: "도착 - 남천해변공원",
        lat: 35.1472,
        lng: 129.1095
      }
    ]
  },


  {
    id: "haeundae",
    title: "🏃 해운대 해변 5km",
    distance: "약 5km",
    points: [
      {
        label: "출발 - 동백섬 입구",
        lat: 35.1564,
        lng: 129.1535
      },
      {
        label: "중간1 - 더베이101",
        lat: 35.1552,
        lng: 129.1520
      },
      {
        label: "중간2 - 해운대 해수욕장 중앙",
        lat: 35.1587,
        lng: 129.1604
      },
      {
        label: "도착 - 미포항",
        lat: 35.1604,
        lng: 129.1742
      }
    ]
  },


  {
    id: "songjeong",
    title: "🏃 송정 해변 5km",
    distance: "약 5km",
    points: [
      {
        label: "출발 - 송정해수욕장 남쪽 입구",
        lat: 35.1788,
        lng: 129.1995
      },
      {
        label: "중간1 - 송정해수욕장 중앙",
        lat: 35.1796,
        lng: 129.1928
      },
      {
        label: "중간2 - 구덕포 해안길",
        lat: 35.1805,
        lng: 129.1868
      },
      {
        label: "도착 - 청사포 다릿돌전망대",
        lat: 35.1618,
        lng: 129.1945
      }
    ]
  },


  {
    id: "dadaepo",
    title: "🏃 다대포 해변 5km",
    distance: "약 5km",
    points: [
      {
        label: "출발 - 다대포해수욕장 입구",
        lat: 35.0485,
        lng: 128.9647
      },
      {
        label: "중간1 - 다대포 백사장 중앙",
        lat: 35.0467,
        lng: 128.9680
      },
      {
        label: "중간2 - 몰운대 입구",
        lat: 35.0440,
        lng: 128.9650
      },
      {
        label: "도착 - 몰운대 전망대",
        lat: 35.0418,
        lng: 128.9685
      }
    ]
  },


  {
    id: "eulsukdo",
    title: "🏃 을숙도 생태공원 5km",
    distance: "약 5km",
    points: [
      {
        label: "출발 - 을숙도 문화회관",
        lat: 35.1060,
        lng: 128.9335
      },
      {
        label: "중간1 - 낙동강 철새도래지",
        lat: 35.1050,
        lng: 128.9380
      },
      {
        label: "중간2 - 을숙도 생태 탐방로",
        lat: 35.1018,
        lng: 128.9405
      },
      {
        label: "도착 - 낙동강하구 에코센터",
        lat: 35.1010,
        lng: 128.9380
      }
    ]
  }
];

const selectedCourse = ref(courses[0]);
</script>

<style>
.app-wrap { max-width: 1000px; margin: 0 auto; padding: 20px; }
.controls { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.controls button { 
  padding: 12px 20px; border: 1px solid #ddd; background: #fff; 
  cursor: pointer; border-radius: 25px; transition: 0.2s; 
}
.controls button.active { background: #2b7cff; color: #fff; border-color: #2b7cff; }
.map-container { width: 100%; height: 500px; }
</style>