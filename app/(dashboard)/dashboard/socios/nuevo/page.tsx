'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NuevoSocioPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'club' | 'datos' | 'socio'>('datos')
  const [esSuperAdmin, setEsSuperAdmin] = useState(false)
  const [clubes, setClubes] = useState<any[]>([])
  const [selectedClubId, setSelectedClubId] = useState<string>('')

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    phone: '',
    numero_socio: '',
    categoria: 'general',
    estado: 'activo',
    observaciones: '',
  })

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: perfil } = await supabase
        .from('users')
        .select('rol, club_id')
        .eq('id', user.id)
        .single()

      if (perfil?.rol === 'superadmin') {
        setEsSuperAdmin(true)
        setStep('club')
        const { data: clubesData } = await supabase
          .from('clubs')
          .select('id, nombre')
          .eq('activo', true)
          .order('nombre')
        setClubes(clubesData ?? [])
      }
    }
    init()
  }, [])

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/socios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          phone: form.phone,
          numero_socio: form.numero_socio,
          categoria: form.categoria,
          estado: form.estado,
          observaciones: form.observaciones,
          club_id_override: esSuperAdmin ? selectedClubId : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      router.push('/dashboard/socios')
      router.refresh()

    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const steps = esSuperAdmin
    ? ['club', 'datos', 'socio']
    : ['datos', 'socio']

  const stepLabels: Record<string, string> = {
    club: 'Seleccionar club',
    datos: 'Datos personales',
    socio: 'Datos del socio',
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/socios" className="text-gray-400 hover:text-gray-600 transition-colors">
          ← Volver
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agregar socio</h1>
          <p className="text-gray-500 text-sm mt-1">Completá los datos del nuevo socio</p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex gap-2 items-center">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
              step === s ? 'bg-blue-600 text-white' : 
              steps.indexOf(step) > i ? 'bg-green-500 text-white' : 
              'bg-gray-100 text-gray-500'
            }`}>
              {steps.indexOf(step) > i ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${step === s ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {stepLabels[s]}
            </span>
            {i < steps.length - 1 && <span className="text-gray-300 mx-1">→</span>}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">

        {/* Step: Seleccionar club */}
        {step === 'club' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Seleccioná el club
              </label>
              <select
                value={selectedClubId}
                onChange={e => setSelectedClubId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Elegí un club --</option>
                {clubes.map(club => (
                  <option key={club.id} value={club.id}>{club.nombre}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setStep('datos')}
              disabled={!selectedClubId}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
            >
              Siguiente →
            </button>
          </div>
        )}

        {/* Step: Datos personales */}
        {step === 'datos' && (
          <div className="space-y-5">
            {esSuperAdmin && (
              <div className="bg-blue-50 rounded-xl px-4 py-3 text-sm text-blue-700">
                Club seleccionado: <span className="font-medium">{clubes.find(c => c.id === selectedClubId)?.nombre}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => update('nombre', e.target.value)}
                  placeholder="Juan"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellido</label>
                <input
                  type="text"
                  value={form.apellido}
                  onChange={e => update('apellido', e.target.value)}
                  placeholder="Pérez"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="juan@email.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="+54 11 1234-5678"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              {esSuperAdmin && (
                <button
                  onClick={() => setStep('club')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl text-sm transition-colors"
                >
                  ← Atrás
                </button>
              )}
              <button
                onClick={() => setStep('socio')}
                disabled={!form.nombre || !form.email}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* Step: Datos del socio */}
        {step === 'socio' && (
          <div className="space-y-5">
            {esSuperAdmin && (
              <div className="bg-blue-50 rounded-xl px-4 py-3 text-sm text-blue-700">
                Club: <span className="font-medium">{clubes.find(c => c.id === selectedClubId)?.nombre}</span>
                <span className="mx-2">·</span>
                Socio: <span className="font-medium">{form.nombre} {form.apellido}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Número de socio</label>
                <input
                  type="text"
                  value={form.numero_socio}
                  onChange={e => update('numero_socio', e.target.value)}
                  placeholder="Ej: 00123"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoría</label>
                <select
                  value={form.categoria}
                  onChange={e => update('categoria', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="juvenil">Juvenil</option>
                  <option value="infantil">Infantil</option>
                  <option value="vitalicio">Vitalicio</option>
                  <option value="honorario">Honorario</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado inicial</label>
              <select
                value={form.estado}
                onChange={e => update('estado', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="activo">Activo</option>
                <option value="pendiente">Pendiente</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Observaciones</label>
              <textarea
                value={form.observaciones}
                onChange={e => update('observaciones', e.target.value)}
                placeholder="Notas adicionales..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('datos')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl text-sm transition-colors"
              >
                ← Atrás
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
              >
                {loading ? 'Guardando...' : 'Guardar socio'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}