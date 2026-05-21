import { useEffect, useState } from 'react'
import { getFeed } from '../api/posts'

export function usePosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    async function loadPosts() {
      try {
        const data = await getFeed()
        if (!ignore) {
          setPosts(data)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadPosts()

    return () => {
      ignore = true
    }
  }, [])

  return { posts, setPosts, loading }
}
