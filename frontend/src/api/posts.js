import api from './axiosInstance'

export async function getFeed() {
  const { data } = await api.get('/discovery/feed')
  return data
}

export async function getGlobalFeed() {
  const { data } = await api.get('/posts')
  return data
}

export async function createPost(payload) {
  const { data } = await api.post('/posts', payload)
  return data
}

export async function likePost(postId) {
  const { data } = await api.post(`/posts/${postId}/likes`)
  return data
}

export async function unlikePost(postId) {
  const { data } = await api.delete(`/posts/${postId}/likes`)
  return data
}

export async function getComments(postId) {
  const { data } = await api.get(`/posts/${postId}/comments`)
  return data
}

export async function commentPost(postId, payload) {
  const { data } = await api.post(`/posts/${postId}/comments`, payload)
  return data
}
