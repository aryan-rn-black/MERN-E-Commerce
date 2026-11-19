import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  HiCheckCircle,
  HiOutlineCreditCard,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineTag,
  HiOutlineQrCode,
  HiOutlineBuildingLibrary,
  HiOutlineBanknotes,
  HiOutlineDevicePhoneMobile,
  HiOutlineCheckBadge,
  HiOutlineArrowPath,
  HiOutlineExclamationCircle
} from 'react-icons/hi2'
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaGooglePay } from 'react-icons/fa6'
import { SiPhonepe, SiPaytm } from 'react-icons/si'
import { useApp } from '../context/AppContext.jsx'
import { formatCurrency } from '../utils/format.js'
import toast from 'react-hot-toast'

const POPULAR_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC' },
  { id: 'sbi', name: 'State Bank of India', code: 'SBI' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI' },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', code: 'KOTAK' },
  { id: 'pnb', name: 'Punjab National Bank', code: 'PNB' },
]

const ALL_BANKS = [
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'IndusInd Bank',
  'IDBI Bank',
  'Yes Bank',
  'Federal Bank',
  'RBL Bank',
  'IDFC FIRST Bank',
  'Indian Bank',
]

const PROMO_CODES = {
  SAVE10: { discount: 0.1, label: '10% OFF' },
  SHOP500: { flat: 500, label: '₹500 Flat OFF', min: 1999 },
  FREESHIP: { freeShipping: true, label: 'Free Express Delivery' },
}

export default function Checkout() {
  const navigate = useNavigate()
  const { cart = [], cartSubtotal = 0, placeOrder, user } = useApp()
  const [step, setStep] = useState(1)
  const [shippingMethod, setShippingMethod] = useState('Standard')
  const [activePaymentTab, setActivePaymentTab] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState('')

  // Coupon / Promo
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [promoError, setPromoError] = useState('')

  // Form Details
  const [form, setForm] = useState({
    email: user?.email || 'alex@shopverse.in',
    name: user?.name || 'Alex Carter',
    phone: '9876543210',
    address: '42, Brigade Road, MG Road Area',
    city: 'Bengaluru',
    state: 'Karnataka',
    zip: '560001',
    country: 'India',
    // Card details
    cardNumber: '4242 4242 4242 4242',
    cardRawNumber: '4242424242424242',
    cardHolder: user?.name || 'ALEX CARTER',
    exp: '12/29',
    cvc: '123',
    saveCard: true,
    // UPI details
    upiId: '',
    // Net banking
    bank: 'hdfc',
    // Wallet
    wallet: 'paytm',
    // COD
    codConfirmed: false,
  })

  // Detect Card Brand
  const cardBrand = useMemo(() => {
    const raw = (form.cardRawNumber || '').replace(/\D/g, '')
    if (raw.startsWith('4')) return 'visa'
    if (/^5[1-5]/.test(raw) || /^2[2-7]/.test(raw)) return 'mastercard'
    if (/^3[47]/.test(raw)) return 'amex'
    if (/^60|^65|^81|^82/.test(raw)) return 'rupay'
    return 'generic'
  }, [form.cardRawNumber])

  // Pricing calculations
  const safeSubtotal = Number(cartSubtotal) || 0
  const baseShipping = shippingMethod === 'Express' ? 99 : shippingMethod === 'Same-Day' ? 149 : safeSubtotal >= 499 ? 0 : 49
  const shipping = appliedPromo?.freeShipping ? 0 : baseShipping
  
  let discountAmount = 0
  if (appliedPromo) {
    if (appliedPromo.discount) {
      discountAmount = Math.round(safeSubtotal * appliedPromo.discount)
    } else if (appliedPromo.flat) {
      discountAmount = appliedPromo.flat
    }
  }

  const taxableAmount = Math.max(0, safeSubtotal - discountAmount)
  const tax = Math.round(taxableAmount * 0.18)
  const total = Math.max(0, taxableAmount + shipping + tax)

  const update = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }))

  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16)
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ')
    setForm((prev) => ({
      ...prev,
      cardRawNumber: val,
      cardNumber: formatted || '',
    }))
  }

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4)
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`
    }
    setForm((prev) => ({ ...prev, exp: val }))
  }

  const handleApplyPromo = (e) => {
    e.preventDefault()
    setPromoError('')
    const code = promoInput.trim().toUpperCase()
    if (!code) return

    if (PROMO_CODES[code]) {
      const p = PROMO_CODES[code]
      if (p.min && safeSubtotal < p.min) {
        setPromoError(`Minimum cart value of ₹${p.min} required for this coupon`)
        return
      }
      setAppliedPromo({ code, ...p })
      toast.success(`Coupon ${code} applied!`)
      setPromoInput('')
    } else {
      setPromoError('Invalid coupon code. Try "SAVE10" or "SHOP500"')
    }
  }

  const handleNext = async (e) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setIsProcessing(true)
      setProcessingStage('Connecting to secure 256-bit payment gateway...')

      setTimeout(() => {
        setProcessingStage(
          activePaymentTab === 'upi'
            ? 'Awaiting UPI authentication from banking app...'
            : activePaymentTab === 'cod'
            ? 'Generating Cash on Delivery confirmation token...'
            : 'Authorizing transaction with bank...'
        )
      }, 800)

      setTimeout(async () => {
        try {
          const paymentLabel =
            activePaymentTab === 'card'
              ? `Card ending in ${(form.cardRawNumber || '').slice(-4) || '4242'}`
              : activePaymentTab === 'upi'
              ? `UPI (${form.upiId || 'Quick QR Scan'})`
              : activePaymentTab === 'netbanking'
              ? `Net Banking (${(form.bank || '').toUpperCase()})`
              : activePaymentTab === 'wallet'
              ? `Wallet (${form.wallet})`
              : 'Cash on Delivery (COD)'

          await placeOrder({
            customer: {
              name: form.name,
              email: form.email,
              phone: form.phone,
              address: form.address,
              city: form.city,
              state: form.state,
              zip: form.zip,
              country: form.country,
            },
            items: cart,
            subtotal: safeSubtotal,
            discount: discountAmount,
            shippingFee: shipping,
            tax,
            total,
            shippingMethod,
            paymentMethod: paymentLabel,
          })

          toast.success('Payment authorized & Order placed! 🎉')
          navigate('/checkout/success')
        } catch (err) {
          toast.error(err?.message || 'Payment failed. Please try again.')
          setIsProcessing(false)
        }
      }, 1600)
    }
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="container-page py-24 text-center max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center text-3xl shadow-soft">
          🛒
        </div>
        <h2 className="text-2xl font-display font-extrabold mt-6 text-ink-900">Your Cart is Empty</h2>
        <p className="text-ink-500 mt-2 text-sm">
          Add items to your cart to proceed with our secure instant checkout.
        </p>
        <Link to="/products" className="btn-primary mt-6 inline-flex shadow-brand px-6 py-3">
          Explore Best Deals
        </Link>
      </div>
    )
  }

  return (
    <div className="container-page py-8 lg:py-12 relative">
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-brand-500/20 animate-ping"></div>
            <div className="w-24 h-24 rounded-full border-4 border-t-brand-400 border-r-brand-400 border-b-transparent border-l-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-brand-300">
              <HiOutlineLockClosed size={32} />
            </div>
          </div>
          <h3 className="font-display font-black text-2xl tracking-tight">Processing Secure Payment</h3>
          <p className="text-brand-200 text-sm mt-2 max-w-sm">{processingStage}</p>
          <div className="mt-6 flex items-center gap-2 text-xs text-ink-400 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
            <HiOutlineShieldCheck className="text-emerald-400" size={16} />
            <span>256-Bit Encrypted PCI-DSS Level 1 Gateway</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-ink-100">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-brand">
              <HiOutlineLockClosed size={22} />
            </span>
            <h1 className="font-display text-2xl lg:text-3xl font-extrabold text-ink-900 tracking-tight">
              Express Checkout
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-ink-500 mt-1">
            Safe & secure checkout with instant OTP verification & instant refund guarantee.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-ink-600 bg-emerald-50 border border-emerald-200/60 px-3.5 py-1.5 rounded-full text-emerald-800">
          <HiCheckCircle className="text-emerald-600" size={18} />
          <span>100% Purchase Protection & RBI Compliant</span>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="my-8">
        <ol className="flex items-center justify-between max-w-2xl mx-auto relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-ink-100 w-full z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-500 transition-all duration-500 z-0"
            style={{ width: step === 1 ? '15%' : step === 2 ? '50%' : '100%' }}
          />

          {[
            { idx: 1, title: 'Delivery Address', subtitle: 'Where to deliver' },
            { idx: 2, title: 'Shipping Speed', subtitle: 'Delivery method' },
            { idx: 3, title: 'Payment & Review', subtitle: 'UPI, Card, Net Banking' },
          ].map((s) => {
            const done = step > s.idx
            const active = step === s.idx
            return (
              <li
                key={s.idx}
                onClick={() => (step > s.idx ? setStep(s.idx) : null)}
                className={`relative z-10 flex flex-col items-center cursor-pointer transition ${
                  step > s.idx ? 'hover:scale-105' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-soft ${
                    done
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                      : active
                      ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-brand'
                      : 'bg-white text-ink-400 border border-ink-200'
                  }`}
                >
                  {done ? '✓' : s.idx}
                </div>
                <span
                  className={`mt-2 text-xs sm:text-sm font-bold text-center ${
                    active ? 'text-ink-900' : done ? 'text-emerald-700' : 'text-ink-400'
                  }`}
                >
                  {s.title}
                </span>
                <span className="text-[11px] text-ink-400 hidden sm:block">{s.subtitle}</span>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
        {/* Main Step Form */}
        <form onSubmit={handleNext} className="space-y-6">
          {/* STEP 1: ADDRESS */}
          {step === 1 && (
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-ink-100 shadow-soft space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-ink-100">
                <div>
                  <h2 className="font-display font-extrabold text-xl text-ink-900">
                    Contact & Delivery Address
                  </h2>
                  <p className="text-xs text-ink-500 mt-0.5">We will send tracking SMS & updates here.</p>
                </div>
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
                  Step 1 of 3
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Full Name *"
                  value={form.name}
                  onChange={update('name')}
                  placeholder="e.g. Alex Carter"
                  required
                />
                <Field
                  label="Email Address *"
                  value={form.email}
                  onChange={update('email')}
                  type="email"
                  placeholder="alex@shopverse.in"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Phone Number (for Courier & OTP) *"
                  value={form.phone}
                  onChange={update('phone')}
                  type="tel"
                  placeholder="e.g. 9876543210"
                  required
                />
                <Field
                  label="PIN Code / Postal Code *"
                  value={form.zip}
                  onChange={update('zip')}
                  placeholder="e.g. 560001"
                  required
                />
              </div>

              <Field
                label="Street Address / House No / Landmark *"
                value={form.address}
                onChange={update('address')}
                placeholder="e.g. 42, Brigade Road, MG Road Area"
                required
              />

              <div className="grid sm:grid-cols-3 gap-4">
                <Field
                  label="City *"
                  value={form.city}
                  onChange={update('city')}
                  placeholder="e.g. Bengaluru"
                  required
                />
                <Field
                  label="State *"
                  value={form.state}
                  onChange={update('state')}
                  placeholder="e.g. Karnataka"
                  required
                />
                <Field
                  label="Country *"
                  value={form.country}
                  onChange={update('country')}
                  placeholder="India"
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 2: SHIPPING SPEED */}
          {step === 2 && (
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-ink-100 shadow-soft space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-ink-100">
                <div>
                  <h2 className="font-display font-extrabold text-xl text-ink-900">
                    Choose Delivery Speed
                  </h2>
                  <p className="text-xs text-ink-500 mt-0.5">Dispatched from our nearest fulfillment hub.</p>
                </div>
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
                  Step 2 of 3
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'Standard',
                    title: 'Standard Surface Delivery',
                    estimate: '2–4 Business Days',
                    badge: 'Most Economical',
                    price: safeSubtotal >= 499 ? 0 : 49,
                    desc: 'Free for all orders above ₹499 across 28,000+ PIN codes.',
                  },
                  {
                    id: 'Express',
                    title: 'BlueDart / Delhivery Air Express',
                    estimate: '1–2 Business Days (Priority)',
                    badge: '⚡ Fastest',
                    price: 99,
                    desc: 'Prioritized packing with live GPS dispatch tracking.',
                  },
                  {
                    id: 'Same-Day',
                    title: 'Same-Day Metro Hyperlocal',
                    estimate: 'Today before 9:00 PM',
                    badge: '🏙️ Bengaluru / Mumbai / Delhi',
                    price: 149,
                    desc: 'Guaranteed same-day courier for metropolitan areas.',
                  },
                ].map((m) => {
                  const selected = shippingMethod === m.id
                  return (
                    <label
                      key={m.id}
                      onClick={() => setShippingMethod(m.id)}
                      className={`relative flex items-start gap-4 p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                        selected
                          ? 'border-brand-500 bg-brand-50/40 shadow-soft ring-2 ring-brand-100'
                          : 'border-ink-100 bg-white hover:border-ink-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingOption"
                        checked={selected}
                        onChange={() => setShippingMethod(m.id)}
                        className="mt-1 w-4 h-4 accent-brand-600"
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display font-bold text-ink-900">{m.title}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
                            {m.badge}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-emerald-700 mt-1">{m.estimate}</p>
                        <p className="text-xs text-ink-500 mt-0.5">{m.desc}</p>
                      </div>
                      <div className="text-right font-display font-extrabold text-base text-ink-900">
                        {m.price === 0 ? (
                          <span className="text-emerald-600 uppercase font-black tracking-wide">Free</span>
                        ) : (
                          formatCurrency(m.price)
                        )}
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 3: UPGRADED PAYMENT GATEWAY UI */}
          {step === 3 && (
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-ink-100 shadow-soft space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-ink-100">
                <div>
                  <h2 className="font-display font-extrabold text-xl text-ink-900 flex items-center gap-2">
                    <HiOutlineCreditCard className="text-brand-600" /> Select Payment Method
                  </h2>
                  <p className="text-xs text-ink-500 mt-0.5">
                    100% encrypted & authorized via ISO/PCI-DSS certified gateway.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                  <HiOutlineShieldCheck /> Encrypted
                </span>
              </div>

              {/* Payment Tab Navigation */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 bg-ink-50 rounded-2xl border border-ink-100">
                {[
                  { id: 'card', label: 'Cards', icon: HiOutlineCreditCard, badge: 'Visa/MC' },
                  { id: 'upi', label: 'UPI / QR', icon: HiOutlineQrCode, badge: 'Instant' },
                  { id: 'netbanking', label: 'Net Banking', icon: HiOutlineBuildingLibrary },
                  { id: 'wallet', label: 'Wallets', icon: HiOutlineDevicePhoneMobile },
                  { id: 'cod', label: 'Cash on Delivery', icon: HiOutlineBanknotes },
                ].map((t) => {
                  const active = activePaymentTab === t.id
                  const Icon = t.icon
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActivePaymentTab(t.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 text-xs font-semibold ${
                        active
                          ? 'bg-white text-brand-700 shadow-sm font-bold ring-1 ring-ink-100'
                          : 'text-ink-600 hover:text-ink-900 hover:bg-white/50'
                      }`}
                    >
                      <Icon size={20} className={active ? 'text-brand-600' : 'text-ink-500'} />
                      <span className="mt-1 text-center">{t.label}</span>
                      {t.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full mt-0.5 ${
                            active ? 'bg-brand-100 text-brand-800' : 'bg-ink-200/60 text-ink-600'
                          }`}
                        >
                          {t.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* PAYMENT TAB 1: CREDIT / DEBIT CARD */}
              {activePaymentTab === 'card' && (
                <div className="space-y-6">
                  {/* Luxury 3D Holographic Card Preview */}
                  <div className="relative w-full max-w-md mx-auto aspect-[1.586/1] rounded-2xl p-6 text-white overflow-hidden shadow-2xl transition-all duration-500 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 border border-white/10">
                    <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-brand-500/30 to-pink-500/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* EMV Chip */}
                          <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-500 shadow-inner flex items-center justify-center p-1">
                            <div className="w-full h-full border border-amber-600/40 rounded-sm grid grid-cols-2"></div>
                          </div>
                          <span className="text-white/60 text-sm tracking-widest">📶</span>
                        </div>

                        {/* Card Network Brand */}
                        <div className="text-2xl font-black italic tracking-wider text-white">
                          {cardBrand === 'visa' && <FaCcVisa size={36} className="text-white drop-shadow" />}
                          {cardBrand === 'mastercard' && (
                            <FaCcMastercard size={36} className="text-amber-400 drop-shadow" />
                          )}
                          {cardBrand === 'amex' && <FaCcAmex size={36} className="text-sky-300 drop-shadow" />}
                          {cardBrand === 'rupay' && (
                            <span className="text-sm font-extrabold uppercase bg-white text-indigo-900 px-2 py-0.5 rounded tracking-normal">
                              RuPay
                            </span>
                          )}
                          {cardBrand === 'generic' && (
                            <span className="text-xs uppercase tracking-widest font-mono text-white/70">
                              DEBIT / CREDIT
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Number display */}
                      <div className="font-mono text-lg sm:text-xl tracking-[0.18em] font-semibold text-white/95 drop-shadow">
                        {form.cardNumber || '•••• •••• •••• ••••'}
                      </div>

                      {/* Card Footer: Name & Exp */}
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-white/60">Card Holder</p>
                          <p className="font-display font-bold text-sm tracking-wider uppercase truncate max-w-[200px]">
                            {form.cardHolder || 'CARDHOLDER NAME'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] uppercase tracking-widest text-white/60">Expires</p>
                          <p className="font-mono font-bold text-sm tracking-wider">
                            {form.exp || 'MM/YY'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Form Inputs */}
                  <div className="space-y-4 pt-2">
                    <Field
                      label="Card Number *"
                      value={form.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      required
                    />

                    <Field
                      label="Cardholder Name *"
                      value={form.cardHolder}
                      onChange={update('cardHolder')}
                      placeholder="Full name as printed on card"
                      required
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        label="Expiry Date (MM/YY) *"
                        value={form.exp}
                        onChange={handleExpiryChange}
                        placeholder="12/29"
                        maxLength={5}
                        required
                      />
                      <Field
                        label="CVV / CVC (3-4 digits) *"
                        value={form.cvc}
                        onChange={update('cvc')}
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        required
                      />
                    </div>

                    <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.saveCard}
                        onChange={(e) => setForm((prev) => ({ ...prev, saveCard: e.target.checked }))}
                        className="w-4 h-4 rounded text-brand-600 accent-brand-600 cursor-pointer"
                      />
                      <span className="text-xs text-ink-700 font-medium">
                        Securely save card for 1-click checkout as per RBI Tokenization norms
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* PAYMENT TAB 2: UPI & QR CODE */}
              {activePaymentTab === 'upi' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6 items-center p-5 rounded-2xl bg-gradient-to-br from-brand-50/70 via-indigo-50/50 to-purple-50/70 border border-brand-100">
                    <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-ink-100 shadow-sm text-center">
                      <div className="relative p-3 rounded-xl bg-white border-2 border-brand-400/40 shadow-inner">
                        <div className="w-40 h-40 bg-ink-950 p-2 rounded-lg flex flex-col justify-between">
                          <div className="flex justify-between">
                            <div className="w-9 h-9 border-4 border-white bg-black p-1">
                              <div className="w-full h-full bg-white"></div>
                            </div>
                            <div className="w-9 h-9 border-4 border-white bg-black p-1">
                              <div className="w-full h-full bg-white"></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-center">
                            <span className="text-[10px] font-black tracking-widest text-emerald-400 bg-ink-900 px-2 py-0.5 rounded">
                              BHIM UPI
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <div className="w-9 h-9 border-4 border-white bg-black p-1">
                              <div className="w-full h-full bg-white"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-0.5 w-9 h-9">
                              <div className="bg-white"></div>
                              <div className="bg-white"></div>
                              <div className="bg-white"></div>
                              <div className="bg-white"></div>
                            </div>
                          </div>
                        </div>

                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-brand whitespace-nowrap">
                          Scan & Pay ₹{total.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <p className="text-xs text-ink-600 font-semibold mt-5">
                        Scan using any UPI App on your phone
                      </p>
                      <div className="flex items-center justify-center gap-3 mt-3 text-ink-700">
                        <FaGooglePay size={26} title="Google Pay" className="hover:text-ink-950" />
                        <SiPhonepe size={20} title="PhonePe" className="text-purple-600" />
                        <SiPaytm size={26} title="Paytm" className="text-sky-600" />
                        <span className="text-[11px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Cred
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-ink-800 mb-1">
                          Or Enter Your UPI ID (VPA)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={form.upiId}
                            onChange={update('upiId')}
                            placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 outline-none focus:border-brand-500 text-sm font-medium pr-20"
                          />
                          <button
                            type="button"
                            onClick={() => toast.success('UPI ID verified! Ready to pay.')}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-bold bg-brand-600 text-white rounded-lg hover:bg-brand-700"
                          >
                            Verify
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] text-ink-500 font-semibold mb-2">Quick Handles:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {['@okaxis', '@okhdfcbank', '@ybl', '@paytm', '@ibl'].map((handle) => (
                            <button
                              key={handle}
                              type="button"
                              onClick={() => {
                                const base = form.upiId.split('@')[0] || 'yourname'
                                setForm((prev) => ({ ...prev, upiId: `${base}${handle}` }))
                              }}
                              className="text-xs px-2.5 py-1 rounded-lg bg-white border border-ink-200 hover:border-brand-400 text-ink-700 font-mono transition"
                            >
                              {handle}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                        <p className="font-bold flex items-center gap-1">
                          <HiCheckCircle className="text-emerald-600" /> Instant 0% Processing Fee
                        </p>
                        <p className="text-emerald-700 text-[11px]">
                          Open your UPI app after clicking "Pay" to authorize the transaction.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAYMENT TAB 3: NET BANKING */}
              {activePaymentTab === 'netbanking' && (
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-ink-700">Select Popular Indian Bank:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {POPULAR_BANKS.map((b) => {
                      const selected = form.bank === b.id
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, bank: b.id }))}
                          className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                            selected
                              ? 'border-brand-500 bg-brand-50 text-brand-900 font-bold ring-2 ring-brand-200'
                              : 'border-ink-100 bg-white hover:border-ink-200 text-ink-700'
                          }`}
                        >
                          <span className="text-xs">{b.name}</span>
                          {selected && <HiCheckCircle className="text-brand-600" size={18} />}
                        </button>
                      )
                    })}
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-ink-700 mb-1">
                      Or Choose from All Other Banks:
                    </label>
                    <select
                      value={form.bank}
                      onChange={update('bank')}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 outline-none focus:border-brand-500 text-sm bg-white"
                    >
                      {ALL_BANKS.map((bank) => (
                        <option key={bank} value={bank.toLowerCase().replace(/\s+/g, '-')}>
                          {bank}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* PAYMENT TAB 4: WALLETS */}
              {activePaymentTab === 'wallet' && (
                <div className="space-y-3">
                  {[
                    { id: 'paytm', name: 'Paytm Wallet', desc: 'Fast checkout with linked balance' },
                    { id: 'amazon', name: 'Amazon Pay', desc: 'Use Amazon Pay Balance & Gift Cards' },
                    { id: 'mobikwik', name: 'MobiKwik / ZIP', desc: 'Pay later with 0% interest' },
                    { id: 'simpl', name: 'Simpl PayLater', desc: '1-click checkout, pay in 15 days' },
                  ].map((w) => {
                    const selected = form.wallet === w.id
                    return (
                      <label
                        key={w.id}
                        onClick={() => setForm((prev) => ({ ...prev, wallet: w.id }))}
                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                          selected
                            ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                            : 'border-ink-100 bg-white hover:border-ink-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="walletChoice"
                            checked={selected}
                            onChange={() => setForm((prev) => ({ ...prev, wallet: w.id }))}
                            className="w-4 h-4 accent-brand-600"
                          />
                          <div>
                            <p className="text-sm font-bold text-ink-900">{w.name}</p>
                            <p className="text-xs text-ink-500">{w.desc}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">
                          Connected
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}

              {/* PAYMENT TAB 5: CASH ON DELIVERY (COD) */}
              {activePaymentTab === 'cod' && (
                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                  <div className="flex items-start gap-3">
                    <HiOutlineBanknotes size={26} className="text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-display font-bold text-sm text-amber-900">
                        Cash on Delivery Available for this Order
                      </h4>
                      <p className="text-xs text-amber-800 mt-1">
                        You can pay with Cash or scan the delivery agent's UPI QR code directly at your doorstep
                        upon delivery.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.codConfirmed}
                        onChange={(e) => setForm((prev) => ({ ...prev, codConfirmed: e.target.checked }))}
                        className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
                        required
                      />
                      <span className="text-xs font-semibold text-amber-900">
                        I confirm I will accept the parcel and pay ₹{total.toLocaleString('en-IN')} on delivery
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => {
                setStep(Math.max(1, step - 1))
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="btn-outline px-6 py-3"
              disabled={step === 1 || isProcessing}
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="btn-primary px-8 py-3 font-extrabold shadow-brand text-base flex items-center gap-2"
            >
              {step === 3 ? (
                <>
                  <HiOutlineLockClosed /> Pay {formatCurrency(total)}
                </>
              ) : (
                'Continue to Next Step →'
              )}
            </button>
          </div>
        </form>

        {/* ORDER SUMMARY SIDEBAR */}
        <aside className="lg:sticky lg:top-24 space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-ink-100 shadow-soft">
            <div className="flex items-center justify-between pb-3 border-b border-ink-100">
              <h2 className="font-display font-extrabold text-lg text-ink-900">Order Summary</h2>
              <span className="text-xs font-bold text-ink-500 bg-ink-100 px-2.5 py-0.5 rounded-full">
                {(cart || []).reduce((s, i) => s + (Number(i.qty) || 1), 0)} Items
              </span>
            </div>

            {/* Cart Items List Preview */}
            <ul className="mt-4 space-y-3 max-h-56 overflow-y-auto pr-1">
              {(cart || []).map((i) => (
                <li key={`${i.id || i._id}-${i.color}-${i.size}`} className="flex items-center gap-3">
                  <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-ink-100 flex-shrink-0 border border-ink-100">
                    <img src={i.image} alt={i.title} className="w-full h-full object-cover" />
                    <span className="absolute -top-1 -right-1 grid place-items-center w-5 h-5 text-[10px] font-bold rounded-full bg-ink-900 text-white shadow">
                      {i.qty}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-ink-900 line-clamp-1">{i.title}</p>
                    <p className="text-[11px] text-ink-500">
                      {i.brand} • {i.color || 'Standard'}
                    </p>
                    <p className="text-xs font-semibold text-brand-600 mt-0.5">
                      {formatCurrency(i.price)} × {i.qty}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="mt-4 pt-4 border-t border-ink-100">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Coupon code (e.g. SAVE10)"
                    className="w-full px-3 py-2 rounded-xl border border-ink-200 outline-none focus:border-brand-500 text-xs font-mono uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-ink-900 hover:bg-black text-white text-xs font-bold rounded-xl transition"
                >
                  Apply
                </button>
              </div>

              {promoError && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                  <HiOutlineExclamationCircle /> {promoError}
                </p>
              )}

              {appliedPromo && (
                <div className="mt-2 flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold">
                  <span className="flex items-center gap-1">
                    <HiOutlineTag className="text-emerald-600" /> Code <strong>{appliedPromo.code}</strong> applied!
                  </span>
                  <button
                    type="button"
                    onClick={() => setAppliedPromo(null)}
                    className="text-rose-600 hover:underline text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              )}
            </form>

            <hr className="my-4 border-ink-100" />

            {/* Pricing Breakup */}
            <div className="space-y-2 text-sm">
              <Row label="Bag Subtotal" value={formatCurrency(safeSubtotal)} />
              {discountAmount > 0 && (
                <Row
                  label={`Discount (${appliedPromo?.code})`}
                  value={`- ${formatCurrency(discountAmount)}`}
                  className="text-emerald-600 font-semibold"
                />
              )}
              <Row
                label="Estimated Delivery"
                value={
                  shipping === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatCurrency(shipping)
                  )
                }
              />
              <Row
                label="GST Tax (18% included)"
                value={formatCurrency(tax)}
                className="text-ink-500 text-xs"
              />

              <div className="pt-3 mt-3 border-t border-ink-100 flex items-center justify-between">
                <div>
                  <span className="font-display font-extrabold text-lg text-ink-900">Total Due</span>
                  <p className="text-[10px] text-ink-400">Inclusive of all Indian taxes & fees</p>
                </div>
                <span className="font-display font-black text-2xl text-ink-900 text-brand-700">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="p-4 bg-ink-50/70 rounded-2xl border border-ink-100 space-y-2 text-xs text-ink-600">
            <div className="flex items-center gap-2">
              <HiOutlineShieldCheck className="text-brand-600 flex-shrink-0" size={18} />
              <span><strong>RBI & PCI-DSS</strong> Level 1 Certified Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <HiOutlineArrowPath className="text-emerald-600 flex-shrink-0" size={18} />
              <span><strong>7-Day Easy Returns</strong> & 100% Instant Refund</span>
            </div>
            <div className="flex items-center gap-2">
              <HiOutlineCheckBadge className="text-indigo-600 flex-shrink-0" size={18} />
              <span><strong>100% Original</strong> Products Verified by ShopVerse</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Field({ label, ...rest }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-ink-700 mb-1 block">{label}</span>
      <input
        {...rest}
        className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 outline-none focus:border-brand-500 focus:shadow-ring text-sm transition"
      />
    </label>
  )
}

function Row({ label, value, className = '' }) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className="text-ink-600">{label}</span>
      <span className="font-semibold text-ink-900">{value}</span>
    </div>
  )
}
