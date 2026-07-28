import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { CupSoda } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Button, Card, Input, Label } from '@/components/ui'

export default function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuthStore()
  const [email, setEmail] = useState('owner@siptrack.test')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(55,143,122,0.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(196,92,38,0.14),transparent_30%),linear-gradient(180deg,#f7faf9,#eef5f2)]" />
      <Card className="relative w-full max-w-md border-brand-100/80 p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
            <CupSoda className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink">SipTrack</h1>
          <p className="mt-2 text-sm text-muted">Sign in to your beverage business suite</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button className="w-full" size="lg" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Demo: owner@siptrack.test / password
        </p>
      </Card>
    </div>
  )
}
