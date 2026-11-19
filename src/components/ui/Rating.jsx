import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'

export default function Rating({ value = 0, size = 14 }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (value >= i) stars.push(<FaStar key={i} size={size} className="text-accent-500" />)
    else if (value >= i - 0.5)
      stars.push(<FaStarHalfAlt key={i} size={size} className="text-accent-500" />)
    else stars.push(<FaRegStar key={i} size={size} className="text-ink-300" />)
  }
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Rated ${value} of 5`}>
      {stars}
    </span>
  )
}
