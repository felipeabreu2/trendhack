import { createServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = await createServerClient()

    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL para redirecionar após a confirmação do e-mail
  return NextResponse.redirect(new URL("/dashboard", request.url))
}
