<script setup>
import HomeView from './views/HomeView.vue'
</script>

<template>
<<<<<<< HEAD
  <HomeView />
=======
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
>>>>>>> 910b5e4708166eeeaf7dd93faa8e36e2cf39662d
</template>