import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { NewCollectionForm } from '@/components/settings/NewCollectionForm'

export const metadata = {
  title: 'Settings — Toolsmaxxing',
}

export default function SettingsPage() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  )
}

async function SettingsContent() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/settings')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, bio, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <>
      <div style={{ marginBottom: 40 }}>
        <div className="eyebrow">Account</div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: '10px 0 4px',
          }}
        >
          Settings
        </h1>
      </div>

      <section style={{ marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid var(--line)' }}>
        <ProfileForm
          username={profile?.username ?? null}
          bio={profile?.bio ?? null}
          avatarUrl={profile?.avatar_url ?? null}
        />
      </section>

      <section id="collections" style={{ marginBottom: 48 }}>
        <NewCollectionForm />
      </section>

      <section style={{ paddingTop: 24, borderTop: '1px solid var(--line)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px' }}>
          Account
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 16 }}>
          Signed in with OAuth. To sign out:
        </p>
        <form action="/auth/signout" method="post">
          <button className="btn ghost" type="submit">
            Sign out
          </button>
        </form>
      </section>
    </>
  )
}

function SettingsSkeleton() {
  return (
    <div style={{ color: 'var(--text-2)', padding: '60px 0', textAlign: 'center' }}>
      Loading settings…
    </div>
  )
}
