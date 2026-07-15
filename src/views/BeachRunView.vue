<script setup>

import { ref } from "vue";

import BeachMap from "../components/BeachMap.vue";
import CourseList from "../components/CourseList.vue";

import { courses } from "../data/runningCourses";


const selectedCourse = ref(courses[0]);


const selectCourse = (course)=>{
  selectedCourse.value = course;
};


</script>


<template>

<div>

  <h1>
    부산 비치런 코스 안내
  </h1>


  <CourseList
    :courses="courses"
    :selectedId="selectedCourse.id"
    @select="selectCourse"
  />


  <BeachMap
    :selectedCourse="selectedCourse"
  />

</div>

</template>