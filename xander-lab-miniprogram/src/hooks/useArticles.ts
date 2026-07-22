import { useEffect, useState } from 'react'
import { blogApi, type Article, type ArticleQuery } from '@/api/blog'

export function useArticles(query: ArticleQuery = {}) {
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { search = '', category = '', tag = '', page = 1, size = 10 } = query

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    blogApi
      .getArticles({ search, category, tag, page, size })
      .then(data => {
        if (!active) return
        setArticles(data.records || [])
        setTotal(data.total || 0)
      })
      .catch(reason => {
        if (!active) return
        setArticles([])
        setTotal(0)
        setError(reason instanceof Error ? reason.message : '文章加载失败')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [category, page, search, size, tag])

  return { articles, total, loading, error }
}
