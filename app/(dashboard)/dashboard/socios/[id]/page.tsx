import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DetalleSocioPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!perfil || !['administrativo', 'dirigente', 'superadmin'].includes(perfil.rol)) {
    redirect('/dashboard')
  }

  // Traer datos del socio
  const { data: socio } = await supabase
    .from('socios')
    .select('*, users(nombre, apellido, email, phone, created_at)')
    .eq('id', params.id)
    .single()

  if (!socio) redirect('/dashboard/socios')

  // Traer inscripciones
  const { data: inscripciones } = await supabase
    .from('inscripciones')
    .select('*, disciplinas(nombre, horarios)')
    .eq('socio_id', socio.id)

  // Traer cuotas
  const { data: cuotas } = await supabase
    .from('cuotas')
    .select('*')
    .eq('socio_id', socio.id)
    .order('vencimiento', { ascending: false })

  const cuotasPendientes = cuotas?.filter(c => c.estado === 'pendiente' || c.estado === 'vencido') ?? []

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/socios" className="text-gray-400 hover:text-gray-600 transition-colors">
          ← Volver
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {socio.users?.nombre} {socio.users?.apellido}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Detalle del socio</p>
        </div>
        <Link
          href={`/dashboard/socios/${socio.id}/editar`}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          Editar
        </Link>
      </div>

      {/* Info principal */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Datos personales</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600">
                {socio.users?.nombre?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {socio.users?.nombre} {socio.users?.apellido}
              </p>
              <p className="text-sm text-gray-500">{socio.users?.email}</p>
              <p className="text-sm text-gray-500">{socio.users?.phone ?? 'Sin teléfono'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-500 mb-1">Miembro desde</p>
              <p className="font-medium text-gray-900">
                {new Date(socio.users?.created_at).toLocaleDateString('es-AR', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-500 mb-1">Fecha de alta</p>
              <p className="font-medium text-gray-900">
                {new Date(socio.fecha_alta).toLocaleDateString('es-AR', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Estado */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Estado</h2>
          <div>
            <p className="text-xs text-gray-500 mb-1">Número de socio</p>
            <p className="text-2xl font-bold text-gray-900">{socio.numero_socio ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Categoría</p>
            <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
              {socio.categoria}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Estado</p>
            <span className={`text-sm font-medium px-2.5 py-1 rounded-full capitalize ${
              socio.estado === 'activo' ? 'bg-green-50 text-green-600' :
              socio.estado === 'suspendido' ? 'bg-red-50 text-red-600' :
              socio.estado === 'pendiente' ? 'bg-yellow-50 text-yellow-600' :
              'bg-gray-50 text-gray-600'
            }`}>
              {socio.estado}
            </span>
          </div>
          {socio.observaciones && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Observaciones</p>
              <p className="text-sm text-gray-700">{socio.observaciones}</p>
            </div>
          )}
        </div>
      </div>

      {/* Alerta cuotas pendientes */}
      {cuotasPendientes.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-sm font-medium text-red-700">
              {cuotasPendientes.length} cuota{cuotasPendientes.length > 1 ? 's' : ''} pendiente{cuotasPendientes.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-red-500">Este socio tiene cuotas sin abonar.</p>
          </div>
        </div>
      )}

      {/* Disciplinas */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Actividades inscriptas</h2>
          <button className="text-sm text-blue-600 hover:underline font-medium">+ Inscribir</button>
        </div>
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
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                  ins.estado === 'activa' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {ins.estado}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No está inscripto en ninguna actividad.</p>
        )}
      </div>

      {/* Cuotas */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Historial de cuotas</h2>
          <button className="text-sm text-blue-600 hover:underline font-medium">+ Registrar pago</button>
        </div>
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
                    cuota.estado === 'pagado' ? 'bg-green-50 text-green-600' :
                    cuota.estado === 'vencido' ? 'bg-red-50 text-red-600' :
                    'bg-yellow-50 text-yellow-600'
                  }`}>
                    {cuota.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No hay cuotas registradas.</p>
        )}
      </div>

    </div>
  )
}