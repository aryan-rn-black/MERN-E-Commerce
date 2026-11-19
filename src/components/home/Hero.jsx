import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Link } from 'react-router-dom'
import { banners } from '../../data/products.js'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'

export default function Hero() {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: 'start' })
  const [selected, setSelected] = useState(0)

  const scrollPrev = useCallback(() => embla && embla.scrollPrev(), [embla])
  const scrollNext = useCallback(() => embla && embla.scrollNext(), [embla])
  const scrollTo = useCallback((i) => embla && embla.scrollTo(i), [embla])

  useEffect(() => {
    if (!embla) return
    const onSelect = () => setSelected(embla.selectedScrollSnap())
    embla.on('select', onSelect)
    onSelect()
    const id = setInterval(() => embla.scrollNext(), 6000)
    return () => {
      embla.off('select', onSelect)
      clearInterval(id)
    }
  }, [embla])

  return (
    <section className="container-page pt-6">
      <div className="relative overflow-hidden rounded-3xl bg-ink-200" ref={emblaRef}>
        <div className="flex">
          {banners.map((b, i) => (
            <div
              key={b.id}
              className="relative min-w-0 flex-[0_0_100%] aspect-[16/8] sm:aspect-[16/7] md:aspect-[16/6]"
            >
              <img
                src={b.bg}
                alt={b.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${b.accent}`} />
              <div className="relative h-full flex items-center">
                <div className="max-w-xl px-6 sm:px-12 text-white">
                  <p className="inline-flex items-center gap-1 chip bg-white/15 backdrop-blur text-white">
                    ✨ Featured
                  </p>
                  <h1 className="mt-3 font-display text-3xl sm:text-5xl font-extrabold leading-tight text-balance drop-shadow">
                    {b.title}
                  </h1>
                  <p className="mt-2 text-white/90 text-base sm:text-lg max-w-md">
                    {b.subtitle}
                  </p>
                  <Link
                    to={b.link}
                    className="inline-flex mt-5 items-center gap-2 px-5 py-3 rounded-xl bg-white text-ink-900 font-semibold hover:bg-brand-50"
                  >
                    {b.cta} →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Arrows */}
        <button
          aria-label="Previous slide"
          onClick={scrollPrev}
          className="hidden md:grid place-items-center absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-ink-900 shadow"
        >
          <HiChevronLeft size={22} />
        </button>
        <button
          aria-label="Next slide"
          onClick={scrollNext}
          className="hidden md:grid place-items-center absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-ink-900 shadow"
        >
          <HiChevronRight size={22} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                selected === i ? 'w-8 bg-white' : 'w-3 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
