// src/utils/rankingStorage.js

// 1. 로그를 가져오는 함수
export const getLogs = () => {
  const data = localStorage.getItem('my_running_logs');
  return data ? JSON.parse(data) : [];
};

// 2. 통계를 계산하는 함수 (반드시 export 키워드 확인!)
export const getStats = (period = 'day') => {
  const logs = getLogs();
  const now = new Date();
  
  const filtered = logs.filter(log => {
    const logDate = new Date(log.date);
    if (period === 'day') return logDate.toDateString() === now.toDateString();
    if (period === 'week') return (now - logDate) <= (7 * 24 * 60 * 60 * 1000);
    if (period === 'month') return logDate.getMonth() === now.getMonth();
    return true;
  });

  return filtered.reduce((acc, cur) => ({
    totalDistance: acc.totalDistance + cur.distance,
    totalTime: acc.totalTime + cur.time
  }), { totalDistance: 0, totalTime: 0 });
};