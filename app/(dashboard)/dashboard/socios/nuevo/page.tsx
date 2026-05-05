'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NuevoSocioPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'datos' | 'socio'>('datos')

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

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // 1. Obtener el perfil del admin para saber el club_id
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const { data: perfil } = await supabase
        .from('users')
        .select('club_id')
        .eq('id', user.id)
        .single()

      if (!perfil?.club_id) throw new Error('Tu cuenta no está asociada a ningún club')

      // 2. Crear usuario en auth con contraseña temporal
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'

      const { data: newAuth, error: authError } = await supabase.auth.admin.createUser({
        email: form.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { nombre: form.nombre, apellido: form.apellido }
      })

      if (authError) throw new Error(authError.message)

      // 3. Actualizar el user creado por el trigger con club_id y phone
      await supabase
        .from('users')
        .update({
          club_id: perfil.club_id,
          phone: form.phone || null,
        })
        .eq('id', newAuth.user.id)

      // 4. Crear el registro en socios
      const { error: socioError } = await supabase
        .from('socios')
        .insert({
          user_id: newAuth.user.id,
          club_id: perfil.club_id,
          numero_socio: form.numero_socio || null,
          categoria: form.categoria,
          estado: form.estado,
          observaciones: form.observaciones || null,
        })

      if (socioError) throw new Error(socioError.message)

      router.push('/dashboard/socios')
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
        <Link
          href="/dashboard/socios"
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Volver
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agregar socio</h1>
          <p className="text-gray-500 text-sm mt-1">Completá los datos del nuevo socio</p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex gap-2">
        {(['datos', 'socio'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
              step === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {i + 1}
            </div>
            <span className={`text-sm ${step === s ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {s === 'datos' ? 'Datos personales' : 'Datos del socio'}
            </span>
            {i < 1 && <span className="text-gray-300 mx-1">→</span>}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {step === 'datos' ? (
          <div className="space-y-5">
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
            <button
              onClick={() => setStep('socio')}
              disabled={!form.nombre || !form.email}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
            >
              Siguiente →
            </button>
          </div>
        ) : (
          <div className="space-y-5">
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
                placeholder="Notas adicionales sobre el socio..."
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