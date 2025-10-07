import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Gets the current session from cookies.
 * Returns null if no active session.
 */
export async function getSession() {
  const supabase = await createClient()

  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error fetching session:', error)
    return null
  }
}

/**
 * Gets the current user from the session.
 * Returns null if no active session or user.
 */
export async function getUser() {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

/**
 * Requires authentication for a page or API route.
 * Redirects to login if not authenticated.
 */
export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return session
}

/**
 * Checks if user is authenticated without redirecting.
 * Useful for conditional rendering in components.
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return !!session
}