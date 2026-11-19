import { FaQuoteLeft } from 'react-icons/fa'

const REVIEWS = [
  {
    name: 'Maya P.',
    role: 'Verified buyer',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=faces&q=80',
    text: 'Shipping was lightning fast and the packaging felt like a gift. The headphones are unreal.',
  },
  {
    name: 'Devon K.',
    role: 'Verified buyer',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces&q=80',
    text: 'Finally an online store that curates taste. The home section is dangerously good.',
  },
  {
    name: 'Lina S.',
    role: 'Verified buyer',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=faces&q=80',
    text: 'Returns were painless and I actually liked the support agent. 10/10.',
  },
]

export default function ReviewsStrip() {
  return (
    <section className="container-page mt-16">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="section-title">Loved by real people</h2>
        <p className="text-sm text-ink-500 mt-1">Over 32,000 happy customers worldwide.</p>
      </div>
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {REVIEWS.map((r) => (
          <figure
            key={r.name}
            className="p-5 rounded-3xl bg-white border border-ink-100 hover:shadow-soft transition"
          >
            <FaQuoteLeft className="text-brand-300" />
            <blockquote className="mt-3 text-ink-700 leading-relaxed">"{r.text}"</blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-medium text-ink-900">{r.name}</p>
                <p className="text-xs text-ink-500">{r.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
