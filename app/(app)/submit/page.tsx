import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SubmitWizard } from '@/components/submit/SubmitWizard'

export const metadata = {
  title: 'Submit a Tool — Toolsmaxxing',
}

async function AuthGate() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/submit')
  }

  return <SubmitWizard />
}

export default function SubmitPage() {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="eyebrow">Contribute</div>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', margin: '10px 0 6px' }}>
          Submit a Tool
        </h1>
        <p className="lede">Share an AI tool with the community.</p>
      </div>
      <Suspense>
        <AuthGate />
      </Suspense>
    </div>
  )
}
