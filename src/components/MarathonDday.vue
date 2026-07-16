<script setup>
import { computed } from "vue";
import { marathons } from "../data/marathons";

const calculateDday = (dateString) => {
  const today = new Date();
  const targetDate = new Date(`${dateString}T00:00:00`);

  today.setHours(0, 0, 0, 0);

  const difference = targetDate.getTime() - today.getTime();
  const days = Math.ceil(difference / (1000 * 60 * 60 * 24));

  if (days > 0) return `D-${days}`;
  if (days === 0) return "D-DAY";

  return "종료";
};

const formatDate = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const upcomingMarathons = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return [...marathons]
    .filter((marathon) => {
      const eventDate = new Date(`${marathon.date}T00:00:00`);
      return eventDate >= today;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);
});

const openMarathonPage = (url) => {
  if (!url) return;

  window.open(url, "_blank", "noopener,noreferrer");
};
</script>

<template>
  <section class="marathon-section">
    <div class="marathon-header">
      <div>
        <h2>🏃 다가오는 마라톤 D-DAY</h2>
        <p>부산에서 열리는 마라톤 일정을 확인하고 함께 준비해요!</p>
      </div>

      <button type="button" class="schedule-button">
        전체 일정 보기 ›
      </button>
    </div>

    <div class="marathon-list">
      <article
        v-for="marathon in upcomingMarathons"
        :key="marathon.id"
        class="marathon-card"
        @click="openMarathonPage(marathon.url)"
      >
        <div class="card-top">
          <span
            class="status"
            :class="`status-${marathon.color}`"
          >
            {{ marathon.status }}
          </span>

          <strong
            class="dday"
            :class="`dday-${marathon.color}`"
          >
            {{ calculateDday(marathon.date) }}
          </strong>
        </div>

        <div class="card-content">
          <div
            class="marathon-icon"
            :class="`icon-${marathon.color}`"
          >
            {{ marathon.emoji }}
          </div>

          <div class="marathon-info">
            <h3>{{ marathon.title }}</h3>

            <p>
              {{ formatDate(marathon.date) }}
              ·
              {{ marathon.location }}
            </p>

            <div class="distance-list">
              <span
                v-for="distance in marathon.distances"
                :key="distance"
              >
                {{ distance }}
              </span>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.marathon-section {
  padding: 22px;
  margin-bottom: 20px;
  border: 1px solid #dbeafe;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.08);
}

.marathon-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
}

.marathon-header h2 {
  margin: 0 0 7px;
  color: #172033;
  font-size: 21px;
}

.marathon-header p {
  margin: 0;
  color: #718096;
  font-size: 14px;
}

.schedule-button {
  border: 0;
  background: transparent;
  color: #64748b;
  cursor: pointer;
}

.schedule-button:hover {
  color: #2563eb;
}

.marathon-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.marathon-card {
  padding: 16px;
  border: 1px solid #dbe7f7;
  border-radius: 16px;
  background: #ffffff;
  cursor: pointer;
  transition: 0.2s;
}

.marathon-card:hover {
  transform: translateY(-4px);
  border-color: #93c5fd;
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.12);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.status {
  padding: 5px 10px;
  border-radius: 999px;
  color: white;
  font-size: 12px;
  font-weight: 700;
}

.status-blue {
  background: #2563eb;
}

.status-green {
  background: #10b981;
}

.status-orange {
  background: #f59e0b;
}

.dday {
  font-size: 27px;
  font-weight: 900;
}

.dday-blue {
  color: #1d4ed8;
}

.dday-green {
  color: #059669;
}

.dday-orange {
  color: #f59e0b;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.marathon-icon {
  display: grid;
  flex: 0 0 58px;
  width: 58px;
  height: 58px;
  place-items: center;
  border-radius: 50%;
  font-size: 28px;
}

.icon-blue {
  background: #dbeafe;
}

.icon-green {
  background: #d1fae5;
}

.icon-orange {
  background: #ffedd5;
}

.marathon-info {
  min-width: 0;
}

.marathon-info h3 {
  margin: 0 0 7px;
  color: #172033;
  font-size: 16px;
}

.marathon-info p {
  margin: 0 0 10px;
  color: #718096;
  font-size: 13px;
}

.distance-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.distance-list span {
  padding: 4px 8px;
  border-radius: 7px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 1000px) {
  .marathon-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .marathon-header {
    flex-direction: column;
  }
}
</style>