export default function PostGrid({ posts, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {posts.map((post) => (
        <button
          key={post.id}
          type="button"
          onClick={() => onSelect(post)}
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-left"
        >
          {post.imageUrl ? (
            <img src={post.imageUrl} alt={post.content} className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105" />
          ) : (
            <div className="flex aspect-square items-end bg-gradient-to-br from-primary/25 via-slate-800 to-emerald-500/20 p-4">
              <p className="line-clamp-4 text-sm text-white/90">{post.content}</p>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
