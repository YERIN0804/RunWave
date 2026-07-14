// src/services/postService.js
// 게시글을 localStorage에 저장하고 관리하는 유틸 함수들입니다.
// Vue 컴포넌트에서 import 해서 사용하세요.
// 주의: 로컬 environment에서 간단히 동작하도록 비밀번호를 평문으로 저장합니다.
// 실서비스에서는 절대로 이렇게 하지 말고 해시/서버 검증을 사용하세요.

const STORAGE_KEY = 'posts' // localStorage에 저장할 key 이름

/**
 * 로컬스토리지에서 게시글 목록을 읽어옵니다.
 * - 왜 필요한가: 앱이 시작되거나 목록을 새로고침할 때 저장된 데이터를 불러와 화면에 표시해야 하기 때문입니다.
 * - 반환값: 게시글 배열 (없으면 빈 배열)
 */
export function getPosts() {
  const json = localStorage.getItem(STORAGE_KEY)
  if (!json) return []
  try {
    const posts = JSON.parse(json)
    // 안전을 위해 배열 형태인지 확인
    return Array.isArray(posts) ? posts : []
  } catch (e) {
    // 파싱 오류가 발생하면 빈 배열로 복구
    console.error('Failed to parse posts from localStorage', e)
    return []
  }
}

/**
 * 게시글 배열을 로컬스토리지에 저장합니다.
 * - 왜 필요한가: 게시글 추가/수정/삭제 후 변경 사항을 영구 저장하려면 로컬스토리지에 기록해야 합니다.
 * - 입력: posts(배열)
 */
export function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

/**
 * 새로운 게시글을 추가합니다.
 * - 왜 필요한가: 작성 폼에서 입력 받은 제목/내용/비밀번호를 한 건으로 저장합니다.
 * - 유효성: 비밀번호는 4자 이상이어야 함
 * - 반환: 생성된 post 객체
 */
export function addPost({ title, content, password }) {
  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error('제목을 입력하세요.')
  }
  if (typeof content !== 'string') {
    throw new Error('내용을 입력하세요.')
  }
  if (typeof password !== 'string' || password.length < 4) {
    throw new Error('비밀번호는 4자리 이상이어야 합니다.')
  }

  const posts = getPosts()

  // 간단한 고유 id 생성: 시간 + 랜덤
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  const newPost = {
    id,
    title: title.trim(),
    content,
    password, // 로컬 데모용 평문 저장 (실 서비스에서는 해시화가 필요)
    createdAt: new Date().toISOString(),
    updatedAt: null,
  }

  posts.push(newPost)

  // 최신 글이 위에 오도록 저장 전에 정렬 (createdAt 내림차순)
  posts.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))

  savePosts(posts)
  return newPost
}

/**
 * id로 게시글을 조회합니다.
 * - 왜 필요한가: 상세보기나 수정화면에서 특정 글을 불러오기 위해 사용합니다.
 * - 반환: post 객체 또는 null
 */
export function getPostById(id) {
  if (!id) return null
  const posts = getPosts()
  return posts.find((p) => p.id === id) || null
}

/**
 * 게시글을 수정합니다.
 * - 왜 필요한가: 사용자가 제목/내용을 변경할 때 비밀번호 확인 후 변경을 반영합니다.
 * - 동작: 비밀번호가 일치하면 title/content를 업데이트하고 updatedAt을 설정합니다.
 * - 반환: { success: boolean, message: string, post?: object }
 */
export function updatePost(id, { title, content, password }) {
  const posts = getPosts()
  const index = posts.findIndex((p) => p.id === id)
  if (index === -1) return { success: false, message: '글을 찾을 수 없습니다.' }

  const post = posts[index]
  if (post.password !== password) {
    return { success: false, message: '비밀번호가 일치하지 않습니다.' }
  }

  // 업데이트 가능한 값만 적용
  post.title = typeof title === 'string' ? title.trim() : post.title
  post.content = typeof content === 'string' ? content : post.content
  post.updatedAt = new Date().toISOString()

  // 유지할 정렬: 최신 글이 위에 있도록 createdAt 기준 내림차순
  posts.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
  savePosts(posts)

  return { success: true, message: '수정되었습니다.', post }
}

/**
 * 게시글을 삭제합니다.
 * - 왜 필요한가: 사용자가 본인의 글을 삭제할 때 비밀번호 확인 후 삭제 처리합니다.
 * - 반환: { success: boolean, message: string }
 */
export function deletePost(id, password) {
  const posts = getPosts()
  const index = posts.findIndex((p) => p.id === id)
  if (index === -1) return { success: false, message: '글을 찾을 수 없습니다.' }

  const post = posts[index]
  if (post.password !== password) {
    return { success: false, message: '비밀번호가 일치하지 않습니다.' }
  }

  posts.splice(index, 1)
  savePosts(posts)
  return { success: true, message: '삭제되었습니다.' }
}

