import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar perfil del usuario
  const { data: perfil } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Bienvenido{perfil?.nombre ? `, ${perfil.nombre}` : ''}!
        </h1>
        <p className="text-gray-500 mb-6">Tu cuenta fue verificada correctamente.</p>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-900">{user.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Rol</span>
            <span className="font-medium text-gray-900">{perfil?.rol ?? 'socio'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Estado</span>
            <span className="font-medium text-green-600">Activo</span>
          </div>
        </div>
      </div>
    </div>
  )
}