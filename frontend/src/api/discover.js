import api from './axiosInstance'
import { getStartups } from './startups'
import { getGlobalFeed } from './posts'

export async function searchUsers(query) {
  const { data } = await api.get('/discovery/search/users', {
    params: { q: query },
  })
  return data
}

export async function searchStartups(query) {
  const startups = await getStartups()
  const term = query.trim().toLowerCase()

  if (!term) {
    return startups
  }

  return startups.filter((startup) =>
    [startup.name, startup.slug, startup.industry, startup.location]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(term)),
  )
}

export async function searchPosts(query) {
  const posts = await getGlobalFeed()
  const term = query.trim().toLowerCase()

  if (!term) {
    return posts
  }

  return posts.filter((post) => post.content.toLowerCase().includes(term))
}

export async function getSuggested() {
  const { data } = await api.get('/discovery/suggestions')
  return data
}

export async function getNotifications() {
  const { data } = await api.get('/notifications')
  return data
}

export async function markNotificationRead(notificationId) {
  const { data } = await api.put(`/notifications/${notificationId}/read`)
  return data
}
