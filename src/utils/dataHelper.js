// src/utils/dataHelper.js

// 제공받은 7가지 부산 데이터 카테고리 정의
const DATA_FILES = {
  tourism: '/data/부산_관광지.json',
  leports: '/data/부산_레포츠.json',
  culture: '/data/부산_문화시설.json',
  shopping: '/data/부산_쇼핑.json',
  accommodation: '/data/부산_숙박.json',
  course: '/data/부산_여행코스.json',
  festival: '/data/부산_축제공연행사.json'
};

const allData = {
  tourism: [],
  leports: [],
  culture: [],
  shopping: [],
  accommodation: [],
  course: [],
  festival: []
};

// 1. 초기화 단계에서 모든 JSON 로드 (App 구동 시 혹은 Chat 켜질 때 최초 1회)
export async function loadAllLocalData() {
  const loadPromises = Object.entries(DATA_FILES).map(async ([key, path]) => {
    try {
      const response = await fetch(path);
      if (response.ok) {
        const json = await response.json();
        allData[key] = json.items || [];
      }
    } catch (err) {
      console.error(`${key} 데이터 로드 실패:`, err);
    }
  });

  await Promise.all(loadPromises);
  console.log('--- 부산 로컬 데이터 7종 로드 완료 ---');
}

// 2. 사용자 질문 키워드를 분석하여 적절한 JSON 데이터 컨텍스트 추출
export function findRelevantContext(userQuestion) {
  let context = '';
  const question = userQuestion.toLowerCase();

  // 매칭되는 아이템들을 담을 임시 배열
  let matches = [];
  let categoryName = '';

  // 질문 분석에 활용할 핵심 키워드 매핑
  const keywords = {
    festival: ['축제', '행사', '공연', '이벤트', '불꽃'],
    course: ['코스', '루트', '여행코스', '달리기코스', '추천코스'],
    leports: ['레포츠', '운동', '수상레저', '체육', '액티비티'],
    accommodation: ['숙소', '호텔', '모텔', '민박', '게스트하우스', '펜션', '머무'],
    shopping: ['쇼핑', '시장', '아울렛', '백화점', '마트'],
    culture: ['박물관', '미술관', '문화', '역사', '전시관'],
    tourism: ['관광', '명소', '가볼만한', '해변', '해수욕장', '공원', '산책']
  };

  // 1순위: 특정 분야 키워드 판별
  let matchedCategory = null;
  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => question.includes(word))) {
      matchedCategory = category;
      break;
    }
  }

  // 2순위: 질문에서 특정 '구/동' 또는 장소명 추출 (예: '해운대', '광안리', '금정', '동래' 등)
  // 질문 단어 단위 분리
  const queryTokens = question.split(/\s+/).filter(token => token.length > 1);

  if (matchedCategory && allData[matchedCategory].length > 0) {
    categoryName = matchedCategory;
    // 해당 카테고리 내에서 세부 키워드(지역명 등) 필터링
    matches = allData[matchedCategory].filter(item => {
      const title = (item.title || '').toLowerCase();
      const addr = (item.addr1 || '').toLowerCase();
      return queryTokens.some(token => title.includes(token) || addr.includes(token));
    });

    // 세부 필터링 결과가 없으면 그냥 해당 카테고리 상위 인기 장소 3개 추천
    if (matches.length === 0) {
      matches = allData[matchedCategory].slice(0, 3);
    }
  } else {
    // 키워드로 명확한 카테고리가 분류되지 않는다면 전체 데이터 대상 지역명 매칭 수행
    categoryName = '통합 검색';
    const combined = [
      ...allData.course.map(i => ({ ...i, type: '여행코스' })),
      ...allData.tourism.map(i => ({ ...i, type: '관광지' })),
      ...allData.festival.map(i => ({ ...i, type: '축제공연' })),
      ...allData.leports.map(i => ({ ...i, type: '레포츠' })),
      ...allData.accommodation.map(i => ({ ...i, type: '숙소' }))
    ];

    matches = combined.filter(item => {
      const title = (item.title || '').toLowerCase();
      const addr = (item.addr1 || '').toLowerCase();
      return queryTokens.some(token => title.includes(token) || addr.includes(token));
    });
  }

  // 추출된 매칭 데이터 기반으로 OpenAI 시스템에 주입할 텍스트 포맷 설계[cite: 1]
  const sliceMatches = matches.slice(0, 4); // 컨텍스트 과부하를 막기 위해 최대 4개 제한
  if (sliceMatches.length > 0) {
    context = `[제공된 신뢰할 수 있는 부산 지역 실제 데이터 (카테고리: ${categoryName})]:\n`;
    sliceMatches.forEach((item, index) => {
      const title = item.title || '정보 없음';
      const addr = item.addr1 || '부산광역시';
      const mapx = item.mapx || '';
      const mapy = item.mapy || '';
      const extra = item.overview || item.highlights || item.tel || '';
      
      context += `${index + 1}. 명칭: ${title}\n   주소: ${addr}\n`;
      if (mapx && mapy) context += `   좌표: 경도 ${mapx}, 위도 ${mapy}\n`;
      if (extra) context += `   설명/정보: ${extra.substring(0, 150)}...\n`;
      context += `\n`;
    });
  }

  return context;
}