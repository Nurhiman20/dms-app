/**
 * Dummy Authentication API Service
 * Simulates API calls for authentication without a real backend
 */

export interface LoginRequest {
  role: string
}

export interface LoginResponse {
  success: boolean
  user: {
    id: string
    role: string
    name: string
    email: string
  }
  token: string
  message?: string
}

/**
 * Simulates a login API call
 * @param credentials - Login credentials containing role
 * @returns Promise with login response
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  // Simulate API delay (1-2 seconds)
  const delay = Math.random() * 1000 + 1000
  await new Promise((resolve) => setTimeout(resolve, delay))

  // Validate role
  if (!credentials.role || !['Admin', 'Sales'].includes(credentials.role)) {
    throw new Error('Invalid role selected')
  }

  // Simulate successful login response
  const mockUser = {
    id: `user-${Date.now()}`,
    role: credentials.role,
    name: credentials.role === 'Admin' ? 'Admin User' : 'Sales User',
    email: `${credentials.role.toLowerCase()}@dmsapp.com`,
  }

  // Generate a dummy token
  const token = `dummy-token-${Date.now()}-${Math.random().toString(36).substring(7)}`

  return {
    success: true,
    user: mockUser,
    token,
    message: 'Login successful',
  }
}

/**
 * Simulates a logout API call
 * @returns Promise with logout response
 */
export async function logout(): Promise<{ success: boolean; message: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    success: true,
    message: 'Logged out successfully',
  }
}

