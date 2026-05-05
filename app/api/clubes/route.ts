import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: perfil } = await supabase
      .from('users')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (!perfil || perfil.rol !== 'superadmin') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const {
      nombre, slug, plan,
      dirigente_nombre, dirigente_apellido,
      dirigente_email, dirigente_phone
    } = body

    // Cliente admin con service_role key
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Crear el club
    const { data: club, error: clubError } = await adminSupabase
      .from('clubs')
      .insert({ nombre, slug, plan, activo: true })
      .select()
      .single()

    if (clubError) throw new Error(clubError.message)

    // 2. Crear el usuario dirigente
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'

    const { data: newAuth, error: authError } = await adminSupabase.auth.admin.createUser({
      email: dirigente_email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        nombre: dirigente_nombre,
        apellido: dirigente_apellido,
      }
    })

    if (authError) throw new Error(authError.message)

    // 3. Actualizar el user con club_id y rol
    const { error: userError } = await adminSupabase
      .from('users')
      .update({
        club_id: club.id,
        phone: dirigente_phone || null,
        rol: 'dirigente',
      })
      .eq('id', newAuth.user.id)

    if (userError) throw new Error(userError.message)

    return NextResponse.json({ success: true, club })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}