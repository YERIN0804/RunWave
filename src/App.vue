<template>
  <router-view />
  <!-- <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import BoardList from './components/BoardList.vue'
  import BoardWrite from './components/BoardWrite.vue'
  import BoardDetail from './components/BoardDetail.vue'
  import BoardEdit from './components/BoardEdit.vue'

  const currentHash = ref(location.hash || '#/')

  function updateHash() {
    currentHash.value = location.hash || '#/'
  }

  onMounted(() => {
    window.addEventListener('hashchange', updateHash)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('hashchange', updateHash)
  })
  </script>

  <template>
    <main class="app">
      <BoardWrite v-if="currentHash === '#/write'" />
      <BoardDetail v-else-if="currentHash.startsWith('#/post/')" />
      <BoardEdit v-else-if="currentHash.startsWith('#/edit/')" />
      <BoardList v-else />
    </main> -->
</template>