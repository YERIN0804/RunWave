// src/services/postService.js
// 게시글을 localStorage에 저장하고 관리하는 유틸 함수들입니다.
// Vue 컴포넌트에서 import 해서 사용하세요.
// 주의: 로컬 environment에서 간단히 동작하도록 비밀번호를 평문으로 저장합니다.
// 실서비스에서는 절대로 이렇게 하지 말고 해시/서버 검증을 사용하세요.

const STORAGE_KEY = 'posts' // localStorage에 저장할 key 이름
const LIKED_POST_IDS_KEY = 'likedPostIds' // 좋아요한 글 id를 저장할 key 이름

/**
 * 숫자값을 안전하게 변환합니다.
 * - 잘못된 값이 들어와도 기본값으로 복구합니다.
 */
function safeNumber(value, fallback = 0) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

/**
 * 게시글 객체를 안전하게 정규화합니다.
 * - 기존 데이터에 새 필드가 없더라도 기본값을 넣어줍니다.
 */
function normalizePost(post) {
  if (!post || typeof post !== 'object') return null

  const normalized = { ...post }

  normalized.id = post.id ? String(post.id) : ''

  normalized.title =
    typeof post.title === 'string' && post.title.trim() !== ''
      ? post.title
      : ''

  normalized.content =
    typeof post.content === 'string'
      ? post.content
      : ''

  normalized.password =
    typeof post.password === 'string'
      ? post.password
      : ''

  normalized.createdAt =
    typeof post.createdAt === 'string' && post.createdAt
      ? post.createdAt
      : new Date().toISOString()

  normalized.updatedAt =
    typeof post.updatedAt === 'string' && post.updatedAt
      ? post.updatedAt
      : null

  // 새 모집글 필드 기본값 처리
  normalized.recruitmentTitle =
    typeof post.recruitmentTitle === 'string' && post.recruitmentTitle.trim() !== ''
      ? post.recruitmentTitle
      : (normalized.title || '제목 없음')

  // 기존 화면과 호환되도록 title과 recruitmentTitle을 동일하게 유지
  normalized.title = normalized.recruitmentTitle

  normalized.courseName =
    typeof post.courseName === 'string' && post.courseName.trim() !== ''
      ? post.courseName
      : '코스 미정'

  normalized.meetingDate =
    typeof post.meetingDate === 'string' && post.meetingDate.trim() !== ''
      ? post.meetingDate
      : '날짜 미정'

  normalized.meetingTime =
    typeof post.meetingTime === 'string' && post.meetingTime.trim() !== ''
      ? post.meetingTime
      : '시간 미정'

  normalized.maxParticipants = safeNumber(post.maxParticipants, 0)

  normalized.difficulty =
    typeof post.difficulty === 'string' && post.difficulty.trim() !== ''
      ? post.difficulty
      : '난이도 미정'

  normalized.meetingPlace =
    typeof post.meetingPlace === 'string' && post.meetingPlace.trim() !== ''
      ? post.meetingPlace
      : '장소 미정'

  normalized.description =
    typeof post.description === 'string' && post.description.trim() !== ''
      ? post.description
      : (normalized.content || '')

  // 기존 content와 description을 동일하게 유지
  normalized.content = normalized.description

  normalized.views = safeNumber(post.views, 0)
  normalized.likes = safeNumber(post.likes, 0)

  return normalized
}

/**
 * 로컬스토리지에서 게시글 목록을 읽어옵니다.
 * - 기존 데이터가 있어도 새 필드가 없으면 기본값을 넣어줍니다.
 * - 반환값: 게시글 배열 (없으면 빈 배열)
 */
export function getPosts() {
  const json = localStorage.getItem(STORAGE_KEY)
  if (!json) return []

  try {
    const parsed = JSON.parse(json)

    if (!Array.isArray(parsed)) return []

    const posts = parsed
      .map((post) => normalizePost(post))
      .filter(Boolean)

    // 최신 글이 위에 오도록 정렬
    posts.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))

    return posts
  } catch (e) {
    console.error('Failed to parse posts from localStorage', e)
    return []
  }
}

/**
 * 게시글 배열을 로컬스토리지에 저장합니다.
 * - 저장 전 정규화해서 안전하게 저장합니다.
 */
export function savePosts(posts) {
  const safePosts = Array.isArray(posts)
    ? posts.map((post) => normalizePost(post)).filter(Boolean)
    : []

  localStorage.setItem(STORAGE_KEY, JSON.stringify(safePosts))
}

/**
 * 새로운 게시글을 추가합니다.
 * - 기존 title/content는 유지하면서 새 모집글 필드도 함께 저장합니다.
 * - 반환: 생성된 post 객체
 */
export function addPost({
  title,
  content,
  password,
  recruitmentTitle,
  courseName,
  meetingDate,
  meetingTime,
  maxParticipants,
  difficulty,
  meetingPlace,
  description,
}) {
  const safeTitle =
    typeof recruitmentTitle === 'string' && recruitmentTitle.trim() !== ''
      ? recruitmentTitle
      : (typeof title === 'string' ? title : '')

  if (typeof safeTitle !== 'string' || safeTitle.trim() === '') {
    throw new Error('제목을 입력하세요.')
  }

  const safeContent =
    typeof description === 'string'
      ? description
      : (typeof content === 'string' ? content : '')

  if (typeof safeContent !== 'string') {
    throw new Error('내용을 입력하세요.')
  }

  if (typeof password !== 'string' || password.length < 4) {
    throw new Error('비밀번호는 4자리 이상이어야 합니다.')
  }

  const posts = getPosts()

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  const newPost = {
    id,
    title: safeTitle.trim(),
    content: safeContent,
    password, // 로컬 데모용 평문 저장
    recruitmentTitle: safeTitle.trim(),
    courseName:
      typeof courseName === 'string' && courseName.trim() !== ''
        ? courseName
        : '코스 미정',
    meetingDate:
      typeof meetingDate === 'string' && meetingDate.trim() !== ''
        ? meetingDate
        : '날짜 미정',
    meetingTime:
      typeof meetingTime === 'string' && meetingTime.trim() !== ''
        ? meetingTime
        : '시간 미정',
    maxParticipants: safeNumber(maxParticipants, 0),
    difficulty:
      typeof difficulty === 'string' && difficulty.trim() !== ''
        ? difficulty
        : '난이도 미정',
    meetingPlace:
      typeof meetingPlace === 'string' && meetingPlace.trim() !== ''
        ? meetingPlace
        : '장소 미정',
    description: safeContent,
    createdAt: new Date().toISOString(),
    updatedAt: null,
    views: 0,
    likes: 0,
  }

  posts.push(newPost)

  // 최신 글이 위에 오도록 저장 전에 정렬
  posts.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))

  savePosts(posts)
  return newPost
}

/**
 * id로 게시글을 조회합니다.
 * - 기존 데이터도 안전하게 불러옵니다.
 * - 반환: post 객체 또는 null
 */
export function getPostById(id) {
  if (!id) return null

  const posts = getPosts()
  const found = posts.find((p) => String(p.id) === String(id))

  return found || null
}

/**
 * 게시글을 수정합니다.
 * - 기존 비밀번호 검증은 유지합니다.
 * - 새 모집글 필드도 함께 수정할 수 있습니다.
 * - 전달되지 않은 필드는 기존 값을 유지합니다.
 * - 반환: { success: boolean, message: string, post?: object }
 */
export function updatePost(
  id,
  {
    title,
    content,
    password,
    recruitmentTitle,
    courseName,
    meetingDate,
    meetingTime,
    maxParticipants,
    difficulty,
    meetingPlace,
    description,
  }
) {
  const posts = getPosts()
  const index = posts.findIndex((p) => String(p.id) === String(id))

  if (index === -1) {
    return { success: false, message: '글을 찾을 수 없습니다.' }
  }

  const post = posts[index]

  if (String(post.password) !== String(password)) {
    return { success: false, message: '비밀번호가 일치하지 않습니다.' }
  }

  // 제목/내용 업데이트
  if (typeof recruitmentTitle === 'string') {
    post.recruitmentTitle = recruitmentTitle.trim() || post.recruitmentTitle
    post.title = post.recruitmentTitle
  } else if (typeof title === 'string') {
    post.title = title.trim() || post.title
    post.recruitmentTitle = post.title
  }

  if (typeof description === 'string') {
    post.description = description
    post.content = description
  } else if (typeof content === 'string') {
    post.content = content
    post.description = content
  }

  // 모집 정보 업데이트
  if (typeof courseName === 'string') {
    post.courseName = courseName.trim() || post.courseName
  }

  if (typeof meetingDate === 'string') {
    post.meetingDate = meetingDate.trim() || post.meetingDate
  }

  if (typeof meetingTime === 'string') {
    post.meetingTime = meetingTime.trim() || post.meetingTime
  }

  if (typeof maxParticipants !== 'undefined') {
    post.maxParticipants = safeNumber(maxParticipants, post.maxParticipants || 0)
  }

  if (typeof difficulty === 'string') {
    post.difficulty = difficulty.trim() || post.difficulty
  }

  if (typeof meetingPlace === 'string') {
    post.meetingPlace = meetingPlace.trim() || post.meetingPlace
  }

  post.updatedAt = new Date().toISOString()

  // 최신 글이 위에 오도록 정렬
  posts.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
  savePosts(posts)

  return { success: true, message: '수정되었습니다.', post }
}

/**
 * 게시글을 삭제합니다.
 * - 기존 삭제 로직은 유지합니다.
 * - 삭제된 글의 좋아요 정보도 함께 정리합니다.
 */
export function deletePost(id, password) {
  const posts = getPosts()
  const index = posts.findIndex((p) => String(p.id) === String(id))

  if (index === -1) {
    return { success: false, message: '글을 찾을 수 없습니다.' }
  }

  const post = posts[index]

  if (String(post.password) !== String(password)) {
    return { success: false, message: '비밀번호가 일치하지 않습니다.' }
  }

  posts.splice(index, 1)
  savePosts(posts)

  // 삭제된 글은 좋아요 목록에서도 제거
  const likedIds = getLikedPostIds().filter((likedId) => String(likedId) !== String(id))
  localStorage.setItem(LIKED_POST_IDS_KEY, JSON.stringify(likedIds))

  return { success: true, message: '삭제되었습니다.' }
}

/**
 * 게시글 조회수를 1 증가시킵니다.
 * - 수정된 게시글 객체를 반환합니다.
 * - 찾지 못하면 null을 반환합니다.
 */
export function incrementPostViews(id) {
  const posts = getPosts()
  const index = posts.findIndex((p) => String(p.id) === String(id))

  if (index === -1) return null

  const post = posts[index]
  post.views = safeNumber(post.views, 0) + 1

  savePosts(posts)
  return post
}

/**
 * 좋아요한 게시글 id 배열을 반환합니다.
 * - 데이터가 없거나 오류가 있으면 빈 배열을 반환합니다.
 */
export function getLikedPostIds() {
  const json = localStorage.getItem(LIKED_POST_IDS_KEY)
  if (!json) return []

  try {
    const parsed = JSON.parse(json)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => String(item))
      .filter(Boolean)
  } catch (e) {
    console.error('Failed to parse likedPostIds from localStorage', e)
    return []
  }
}

/**
 * 현재 브라우저에서 해당 글에 좋아요를 눌렀는지 확인합니다.
 */
export function isPostLiked(id) {
  if (!id) return false
  return getLikedPostIds().includes(String(id))
}

/**
 * 좋아요를 토글합니다.
 * - 아직 안 눌렀으면 likes 증가 및 likedPostIds에 추가
 * - 이미 눌렀으면 likes 감소 및 likedPostIds에서 제거
 * - 반환 형식: { success, liked, likes, message }
 */
export function togglePostLike(id) {
  const posts = getPosts()
  const index = posts.findIndex((p) => String(p.id) === String(id))

  if (index === -1) {
    return {
      success: false,
      liked: false,
      likes: 0,
      message: '글을 찾을 수 없습니다.',
    }
  }

  const post = posts[index]
  const likedIds = getLikedPostIds()
  const idString = String(id)

  const alreadyLiked = likedIds.includes(idString)

  if (alreadyLiked) {
    post.likes = Math.max(0, safeNumber(post.likes, 0) - 1)

    const nextLikedIds = likedIds.filter((likedId) => String(likedId) !== idString)
    localStorage.setItem(LIKED_POST_IDS_KEY, JSON.stringify(nextLikedIds))

    savePosts(posts)

    return {
      success: true,
      liked: false,
      likes: post.likes,
      message: '좋아요를 취소했습니다.',
    }
  }

  post.likes = safeNumber(post.likes, 0) + 1

  const nextLikedIds = [...likedIds, idString]
  localStorage.setItem(LIKED_POST_IDS_KEY, JSON.stringify(nextLikedIds))

  savePosts(posts)

  return {
    success: true,
    liked: true,
    likes: post.likes,
    message: '좋아요를 눌렀습니다.',
  }
}