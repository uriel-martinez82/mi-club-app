'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NuevoClubPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    nombre: '',
    slug: '',
    plan: 'free',
    // Datos del primer dirigente
    dirigente_nombre: '',
    dirigente_apellido: '',
    dirigente_email: '',
    dirigente_phone: '',
  })

  const update = (field: string, value: string) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value }
      // Auto-generar slug desde el nombre
      if (field === 'nombre') {
        updated.slug = value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim()
      }
      return updated
    })
  }

  const handleSubmit = async () => {
  setLoading(true)
  setError(null)

  try {
    const res = await fetch('/api/clubes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: form.nombre,
        slug: form.slug,
        plan: form.plan,
        dirigente_nombre: form.dirigente_nombre,
        dirigente_apellido: form.dirigente_apellido,
        dirigente_email: form.dirigente_email,
        dirigente_phone: form.dirigente_phone,
      }),
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data.error)

    router.push('/dashboard/clubes')
    router.refresh()

  } catch (err: any) {
    setError(err.message)
    setLoading(false)
  }
}

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clubes" className="text-gray-400 hover:text-gray-600 transition-colors">
          ← Volver
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo club</h1>
          <p className="text-gray-500 text-sm mt-1">Completá los datos del club y su primer dirigente</p>
        </div>
      </div>

      {/* Datos del club */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Datos del club</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del club</label>
          <input
            type="text"
            value={form.nombre}
            onChange={e => update('nombre', e.target.value)}
            placeholder="Club Atlético San Martín"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Slug <span className="text-gray-400 font-normal">(identificador único)</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">miclubapp.com/</span>
            <input
              type="text"
              value={form.slug}
              onChange={e => update('slug', e.target.value)}
              placeholder="club-atletico-san-martin"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Plan</label>
          <div className="grid grid-cols-3 gap-3">
            {(['free', 'basic', 'pro'] as const).map(plan => (
              <button
                key={plan}
                onClick={() => update('plan', plan)}
                className={`p-3 rounded-xl border text-sm font-medium capitalize transition-colors ${
                  form.plan === plan
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {plan}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Datos del dirigente */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Primer dirigente</h2>
          <p className="text-xs text-gray-500 mt-0.5">Este usuario tendrá acceso total al club</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
            <input
              type="text"
              value={form.dirigente_nombre}
              onChange={e => update('dirigente_nombre', e.target.value)}
              placeholder="Carlos"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellido</label>
            <input
              type="text"
              value={form.dirigente_apellido}
              onChange={e => update('dirigente_apellido', e.target.value)}
              placeholder="García"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            value={form.dirigente_email}
            onChange={e => update('dirigente_email', e.target.value)}
            placeholder="carlos@clubsanmartin.com"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
          <input
            type="tel"
            value={form.dirigente_phone}
            onChange={e => update('dirigente_phone', e.target.value)}
            placeholder="+54 11 1234-5678"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !form.nombre || !form.slug || !form.dirigente_email}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-xl text-sm transition-colors"
      >
        {loading ? 'Creando club...' : 'Crear club'}
      </button>

    </div>
  )
}