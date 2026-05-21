import api from './axiosInstance'

export async function getConversations() {
  const { data } = await api.get('/messages/conversations')
  return data
}

export async function getMessages(userId) {
  const { data } = await api.get(`/messages/${userId}`)
  return data
}

export async function sendMessage(payload) {
  const { data } = await api.post('/messages', payload)
  return data
}
