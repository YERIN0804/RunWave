export async function loadRunningCourses() {
  const res = await fetch('/data/부산_관광지.json');
  const json = await res.json();
  const pois = json.items.map(item => ({
    id: item.contentid,
    title: item.title,
    lat: Number(item.mapy),
    lng: Number(item.mapx),
    category: item.cat1,
    addr: item.addr1
  }));

  const findPois = (keywords) =>
    pois
      .filter(p => keywords.some(k => p.title.includes(k)))
      .sort((a, b) => a.title.localeCompare(b.title));

  return [
    {
      id: 'gwangalli',
      title: '🏃 광안리 해변 러닝',
      distance: '약 5km',
      description: '민락수변공원부터 광안리 해변을 거쳐 삼익비치까지 연결하는 코스',
      points: findPois(['민락', '광안리해변', '광안리해수욕장', '삼익비치']).slice(0, 4)
    },
    {
      id: 'haeundae',
      title: '🏃 해운대 동백섬 코스',
      distance: '약 4km',
      description: '동백섬과 해운대 해변을 잇는 바다 코스',
      points: findPois(['동백섬', '누리마루', '해운대', '미포']).slice(0, 4)
    },
    {
      id: 'songjeong',
      title: '🏃 송정 해변 러닝',
      distance: '약 5km',
      description: '송정 해변을 따라 달리는 시원한 해안 루트',
      points: findPois(['송정해수욕장', '송정']).slice(0, 4)
    }
  ].map(course => ({
    ...course,
    points: course.points.map(p => ({
      label: p.title,
      lat: p.lat,
      lng: p.lng
    }))
  }));
}