import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  console.log('=== DASHBOARD LAYOUT ===')
  console.log('user:', user?.id ?? 'null')
  console.log('userError:', userError?.message ?? 'none')

  if (!user) {
    console.log('→ redirect: no user')
    redirect('/login')
  }

  const { data: perfil, error: perfilError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  console.log('perfil:', perfil?.id ?? 'null')
  console.log('perfilError:', perfilError?.message ?? 'none')

  if (!perfil) {
    console.log('→ redirect: no perfil')
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar perfil={perfil} />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}