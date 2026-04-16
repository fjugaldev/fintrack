import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // En PWA instalada (iOS), el OAuth abre un SFSafariViewController.
      // Si hacemos NextResponse.redirect, el home se abre dentro de ese browser
      // externo y el usuario nunca vuelve al PWA.
      //
      // Solución: devolver HTML que intente window.close() para cerrar el
      // SFSafariViewController y volver al PWA (donde la sesión ya está en
      // la cookie). Si window.close() no tiene efecto, redirige al home
      // como fallback (flujo web normal).
      return new NextResponse(
        `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Autenticando...</title>
  <style>
    body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100dvh;margin:0;background:#fff;color:#111}
    p{color:#6b7280;margin:1rem 0;text-align:center}
    a{color:#c2722a;font-weight:600;text-decoration:none}
  </style>
</head>
<body>
  <div>
    <p>Sesión iniciada.<br>Volviendo a la app…</p>
    <p><a href="/">Abrir la app</a></p>
  </div>
  <script>
    // Cierra el SFSafariViewController y devuelve el foco al PWA
    window.close();
    // Fallback: si window.close() no tuvo efecto (browser normal), redirige al home
    setTimeout(function(){ window.location.replace('/'); }, 600);
  </script>
</body>
</html>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }
  }

  // Redirigir a login con indicador de error si el intercambio falla
  return NextResponse.redirect(`${origin}/auth/login?error=oauth`)
}
