export function validateCredentials({email, password, confirmation, signingUp}) {
  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Enter a valid email address.'
  if (!password) return 'Enter your password.'
  if (signingUp && password !== confirmation) return 'Passwords don’t match. Please enter the same password twice.'
  if (signingUp && password.length < 8) return 'Use at least 8 characters for your password.'
  return ''
}

export function authError(error) {
  if (error?.code === 'invalid_credentials') return 'The email or password is incorrect.'
  if (error?.code === 'email_not_confirmed') return 'Please confirm your email before logging in.'
  if (error?.status === 429) return 'Too many attempts. Please wait a little before trying again.'
  if (error?.code === 'weak_password') return 'Please choose a stronger password.'
  if (error?.code === 'user_already_exists') return 'Unable to create this account. Try logging in instead.'
  return 'We couldn’t complete that request. Check your connection and try again.'
}
