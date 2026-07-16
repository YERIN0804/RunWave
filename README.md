# RunWave : 부산 지역 특화 러닝 플랫폼

**RunWave**는 부산 지역의 러닝 크루와 코스를 중심으로, 실시간 날씨 데이터와 AI 가이드를 제공하는 부산 지역 특화 정적 SPA(Single Page Application) 러닝 플랫폼입니다.

---

## 1. 개요 (Overview)

- **시스템명**: RunWave (부산 지역 특화 정적 SPA 러닝 플랫폼)
- **주요 특징**: 
  - 별도의 백엔드 서버 없이 브라우저의 `LocalStorage`를 활용하여 실시간 데이터 차트 구현 및 익명 커뮤니티(CRUD) 제공
  - OpenAI API를 연동하여 실시간 부산 러닝 정보 및 AI 가이드를 구축
  - OpenWeatherMap API와 연동하여 실시간 날씨에 따른 러닝 적합도 대시보드 제공

---

## 2. 주요 기능 (Features)

### ① 커뮤니티 기능 (러닝 크루 모집)
- **익명 CRUD 구현**: 게시글 목록 조회, 검색, 작성, 수정, 삭제 기능 제공
- **상호작용**: 게시글 내 '좋아요' 및 '참여 토클' 기능 제공
- **서버리스 저장**: 브라우저의 로컬 스토리지(LocalStorage) 기반 데이터 영속화

### ② AI 챗봇 기능 (부산 러닝 정보 AI 가이드)
- **대화형 인터페이스**: 자연스러운 대화형 러닝 정보 안내 및 Q&A 지원
- **특화 가이드**: 부산 지역 맞춤형 러닝 코스 추천, 실시간 날씨 대비 조언, 준비물 및 주의사항 맞춤 안내

### ③ 비치런 지도 시각화 기능
- **지도 마커 표시**: 부산 주요 러닝 코스(해변 코스 등) 선택 시 지도상에 마커 시각화
- **경로 가이드**: 출발지, 중간 지점, 도착지 시각화 정보 제공
- **인터랙션**: 지도 확대/축소 기능 및 사용자 맞춤형 보기 옵션 제공

### ④ 실시간 날씨 연동 및 러닝 적합도 대시보드
- **날씨 카드**: OpenWeatherMap API를 기반으로 한 실시간 날씨 정보 시각화
- **러닝 적합도**: 기온, 풍속, 하늘 상태 등을 종합 분석한 러닝 적합도 지표 제공
- **개인 기록 요약**: 사용자의 러닝 활동 데이터 요약 제공
- **명예의 전당 / 랭킹 카드**: 러닝 동기부여를 위한 랭킹 및 명예의 전당 대시보드 시각화

---

## 3. 기술 스택 (Tech Stack)

| 구분 | 기술 스택 | 비고 |
| :--- | :--- | :--- |
| **Frontend Library** | Vue 3 | Composition API / `<script setup>` 방식 |
| **Build Tool** | Vite | 고속 번들링 및 빌드 환경 구축 |
| **CSS Framework** | Tailwind CSS | 유틸리티 퍼스트 디자인 및 빠른 스타일링 |
| **Database** | Browser LocalStorage | 백엔드 서버리스 아키텍처 설계 |

---

## 4. 데이터 출처 및 라이선스 (Data Sources & License)

- **지도 서비스**: [Leaflet.js](https://leafletjs.com/) (OpenStreetMap 기반 오픈소스 라이선스 준수)
- **AI 서비스**: OpenAI API (`gpt-5-mini` 모델 활용 계약 및 약관 준수)
- **날씨 데이터 출처**: OpenWeatherMap API

---

## 5. 시작하기 (Getting Started)

### 환경 변수 설정 (Environment Variables)
본 프로젝트는 **OpenAI API Key** 및 **OpenWeatherMap API Key**를 필요로 합니다. 
보안을 위해 `.env` 파일은 Repository에 포함되어 있지 않으므로, 로컬 실행 시 프로젝트 루트 디렉토리에 `.env` 파일을 생성한 후 아래와 같이 설정해야 합니다.

> ⚠️ **중요 (제출 및 배포 시 유의사항):** 
> - `.env` 파일은 소스코드 제출 시 **Git Repository에 포함되지 않도록** 주의해 주세요. (이미 `.gitignore`에 등록되어 있습니다.)
> - Netlify 등 배포 사이트에 배포할 경우, 해당 배포 플랫폼(Netlify Dashboard > Site configuration > Environment variables)에 직접 환경 변수를 등록해야 정상 작동합니다.

```env
# .env 예시
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENWEATHERMAP_API_KEY=your_openweathermap_api_key_here
```

### 설치 및 로컬 실행
```bash
# 1. 패키지 설치
npm install

# 2. 로컬 개발 서버 실행
npm run dev

# 3. 배포용 빌드
npm run build
```