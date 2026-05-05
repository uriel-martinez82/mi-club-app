export type Rol = 'socio' | 'responsable_disciplina' | 'administrativo' | 'dirigente' | 'superadmin'

export type PlanClub = 'free' | 'basic' | 'pro'

export type EstadoSocio = 'activo' | 'inactivo' | 'suspendido' | 'pendiente'

export type EstadoCuota = 'pendiente' | 'pagado' | 'vencido' | 'dispensado'

export type TipoNotificacion = 'info' | 'alerta' | 'pago' | 'evento' | 'sistema'

export type EstadoPost = 'pendiente' | 'publicado' | 'rechazado'

export interface Club {
  id: string
  nombre: string
  slug: string
  logo_url?: string
  dominio?: string
  plan: PlanClub
  activo: boolean
  created_at: string
}

export interface User {
  id: string
  club_id: string
  email: string
  phone?: string
  nombre?: string
  apellido?: string
  avatar_url?: string
  rol: Rol
  activo: boolean
  created_at: string
}

export interface Socio {
  id: string
  user_id: string
  club_id: string
  numero_socio?: string
  categoria: 'general' | 'juvenil' | 'infantil' | 'vitalicio' | 'honorario'
  fecha_alta: string
  estado: EstadoSocio
  grupo_familiar: GrupoFamiliar[]
  observaciones?: string
  created_at: string
}

export interface GrupoFamiliar {
  nombre: string
  apellido: string
  parentesco: string
  fecha_nacimiento?: string
}

export interface Disciplina {
  id: string
  club_id: string
  nombre: string
  descripcion?: string
  responsable_id?: string
  cupo_max?: number
  horarios: Horario[]
  activa: boolean
  created_at: string
}

export interface Horario {
  dia: string
  hora_inicio: string
  hora_fin: string
}

export interface Inscripcion {
  id: string
  socio_id: string
  disciplina_id: string
  club_id: string
  fecha_inscripcion: string
  estado: 'activa' | 'inactiva' | 'pendiente' | 'cancelada'
  observaciones?: string
  created_at: string
}

export interface Cuota {
  id: string
  club_id: string
  socio_id: string
  periodo: string
  monto: number
  vencimiento: string
  estado: EstadoCuota
  metodo_pago?: 'efectivo' | 'transferencia' | 'mercadopago' | 'debito' | 'otro'
  comprobante_url?: string
  pagado_at?: string
  created_at: string
}

export interface Notificacion {
  id: string
  club_id: string
  emisor_id?: string
  destinatario_id?: string
  destinatario_tipo: 'individual' | 'club' | 'rol'
  destinatario_rol?: Rol
  tipo: TipoNotificacion
  titulo: string
  contenido: string
  leida: boolean
  created_at: string
}

export interface Post {
  id: string
  club_id: string
  autor_id: string
  contenido: string
  imagen_url?: string
  tipo: 'post' | 'evento' | 'comunicado' | 'resultado'
  estado: EstadoPost
  likes: number
  fijado: boolean
  created_at: string
}

export interface Comentario {
  id: string
  post_id: string
  club_id: string
  autor_id: string
  contenido: string
  estado: EstadoPost
  created_at: string
}