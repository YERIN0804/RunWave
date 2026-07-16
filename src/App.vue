<script setup>
import HomeView from './views/HomeView.vue'
</script>

<template>
  <Transition name="app-shell" mode="out-in" appear>
    <HomeView />
  </Transition>
</template>

<style scoped>
.app-shell-enter-active,
.app-shell-leave-active {
  transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.app-shell-enter-from,
.app-shell-leave-to {
  opacity: 0;
  transform: translateY(14px);
}

.app-shell-enter-to,
.app-shell-leave-from {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .app-shell-enter-active,
  .app-shell-leave-active {
    transition: none !important;
  }
}
</style>