/**
 * 부산 러닝 코스 데이터
 * 데이터 의존성 없이 고정된 좌표값으로 안정적인 맵 렌더링을 제공합니다.
 */
export const courses = [
  {
    id: "gwangalli",
    title: "🏃 광안리 해변",
    distance: "왕복 약 5km",
    description: "광안리 해변을 따라 바다 경치를 즐기며 달리는 초보자용 코스",
    points: [
      { label: "출발 - 민락수변공원 입구", lat: 35.1549187, lng: 129.1335785 },
      { label: "도착 - 삼익비치 수변공원", lat: 35.1462920, lng: 129.1148036}
    ]
  },
  {
    id: "haeundae",
    title: "🏃 해운대 동백섬 코스",
    distance: "왕복 약 5km",
    description: "동백섬과 해운대 해변을 잇는 시원한 바다 코스",
    points: [
      { label: "출발 - 동백섬 등대", lat: 35.1524382, lng: 129.1526300 },
      { label: "도착 - 미포항", lat: 35.1581939, lng: 129.1711963 }
    ]
  },
  {
    id: "songjeong",
    title: "🏃 송정 해변",
    distance: "왕복 약 5km",
    description: "송정 해변을 따라 서핑 분위기 속에서 달리는 코스",
    points: [
      { label: "출발 - 죽도공원", lat: 35.1803497, lng: 129.2053465},
      { label: "도착 - 송정구덕포길", lat: 35.1679225,lng: 129.1968265 }
    ]
  },
  {
    id: "dadaepo",
    title: "🏃 다대포 해변",
    distance: "약 5km",
    description: "넓은 백사장과 일몰이 아름다운 다대포 코스",
    points: [
      { label: "출발 - 다대포해수욕장 동쪽 끝", lat: 35.0440351, lng: 128.9670457 },
      { label: "중간1 - 다대포해수욕장", lat: 35.0498351, lng: 128.9594366 },
      { label: "중간2 - 다대포 길", lat: 35.0616740, lng: 128.9555313 },
      { label: "도착 - 장림도시 가스삼거리", lat: 35.0784633, lng: 128.9512827 }
    ]
  },
  {
    id: "eulsukdo",
    title: "🏃 을숙도 생태공원",
    distance: "왕복 약 5km",
    description: "철새공원과 생태공원을 둘러보는 자연형 러닝 코스",
    points: [
      { label: "출발 - 을숙도기후 생태교육공원", lat: 35.0894169, lng: 128.9404752 },
      { label: "도착 - 조류관찰소", lat: 35.1091847, lng:128.9488866 }
    ]
  },
  {
    id: "yeongdo",
    title: "🏃 영도 바다 전망 코스",
    distance: "왕복 약 5.5km",
    description: "영도 바다 전망을 즐기며 달리는 해안 루트",
    points: [
      { label: "출발 - 부산남항동 방파제등대", lat: 35.0854972, lng: 129.0345160},
      { label: "도착 - 75 광장", lat: 35.0708099, lng: 129.0578985 }
    ]
  }
];

// 기존 컴포넌트와의 호환성을 위해 함수로도 Export 합니다.
export async function loadRunningCourses() {
  return courses;
}