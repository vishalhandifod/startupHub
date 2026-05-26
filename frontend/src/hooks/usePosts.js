import { useCallback, useEffect, useState } from 'react'
import { getFeed } from '../api/posts'

export function usePosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getFeed()
      setPosts(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    async function bootstrap() {
      try {
        const data = await getFeed()
        if (active) {
          setPosts(data)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    async function handlePostCreated() {
      try {
        await loadPosts()
      } catch {
        // The page-level consumer already owns error reporting for feed failures.
      }
    }

    window.addEventListener('startuphub:post-created', handlePostCreated)
    return () => {
      window.removeEventListener('startuphub:post-created', handlePostCreated)
    }
  }, [loadPosts])

  return { posts, setPosts, loading, reloadPosts: loadPosts }
}
