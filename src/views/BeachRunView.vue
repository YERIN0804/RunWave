<script setup>
import { ref, onMounted } from 'vue';
import BeachMap from '../components/BeachMap.vue';
import CourseList from '../components/CourseList.vue';
import { loadRunningCourses } from '../utils/courseBuilder';

const courses = ref([]);
const selectedCourse = ref(null);

const selectCourse = (course) => {
  selectedCourse.value = course;
};

onMounted(async () => {
  courses.value = await loadRunningCourses();
  selectedCourse.value = courses.value[0] || null;
});
</script>

<template>
  <div class="beach-run-view">
    <h1>부산 비치런 코스 안내</h1>

    <CourseList
      :courses="courses"
      :selectedId="selectedCourse?.id"
      @select="selectCourse"
    />

    <BeachMap :selectedCourse="selectedCourse" />
  </div>
</template>

<style scoped>
.beach-run-view {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 20px;
}
</style>