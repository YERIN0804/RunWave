// src/utils/rankingStorage.js

export const getLogs = () => {
  const data = localStorage.getItem('my_running_logs');
  return data ? JSON.parse(data) : [];
};

export const saveLogs = (logs) => {
  localStorage.setItem('my_running_logs', JSON.stringify(logs));
};

export const appendLog = (log) => {
  const nextLogs = [...getLogs(), { id: Date.now(), ...log }];
  saveLogs(nextLogs);
  return nextLogs;
};

export const getStats = (period = 'day', sourceLogs = null) => {
  const logs = Array.isArray(sourceLogs) ? sourceLogs : getLogs();
  const now = new Date();

  const filtered = logs.filter(log => {
    const logDate = new Date(log.date);
    if (period === 'day') return logDate.toDateString() === now.toDateString();
    if (period === 'week') return (now - logDate) <= (7 * 24 * 60 * 60 * 1000);
    if (period === 'month') return logDate.getMonth() === now.getMonth();
    return true;
  });

  return filtered.reduce((acc, cur) => ({
    totalDistance: acc.totalDistance + Number(cur.distance || 0),
    totalTime: acc.totalTime + Number(cur.time || 0)
  }), { totalDistance: 0, totalTime: 0 });
};