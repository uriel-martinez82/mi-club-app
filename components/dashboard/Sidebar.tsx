'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from '@/types'

interface SidebarProps {
  perfil: User
}

const navSocio = [
  { href: '/dashboard', label: 'Inicio', icon: '🏠' },
  { href: '/dashboard/perfil', label: 'Mi perfil', icon: '👤' },
  { href: '/dashboard/cuotas', label: 'Mis cuotas', icon: '💳' },
  { href: '/dashboard/actividades', label: 'Actividades', icon: '⚽' },
  { href: '/dashboard/noticias', label: 'Noticias', icon: '📢' },
]

const navResponsable = [
  { href: '/dashboard', label: 'Inicio', icon: '🏠' },
  { href: '/dashboard/mi-disciplina', label: 'Mi disciplina', icon: '📋' },
  { href: '/dashboard/asistencia', label: 'Asistencia', icon: '✅' },
  { href: '/dashboard/noticias', label: 'Noticias', icon: '📢' },
]

const navAdmin = [
  { href: '/dashboard', label: 'Inicio', icon: '🏠' },
  { href: '/dashboard/socios', label: 'Socios', icon: '👥' },
  { href: '/dashboard/cuotas', label: 'Cuotas', icon: '💳' },
  { href: '/dashboard/disciplinas', label: 'Disciplinas', icon: '⚽' },
  { href: '/dashboard/notificaciones', label: 'Notificaciones', icon: '🔔' },
  { href: '/dashboard/noticias', label: 'Noticias', icon: '📢' },
]

const navDirigente = [
  { href: '/dashboard', label: 'Inicio', icon: '🏠' },
  { href: '/dashboard/socios', label: 'Socios', icon: '👥' },
  { href: '/dashboard/cuotas', label: 'Cuotas', icon: '💳' },
  { href: '/dashboard/disciplinas', label: 'Disciplinas', icon: '⚽' },
  { href: '/dashboard/notificaciones', label: 'Notificaciones', icon: '🔔' },
  { href: '/dashboard/noticias', label: 'Noticias', icon: '📢' },
  { href: '/dashboard/reportes', label: 'Reportes', icon: '📊' },
  { href: '/dashboard/configuracion', label: 'Configuración', icon: '⚙️' },
]

const navSuperAdmin = [
  { href: '/dashboard', label: 'Inicio', icon: '🏠' },
  { href: '/dashboard/clubes', label: 'Clubes', icon: '🏟️' },
  { href: '/dashboard/clubes/nuevo', label: 'Nuevo club', icon: '➕' },
  { href: '/dashboard/usuarios', label: 'Usuarios', icon: '👥' },
]

function getNav(rol: string) {
  switch (rol) {
    case 'superadmin': return navSuperAdmin
    case 'dirigente': return navDirigente
    case 'administrativo': return navAdmin
    case 'responsable_disciplina': return navResponsable
    default: return navSocio
  }
}

export default function Sidebar({ perfil }: SidebarProps) {
  const pathname = usePathname()
  const nav = getNav(perfil.rol)

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">MC</span>
          </div>
          <span className="font-semibold text-gray-900">Mi Club App</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Usuario */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-gray-600">
              {perfil.nombre?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {perfil.nombre} {perfil.apellido}
            </p>
            <p className="text-xs text-gray-500 capitalize">{perfil.rol}</p>
          </div>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full mt-2 text-xs text-gray-500 hover:text-red-500 transition-colors py-1"
          >
            Cerrar sesión
          </button>
        </form>
      </div>

    </aside>
  )
}