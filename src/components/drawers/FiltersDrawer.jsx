import { HiOutlineAdjustments } from 'react-icons/hi'
import Drawer from '../ui/Drawer.jsx'
import { brands } from '../../data/products.js'
import { useApp } from '../../context/AppContext.jsx'

const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹1,500', min: 500, max: 1500 },
  { label: '₹1,500 – ₹3,000', min: 1500, max: 3000 },
  { label: '₹3,000 – ₹7,500', min: 3000, max: 7500 },
  { label: '₹7,500+', min: 7500, max: Infinity },
]

export default function FiltersDrawer({ open, onClose, onApply }) {
  const { categories } = useApp()
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Refine"
      subtitle="Narrow down what you see"
      icon={HiOutlineAdjustments}
      width="max-w-md"
      footer={
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-outline flex-1">Reset</button>
          <button
            onClick={() => {
              onApply?.()
              onClose()
            }}
            className="btn-primary flex-1"
          >
            Show results
          </button>
        </div>
      }
    >
      <div className="p-5 space-y-6">
        <Section title="Category">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.key}
                className="chip bg-ink-100 text-ink-700 hover:bg-brand-500 hover:text-white"
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Price">
          <ul className="space-y-1">
            {PRICE_RANGES.map((r) => (
              <li key={r.label}>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink-50 cursor-pointer">
                  <input type="radio" name="price" className="accent-brand-500" />
                  <span>{r.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Brand">
          <div className="space-y-1 max-h-48 overflow-auto pr-1">
            {brands.map((b) => (
              <label key={b} className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink-50 cursor-pointer">
                <input type="checkbox" className="accent-brand-500" />
                <span>{b}</span>
              </label>
            ))}
          </div>
        </Section>

        <Section title="Rating">
          {[4, 3, 2, 1].map((r) => (
            <label key={r} className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink-50 cursor-pointer">
              <input type="radio" name="rating" className="accent-brand-500" />
              <span className="inline-flex items-center gap-1">
                {'★'.repeat(r)}
                {'☆'.repeat(5 - r)}
                <span className="text-ink-500 text-sm ml-1">& up</span>
              </span>
            </label>
          ))}
        </Section>

        <Section title="Other">
          <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink-50">
            <input type="checkbox" className="accent-brand-500" /> Free Shipping
          </label>
          <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink-50">
            <input type="checkbox" className="accent-brand-500" /> In Stock
          </label>
          <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink-50">
            <input type="checkbox" className="accent-brand-500" /> On Sale
          </label>
        </Section>
      </div>
    </Drawer>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-display font-semibold text-ink-900 mb-2">{title}</h3>
      {children}
    </div>
  )
}
