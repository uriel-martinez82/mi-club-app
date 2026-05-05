import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: socio } = await supabase
    .from('socios')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: inscripciones } = await supabase
    .from('inscripciones')
    .select('*, disciplinas(nombre, horarios)')
    .eq('socio_id', socio?.id ?? '')
    .eq('estado', 'activa')

  const { data: cuotas } = await supabase
    .from('cuotas')
    .select('*')
    .eq('socio_id', socio?.id ?? '')
    .order('vencimiento', { ascending: false })
    .limit(6)

  const cuotasPendientes = cuotas?.filter(c => c.estado === 'pendiente' || c.estado === 'vencido') ?? []
  const cuotasPagadas = cuotas?.filter(c => c.estado === 'pagado') ?? []

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
        <p className="text-gray-500 text-sm mt-1">Tus datos personales y estado en el club</p>
      </div>

      {/* Datos personales */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Datos personales</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-blue-600">
              {perfil?.nombre?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {perfil?.nombre} {perfil?.apellido}
            </p>
            <p className="text-sm text-gray-500">{perfil?.email}</p>
            <span className="inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 capitalize">
              {perfil?.rol}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 mb-1">Teléfono</p>
            <p className="font-medium text-gray-900">{perfil?.phone ?? 'No registrado'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 mb-1">Miembro desde</p>
            <p className="font-medium text-gray-900">
              {perfil?.created_at
                ? new Date(perfil.created_at).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })
                : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Estado como socio */}
      {socio ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Estado en el club</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-500 mb-1">Número de socio</p>
              <p className="font-semibold text-gray-900">{socio.numero_socio ?? 'Sin asignar'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-500 mb-1">Categoría</p>
              <p className="font-semibold text-gray-900 capitalize">{socio.categoria}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-500 mb-1">Estado</p>
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                socio.estado === 'activo'
                  ? 'bg-green-50 text-green-600'
                  : socio.estado === 'suspendido'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-yellow-50 text-yellow-600'
              }`}>
                {socio.estado}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-sm text-yellow-800">
          Tu cuenta aún no está vinculada a un número de socio. Contactá a la administración del club.
        </div>
      )}

      {/* Disciplinas */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Mis actividades</h2>
        {inscripciones && inscripciones.length > 0 ? (
          <div className="space-y-3">
            {inscripciones.map((ins: any) => (
              <div key={ins.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{ins.disciplinas?.nombre}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ins.disciplinas?.horarios?.length > 0
                      ? ins.disciplinas.horarios.map((h: any) => `${h.dia} ${h.hora_inicio}-${h.hora_fin}`).join(' · ')
                      : 'Sin horario definido'}
                  </p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-600">
                  Activa
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No estás inscripto en ninguna actividad todavía.</p>
        )}
      </div>

      {/* Cuotas */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Mis cuotas</h2>
        {cuotasPendientes.length > 0 && (
          <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="text-sm font-medium text-red-700 mb-1">
              Tenés {cuotasPendientes.length} cuota{cuotasPendientes.length > 1 ? 's' : ''} pendiente{cuotasPendientes.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-red-500">Contactá a la administración para regularizar tu situación.</p>
          </div>
        )}
        {cuotas && cuotas.length > 0 ? (
          <div className="space-y-2">
            {cuotas.map((cuota: any) => (
              <div key={cuota.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{cuota.periodo}</p>
                  <p className="text-xs text-gray-500">
                    Vence: {new Date(cuota.vencimiento).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${cuota.monto.toLocaleString('es-AR')}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    cuota.estado === 'pagado'
                      ? 'bg-green-50 text-green-600'
                      : cuota.estado === 'vencido'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-yellow-50 text-yellow-600'
                  }`}>
                    {cuota.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No hay cuotas registradas todavía.</p>
        )}
      </div>

    </div>
  )
}