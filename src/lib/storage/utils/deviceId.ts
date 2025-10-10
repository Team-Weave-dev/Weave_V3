/**
 * Device ID Generation and Management
 *
 * Provides a consistent device identifier for tracking which device
 * made changes to data. Useful for audit trails and conflict resolution.
 */

const DEVICE_ID_KEY = 'weave_device_id'

/**
 * Generate a unique device ID using timestamp and random values
 *
 * @returns A unique device identifier
 */
function generateDeviceId(): string {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  const randomPart2 = Math.random().toString(36).substring(2, 15)

  return `device_${timestamp}_${randomPart}${randomPart2}`
}

/**
 * Get or create a device ID for this browser
 *
 * The device ID is stored in localStorage and persists across sessions.
 * If no device ID exists, a new one is generated and stored.
 *
 * @returns The device ID for this browser/device
 */
export function getDeviceId(): string {
  try {
    // Try to get existing device ID
    let deviceId = localStorage.getItem(DEVICE_ID_KEY)

    // If none exists, generate and store a new one
    if (!deviceId) {
      deviceId = generateDeviceId()
      localStorage.setItem(DEVICE_ID_KEY, deviceId)
      console.log('Generated new device ID:', deviceId)
    }

    return deviceId
  } catch (error) {
    // Fallback: generate ephemeral device ID (won't persist)
    console.warn('Failed to access localStorage for device ID, using ephemeral ID')
    return generateDeviceId()
  }
}

/**
 * Reset the device ID (generate a new one)
 *
 * Useful for testing or when you want to treat this as a "new" device
 *
 * @returns The new device ID
 */
export function resetDeviceId(): string {
  const newDeviceId = generateDeviceId()
  try {
    localStorage.setItem(DEVICE_ID_KEY, newDeviceId)
    console.log('Reset device ID to:', newDeviceId)
  } catch (error) {
    console.warn('Failed to save new device ID to localStorage')
  }
  return newDeviceId
}

/**
 * Get device information for debugging/logging
 *
 * @returns Device information object
 */
export function getDeviceInfo(): {
  deviceId: string
  userAgent: string
  platform: string
  language: string
} {
  return {
    deviceId: getDeviceId(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
    language: typeof navigator !== 'undefined' ? navigator.language : 'unknown',
  }
}
