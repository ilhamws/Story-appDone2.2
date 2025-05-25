import { VAPID_PUBLIC_KEY, API_BASE_URL } from '@/utils/config'
import { UserSession } from '@/services/UserSession'
import axios from 'axios'

export class NotificationHelper {
  static async requestPermission() {
    if (!('Notification' in window)) return false
    return await Notification.requestPermission()
  }

  static async subscribe() {
    if (!('serviceWorker' in navigator)) return null

    const registration = await navigator.serviceWorker.ready
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })
    }

    const token = UserSession.getToken()
    if (!token) return subscription

    try {
      await axios.post(`${API_BASE_URL}/notifications/subscribe`, {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: this.arrayBufferToBase64(subscription.getKey('auth'))
        }
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    } catch (error) {
      console.error('Failed to register subscription:', error)
    }

    return subscription
  }

  static urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
  }

  static arrayBufferToBase64(buffer) {
    return window.btoa(String.fromCharCode(...new Uint8Array(buffer)))
  }
}