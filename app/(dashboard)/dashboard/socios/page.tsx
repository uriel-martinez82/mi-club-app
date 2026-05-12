import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SociosPage() {
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

    const sociosQuery = supabase
        .from('socios')
        .select('*, users(nombre, apellido, email, phone), clubs(nombre)')
        .order('created_at', { ascending: false })

    if (perfil.rol !== 'superadmin') {
        sociosQuery.eq('club_id', perfil.club_id)
    }

    const { data: socios } = await sociosQuery

    const total = socios?.length ?? 0
    const activos = socios?.filter(s => s.estado === 'activo').length ?? 0
    const inactivos = socios?.filter(s => s.estado === 'inactivo').length ?? 0
    const pendientes = socios?.filter(s => s.estado === 'pendiente').length ?? 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Socios</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de socios del club</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
          + Agregar socio
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total socios', value: total, color: 'bg-blue-50 text-blue-600' },
          { label: 'Activos', value: activos, color: 'bg-green-50 text-green-600' },
          { label: 'Inactivos', value: inactivos, color: 'bg-gray-50 text-gray-600' },
          { label: 'Pendientes', value: pendientes, color: 'bg-yellow-50 text-yellow-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Listado de socios</h2>
          <input
            type="text"
            placeholder="Buscar socio..."
            className="text-sm px-4 py-2 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>

        {socios && socios.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Socio</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Nº Socio</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Categoría</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Estado</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Alta</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {socios.map((socio: any) => (
                <tr key={socio.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-blue-600">
                          {socio.users?.nombre?.[0]?.toUpperCase() ?? '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {socio.users?.nombre} {socio.users?.apellido}
                        </p>
                        <p className="text-xs text-gray-500">{socio.users?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    {socio.numero_socio ?? '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                      {socio.categoria}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                      socio.estado === 'activo'
                        ? 'bg-green-50 text-green-600'
                        : socio.estado === 'suspendido'
                        ? 'bg-red-50 text-red-600'
                        : socio.estado === 'pendiente'
                        ? 'bg-yellow-50 text-yellow-600'
                        : 'bg-gray-50 text-gray-600'
                    }`}>
                      {socio.estado}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {new Date(socio.fecha_alta).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/dashboard/socios/${socio.id}`} className="text-xs text-blue-600 hover:underline font-medium">
                        Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">No hay socios registrados todavía.</p>
            <p className="text-gray-400 text-xs mt-1">Agregá el primer socio con el botón de arriba.</p>
          </div>
        )}
      </div>

    </div>
  )
}