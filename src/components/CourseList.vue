<template>
  <div class="course-list">
    <div v-for="course in courses" :key="course.id" 
         @click="$emit('select', course)"
         :class="{ active: selectedId === course.id }">
      <h3>{{ course.title }}</h3>
    </div>
  </div>
</template>

<script setup>
defineProps({ courses: Array, selectedId: String });
defineEmits(['select']);
</script>

<style scoped>
.course-list { display: flex; flex-direction: column; gap: 10px; }
.course-list div { padding: 15px; border: 1px solid #ddd; cursor: pointer; border-radius: 10px; }
.active { background: #eef4ff; border-color: #2b7cff; }
</style>