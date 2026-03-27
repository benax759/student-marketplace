import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlinePhotograph, HiOutlineX, HiOutlinePlusCircle } from 'react-icons/hi'
import api from '../lib/api'
import useAuthStore from '../store/authStore'
import { CATEGORIES, CONDITIONS } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function CreateListingPage() {
  const { id } = useParams() // defined means edit mode
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const fileInputRef = useRef(null)
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    title: '', description: '', price: '', category: 'Books',
    condition: 'Good', college: user?.college || '', city: user?.city || '',
    status: 'available',
  })
  const [images, setImages] = useState([]) // new File objects
  const [existingImages, setExistingImages] = useState([]) // already-uploaded
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEdit)

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user])

  useEffect(() => {
    if (isEdit) {
      api.get(`/listings/${id}`).then(({ data }) => {
        const l = data.listing
        if (l.seller._id !== user?._id) { navigate('/browse'); return }
        setForm({
          title: l.title, description: l.description, price: l.price,
          category: l.category, condition: l.condition,
          college: l.college, city: l.city, status: l.status,
        })
        setExistingImages(l.images || [])
      }).catch(() => navigate('/browse'))
        .finally(() => setLoadingData(false))
    }
  }, [id])

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    const total = existingImages.length + images.length + files.length
    if (total > 5) { toast.error('Maximum 5 images allowed'); return }
    setImages(prev => [...prev, ...files])
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removeNewImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  const removeExistingImage = (i) => {
    setExistingImages(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim() || !form.price) {
      toast.error('Please fill in all required fields'); return
    }
    if (existingImages.length + images.length === 0) {
      toast.error('Add at least one photo to your listing'); return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, v))
      images.forEach(img => formData.append('images', img))
      if (isEdit) formData.append('existingImages', JSON.stringify(existingImages))

      if (isEdit) {
        await api.put(`/listings/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Listing updated!')
        navigate(`/listing/${id}`)
      } else {
        const { data } = await api.post('/listings', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success(data.message)
        navigate(`/listing/${data.listing._id}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally { setLoading(false) }
  }

  if (loadingData) return <div className="page-container py-20 text-center text-[var(--text-muted)]">Loading…</div>

  return (
    <div className="page-container py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="section-title mb-1">{isEdit ? 'Edit Listing' : 'Post a Listing'}</h1>
          <p className="text-[var(--text-muted)] text-sm">
            {isEdit ? 'Update your listing details below.' : 'Fill in the details and your listing will be live in seconds.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Images upload */}
          <div className="card p-5">
            <label className="label-base mb-3">
              Photos <span className="text-red-500">*</span>
              <span className="text-[var(--text-muted)] font-normal ml-1">({existingImages.length + images.length}/5)</span>
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {/* Existing images */}
              {existingImages.map((img, i) => (
                <div key={`existing-${i}`} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <HiOutlineX className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ))}

              {/* New image previews */}
              {previews.map((src, i) => (
                <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <HiOutlineX className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ))}

              {/* Add button */}
              {existingImages.length + images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-[var(--border-color)] hover:border-brand-500 
                             hover:bg-brand-50 dark:hover:bg-brand-950/20 flex flex-col items-center justify-center gap-1
                             transition-all cursor-pointer group"
                >
                  <HiOutlinePhotograph className="w-6 h-6 text-[var(--text-muted)] group-hover:text-brand-500" />
                  <span className="text-xs text-[var(--text-muted)] group-hover:text-brand-500">Add</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <p className="text-xs text-[var(--text-muted)] mt-2">JPG, PNG or WebP • Max 5MB each • Up to 5 photos</p>
          </div>

          {/* Core details */}
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Item Details</h3>

            <div>
              <label className="label-base">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g., 'Engineering Mathematics Vol. 1 – 3rd Edition'"
                maxLength={100}
                className="input-base"
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">{form.title.length}/100</p>
            </div>

            <div>
              <label className="label-base">Description <span className="text-red-500">*</span></label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the item — edition, author, any wear, included accessories, etc."
                rows={4}
                maxLength={2000}
                className="input-base resize-none"
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">{form.description.length}/2000</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-base">Price (₹) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="0 for free"
                  min={0}
                  className="input-base"
                />
              </div>
              <div>
                <label className="label-base">Condition <span className="text-red-500">*</span></label>
                <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} className="input-base">
                  {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label-base">Category <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat }))}
                    className={`p-3 rounded-xl border-2 text-center text-xs font-semibold transition-all ${
                      form.category === cat
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400'
                        : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-brand-300'
                    }`}
                  >
                    <div className="text-xl mb-1">{cat === 'Books' ? '📚' : cat === 'Notes' ? '📝' : cat === 'Electronics' ? '💻' : cat === 'Accessories' ? '🎒' : '📦'}</div>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Location</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-base">College / University</label>
                <input
                  type="text"
                  value={form.college}
                  onChange={e => setForm(f => ({ ...f, college: e.target.value }))}
                  placeholder="e.g., IIT Delhi"
                  className="input-base"
                />
              </div>
              <div>
                <label className="label-base">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="e.g., Mumbai"
                  className="input-base"
                />
              </div>
            </div>
          </div>

          {/* Status (edit only) */}
          {isEdit && (
            <div className="card p-5">
              <label className="label-base">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-base">
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4 pb-8">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 btn-secondary py-3.5">Cancel</button>
            <button type="submit" disabled={loading} className="flex-2 btn-primary py-3.5 px-8 flex items-center justify-center gap-2">
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Publishing…</span>
              ) : (
                <><HiOutlinePlusCircle className="w-5 h-5" />{isEdit ? 'Save Changes' : 'Post Listing'}</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
