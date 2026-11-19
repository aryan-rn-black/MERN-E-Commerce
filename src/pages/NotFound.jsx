import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="font-display text-7xl font-extrabold bg-gradient-to-br from-brand-500 to-fuchsia-600 bg-clip-text text-transparent">
        404
      </p>
      <h1 className="font-display text-3xl font-extrabold mt-2">Lost in the Verse</h1>
      <p className="text-ink-500 mt-2">The page you're looking for went for a stroll.</p>
      <Link to="/" className="btn-primary mt-5 inline-flex">Take me home</Link>
    </div>
  )
}
