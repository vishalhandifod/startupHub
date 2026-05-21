import api from './axiosInstance'

export async function getStartups() {
  const { data } = await api.get('/startups')
  return data
}

export async function getStartup(startupId) {
  const { data } = await api.get(`/startups/${startupId}`)
  return data
}

export async function createStartup(payload) {
  const { data } = await api.post('/startups', payload)
  return data
}

export async function updateStartup(startupId, payload) {
  const { data } = await api.put(`/startups/${startupId}`, payload)
  return data
}

export async function followStartup(startupId) {
  const { data } = await api.post(`/startups/${startupId}/follow`)
  return data
}

export async function unfollowStartup(startupId) {
  const { data } = await api.delete(`/startups/${startupId}/follow`)
  return data
}
