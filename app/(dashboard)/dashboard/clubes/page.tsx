import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ClubesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!perfil || perfil.rol !== 'superadmin') redirect('/dashboard')

  const { data: clubes } = await supabase
    .from('clubs')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clubes</h1>
          <p className="text-gray-500 text-sm mt-1">Todos los clubes registrados en la plataforma</p>
        </div>
        <Link
          href="/dashboard/clubes/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          + Nuevo club
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total clubes', value: clubes?.length ?? 0, color: 'text-blue-600' },
          { label: 'Activos', value: clubes?.filter(c => c.activo).length ?? 0, color: 'text-green-600' },
          { label: 'Inactivos', value: clubes?.filter(c => !c.activo).length ?? 0, color: 'text-gray-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Listado de clubes</h2>
        </div>

        {clubes && clubes.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Club</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Slug</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Plan</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Estado</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Creado</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clubes.map((club: any) => (
                <tr key={club.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-600">
                          {club.nombre[0].toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{club.nombre}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{club.slug}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                      club.plan === 'pro'
                        ? 'bg-purple-50 text-purple-600'
                        : club.plan === 'basic'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {club.plan}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      club.activo
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {club.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {new Date(club.created_at).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/dashboard/clubes/${club.id}`}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">No hay clubes registrados todavía.</p>
            <p className="text-gray-400 text-xs mt-1">Creá el primer club con el botón de arriba.</p>
          </div>
        )}
      </div>

    </div>
  )
}