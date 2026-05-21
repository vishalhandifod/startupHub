import api from './axiosInstance'

export async function getMyProfile() {
  const { data } = await api.get('/profile/me')
  return data
}

export async function getProfile(userId) {
  const { data } = await api.get(`/profile/${userId}`)
  return data
}

export async function updateProfile(payload) {
  const { data } = await api.put('/profile/me', payload)
  return data
}

export async function followUser(userId) {
  const { data } = await api.post(`/profile/${userId}/follow`)
  return data
}

export async function unfollowUser(userId) {
  const { data } = await api.delete(`/profile/${userId}/follow`)
  return data
}

export async function getFollowers(userId) {
  const { data } = await api.get(`/profile/${userId}/followers`)
  return data
}

export async function getFollowing(userId) {
  const { data } = await api.get(`/profile/${userId}/following`)
  return data
}
