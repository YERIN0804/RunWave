<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  marathons: {
    type: Array,
    default: () => [],
  },
});

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

// 현재 보이는 달
const currentDate = ref(new Date(2026, 6, 1)); // 2026년 7월

// 화면에 표시할 연도
const currentYear = computed(() => currentDate.value.getFullYear());

// 화면에 표시할 월
const currentMonth = computed(() => currentDate.value.getMonth());

// 제목: 2026년 7월
const monthTitle = computed(() => {
  return `${currentYear.value}년 ${currentMonth.value + 1}월`;
});

// 이전 달 버튼
const goPrevMonth = () => {
  currentDate.value = new Date(
    currentYear.value,
    currentMonth.value - 1,
    1
  );
};

// 다음 달 버튼
const goNextMonth = () => {
  currentDate.value = new Date(
    currentYear.value,
    currentMonth.value + 1,
    1
  );
};

// 해당 월의 달력 날짜 만들기
const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const days = [];

  // 달력 앞쪽 빈칸
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // 실제 날짜
  for (let day = 1; day <= lastDate; day++) {
    days.push(day);
  }

  return days;
});

// 특정 날짜에 열리는 마라톤 찾기
const getMarathonsForDay = (day) => {
  if (!day) return [];

  const dateKey =
    `${currentYear.value}-` +
    `${String(currentMonth.value + 1).padStart(2, "0")}-` +
    `${String(day).padStart(2, "0")}`;

  return props.marathons.filter((marathon) => marathon.date === dateKey);
};
</script>

<template>
  <section class="calendar-box">
    <div class="calendar-header">
      <h2>📅 마라톤 일정 캘린더</h2>

      <div class="month-control">
        <button type="button" @click="goPrevMonth">
          ‹
        </button>

        <strong>{{ monthTitle }}</strong>

        <button type="button" @click="goNextMonth">
          ›
        </button>
      </div>
    </div>

    <div class="week-row">
      <div
        v-for="day in weekDays"
        :key="day"
        class="week-name"
      >
        {{ day }}
      </div>
    </div>

    <div class="calendar-grid">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="calendar-day"
        :class="{ empty: !day }"
      >
        <span v-if="day" class="day-number">
          {{ day }}
        </span>

        <div
          v-if="day"
          class="event-list"
        >
          <div
            v-for="marathon in getMarathonsForDay(day)"
            :key="marathon.id"
            class="event-item"
            :title="marathon.title"
          >
            🏃 {{ marathon.title }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.calendar-box {
  margin-top: 22px;
  padding: 24px;
  border: 1px solid #dbeafe;
  border-radius: 20px;
  background: white;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.08);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}

.calendar-header h2 {
  margin: 0;
  color: #172033;
  font-size: 21px;
}

.month-control {
  display: flex;
  align-items: center;
  gap: 14px;
}

.month-control button {
  width: 34px;
  height: 34px;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  background: #f8fbff;
  color: #2563eb;
  font-size: 22px;
  cursor: pointer;
}

.month-control button:hover {
  background: #eff6ff;
}

.month-control strong {
  min-width: 110px;
  color: #172033;
  text-align: center;
}

.week-row,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.week-name {
  padding: 10px 0;
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.week-name:first-child {
  color: #ef4444;
}

.week-name:last-child {
  color: #2563eb;
}

.calendar-day {
  min-height: 95px;
  padding: 9px;
  border-top: 1px solid #e5edf8;
  border-right: 1px solid #e5edf8;
  background: #ffffff;
  overflow: hidden;
}

.calendar-day.empty {
  background: #fafcff;
}

.calendar-day:nth-child(7n + 1) .day-number {
  color: #ef4444;
}

.calendar-day:nth-child(7n) .day-number {
  color: #2563eb;
}

.day-number {
  display: inline-block;
  margin-bottom: 7px;
  color: #334155;
  font-size: 13px;
  font-weight: 700;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.event-item {
  overflow: hidden;
  padding: 5px 6px;
  border-radius: 6px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 700px) {
  .calendar-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
  }

  .calendar-day {
    min-height: 70px;
    padding: 6px;
  }

  .event-item {
    font-size: 9px;
  }
}
</style>