import {useEffect, useRef, useState} from 'react'
import {supabase} from './supabase'
import {authError, validateCredentials} from './authValidation'
import './account.css'

export default function Account() {
  const dialog = useRef(null)
  const submitting = useRef(false)
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(!supabase)
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!supabase) return
    let active = true
    let eventReceived = false
    const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, next) => {
      eventReceived = true
      if (active) {setSession(next); setReady(true)}
    })
    supabase.auth.getSession().then(({data, error: failure}) => {
      if (!active || eventReceived) return
      setSession(data.session); setReady(true)
      if (failure) setError(authError(failure))
    }).catch(() => {if (active) {setReady(true); setError('Unable to restore your session. Please log in again.')}})
    return () => {active = false; subscription.unsubscribe()}
  }, [])

  function clearPasswords() {setPassword(''); setConfirmation('')}
  function changeMode(next) {setMode(next); setError(''); setNotice(''); clearPasswords()}
  async function submit(event) {
    event.preventDefault()
    if (submitting.current || !supabase) return
    const problem = validateCredentials({email, password, confirmation, signingUp: mode === 'signup'})
    setError(problem); setNotice('')
    if (problem) return
    submitting.current = true; setBusy(true)
    try {
      const credentials = {email: email.trim(), password}
      const {data, error: failure} = mode === 'signup'
        ? await supabase.auth.signUp(credentials)
        : await supabase.auth.signInWithPassword(credentials)
      if (failure) {setError(authError(failure)); return}
      clearPasswords()
      if (data.session) {setSession(data.session); setNotice(mode === 'signup' ? 'Your account is ready.' : 'You’re logged in.')}
      else setNotice('Check your email for a confirmation link, then return here to log in. If you already have an account, log in instead.')
    } catch {setError('Unable to connect. Please try again.')} finally {setBusy(false); submitting.current = false}
  }
  async function logout() {
    if (submitting.current || !supabase) return
    submitting.current = true; setBusy(true); setError(''); setNotice('')
    try {
      const {error: failure} = await supabase.auth.signOut({scope: 'local'})
      if (failure) {setError(authError(failure)); return}
      setSession(null); clearPasswords(); setMode('login'); setNotice('You’re logged out. Your local decisions are still here.')
    } catch {setError('Unable to log out. Please try again.')} finally {setBusy(false); submitting.current = false}
  }
  return <>
    <button className="account-trigger" onClick={() => dialog.current.showModal()} aria-label={session ? 'Your account' : 'Log in or create an account'}>♙ <span>{session ? 'Your account' : 'Log in'}</span></button>
    <dialog ref={dialog} className="account-dialog" aria-labelledby="account-title" onClose={clearPasswords} onCancel={event => {if (busy) event.preventDefault()}}>
      <button className="account-close" aria-label="Close account" disabled={busy} onClick={() => dialog.current.close()}>×</button>
      <span className="eyebrow">YOUR SPACE</span>
      <h2 id="account-title">{session ? 'You’re signed in.' : mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
      <p className="account-local">Decisions stay in this browser. Accounts don’t sync or separate your local history yet.</p>
      {!supabase && <p role="status">Account access is being set up. You can keep using Decision Sprint without an account.</p>}
      {!ready ? <p role="status">Checking your session…</p> : session ? <><p className="account-email">{session.user.email}</p><button className="primary" onClick={logout} disabled={busy}>{busy ? 'Logging out…' : 'Log out'}</button></> : <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <label htmlFor="account-email">Email</label><input id="account-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
          <label htmlFor="account-password">Password</label><input id="account-password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required value={password} onChange={e => setPassword(e.target.value)} />
          {mode === 'signup' && <><small>At least 8 characters.</small><label htmlFor="account-confirmation">Confirm password</label><input id="account-confirmation" type="password" autoComplete="new-password" required value={confirmation} onChange={e => setConfirmation(e.target.value)} /></>}
          <button className="primary" type="submit" disabled={!supabase}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}</button>
          <button type="button" className="account-switch" onClick={() => changeMode(mode === 'signup' ? 'login' : 'signup')}>{mode === 'signup' ? 'Already have an account? Log in' : 'New here? Create an account'}</button>
        </fieldset>
      </form>}
      {error && <p className="account-error" role="alert">{error}</p>}
      {notice && <p className="account-notice" role="status">{notice}</p>}
    </dialog>
  </>
}
