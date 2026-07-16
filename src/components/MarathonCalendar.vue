<script setup>
const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

const days = [
  "", "", "", 1, 2, 3, 4,
  5, 6, 7, 8, 9, 10, 11,
  12, 13, 14, 15, 16, 17, 18,
  19, 20, 21, 22, 23, 24, 25,
  26, 27, 28, 29, 30, 31, ""
];
</script>

<template>
  <section class="calendar-box">
    <div class="calendar-header">
      <h2>📅 마라톤 일정 캘린더</h2>

      <div class="month-title">
        <button type="button">‹</button>
        <strong>2026년 7월</strong>
        <button type="button">›</button>
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
        v-for="(day, index) in days"
        :key="index"
        class="calendar-day"
      >
        <span v-if="day">
          {{ day }}
        </span>
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
  font-size: 21px;
  color: #172033;
}

.month-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.month-title button {
  width: 34px;
  height: 34px;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  background: #f8fbff;
  color: #2563eb;
  font-size: 22px;
  cursor: pointer;
}

.month-title strong {
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
  min-height: 78px;
  padding: 10px;
  border-top: 1px solid #e5edf8;
  border-right: 1px solid #e5edf8;
  background: #ffffff;
  color: #334155;
}

.calendar-day:nth-child(7n + 1) {
  color: #ef4444;
}

.calendar-day:nth-child(7n) {
  color: #2563eb;
}

.calendar-day:hover {
  background: #f8fbff;
}

@media (max-width: 700px) {
  .calendar-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
  }

  .calendar-day {
    min-height: 58px;
    padding: 7px;
    font-size: 13px;
  }
}
</style>