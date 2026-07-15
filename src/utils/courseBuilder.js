// src/data/courseBuilder.js

export async function loadRunningCourses() {
  // 1. 모든 데이터 파일 로드
  const files = [
    '/data/부산_관광지.json',
    '/data/부산_레포츠.json',
    '/data/부산_문화시설.json'
  ];

  let allPois = [];
  for (const file of files) {
    try {
      const res = await fetch(file);
      if (res.ok) {
        const json = await res.json();
        const items = (json.items || []).filter(item => item.title && item.mapx && item.mapy);
        allPois.push(...items.map(item => ({
          id: item.contentid,
          title: item.title,
          lat: Number(item.mapy),
          lng: Number(item.mapx),
          addr: item.addr1 || '',
        })));
      }
    } catch (e) {
      console.error(`${file} 로드 실패:`, e);
    }
  }

  const findPois = (keywords) =>
    allPois.filter((p) => keywords.some((k) => p.title.includes(k) || p.addr.includes(k)));

  const buildCourse = (id, title, description, keywords) => {
    const matched = findPois(keywords);
    // 중복 제거 후 4개 포인트 선정
    const uniquePoints = Array.from(new Set(matched.map(a => a.id)))
      .map(id => matched.find(a => a.id === id))
      .slice(0, 4);

    return {
      id, title, distance: '약 4~5km', description,
      points: uniquePoints.map(p => ({ label: p.title, lat: p.lat, lng: p.lng }))
    };
  };

  return [
    buildCourse('gwangalli', '🏃 광안리 해변 러닝', '민락수변공원에서 삼익비치까지 이어지는 바다 코스', ['민락', '광안리', '삼익비치']),
    buildCourse('haeundae', '🏃 해운대 동백섬 코스', '동백섬과 누리마루, 해운대 해변을 잇는 코스', ['동백섬', '누리마루', '해운대', '미포']),
    buildCourse('songjeong', '🏃 송정 해변 러닝', '송정 해수욕장과 죽도공원을 즐기는 해안 코스', ['송정', '죽도공원', '구덕포']),
    buildCourse('dadaepo', '🏃 다대포 노을 코스', '다대포 해변공원과 몰운대를 지나는 노을 명소 코스', ['다대포', '몰운대', '장림']),
    buildCourse('eulsukdo', '🏃 을숙도 생태 코스', '낙동강 하구와 을숙도 생태공원을 달리는 자연 코스', ['을숙도', '낙동강', '생태공원']),
    buildCourse('seomyeon', '🏃 서면 도심 코스', '서면 중심가와 전포 카페거리를 잇는 도심 러닝', ['서면', '전포', '상상마당']),
    buildCourse('yeongdo', '🏃 영도 해안 코스', '영도대교에서 해안산책로를 따라 달리는 코스', ['영도', '봉래', '남항']),
    buildCourse('busanport', '🏃 부산항 감천 코스', '부산항대교 전망과 감천문화마을을 잇는 이색 코스', ['부산항', '감천'])
  ].filter(c => c.points.length >= 2);
}