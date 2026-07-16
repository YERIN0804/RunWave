<template>
  <div class="course-list">

    <button
      v-for="course in courses"
      :key="course.id"
      @click="$emit('select', course)"
      :class="{ active: selectedId === course.id }"
    >
      {{ course.title.replace('🏃 ', '') }}
    </button>

  </div>
</template>


<script setup>
defineProps({
  courses: Array,
  selectedId: String
});

defineEmits([
  'select'
]);
</script>


<style scoped>

.course-list {
  display: flex;
  flex-direction: row;   /* 가로 배치 */
  flex-wrap: wrap;       /* 화면 좁으면 다음 줄 */
  justify-content: center; /* 가로 중앙 정렬 */
  gap: 12px;
  margin-bottom: 20px;
}


.course-list button {

  padding: 12px 24px;

  border: 1px solid #ddd;

  border-radius: 30px;  /* 둥근 모서리 */

  background: white;

  cursor: pointer;

  font-size: 15px;

  transition: 0.2s;

}


.course-list button:hover {

  background: #f4f8ff;

  border-color: #2b7cff;

}


.course-list button.active {

  background: #2b7cff;

  color: white;

  border-color: #2b7cff;

}

</style>