import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"

export default async function Home() {
  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Simple redirect based on session existence
  if (session) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}
