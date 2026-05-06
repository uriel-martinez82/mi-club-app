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
      .select('rol, club_id')
      .eq('id', user.id)
      .single()

    if (!perfil || !['administrativo', 'dirigente', 'superadmin'].includes(perfil.rol)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const { nombre, apellido, email, phone, numero_socio, categoria, estado, observaciones } = body

    const club_id = body.club_id_override && perfil.rol === 'superadmin'
        ? body.club_id_override
        : perfil.club_id

    if (!club_id) {
        return NextResponse.json({ error: 'Tu cuenta no está asociada a ningún club' }, { status: 400 })
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Crear usuario en auth
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'

    const { data: newAuth, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { nombre, apellido }
    })

    if (authError) throw new Error(authError.message)

    // 2. Actualizar user con club_id y phone
    const { error: userError } = await adminSupabase
      .from('users')
      .update({
        club_id: club_id,
        phone: phone || null,
      })
      .eq('id', newAuth.user.id)

    if (userError) throw new Error(userError.message)

    // 3. Crear registro en socios
    const { error: socioError } = await adminSupabase
      .from('socios')
      .insert({
        user_id: newAuth.user.id,
        club_id: club_id,
        numero_socio: numero_socio || null,
        categoria,
        estado,
        observaciones: observaciones || null,
      })

    if (socioError) throw new Error(socioError.message)

    return NextResponse.json({ success: true })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}