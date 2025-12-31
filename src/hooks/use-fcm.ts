'use client'

import { useEffect, useState } from 'react'
import { getMessaging, getToken } from 'firebase/messaging'
import { app } from '@/lib/firebase'
import { createClient } from '@/lib/supabase/client'

export function useFcmToken() {
  const [token, setToken] = useState<string | null>(null)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    const retrieveToken = async () => {
      try {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
          const messaging = getMessaging(app)
          
          // Request permission
          const permission = await Notification.requestPermission()
          setNotificationPermission(permission)

          if (permission === 'granted') {
            const currentToken = await getToken(messaging, {
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
            })

            if (currentToken) {
                setToken(currentToken)
                // Save token to database
                await saveTokenToDatabase(currentToken)
            } else {
                console.log('No registration token available. Request permission to generate one.')
            }
          }
        }
      } catch (error) {
        console.error('An error occurred while retrieving token:', error)
      }
    }

    retrieveToken()
  }, [])

  return { token, notificationPermission }
}

async function saveTokenToDatabase(token: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { error } = await supabase
        .from('fcm_tokens')
        .upsert({
            user_id: user.id,
            token: token,
            platform: 'web',
            updated_at: new Date().toISOString()
        }, { onConflict: 'token' })

    if (error) {
        console.error("Error saving FCM token:", error)
    } else {
        console.log("FCM token saved to DB")
    }
}
