import { useCallback, useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function useWebSocket(userId, onMessageReceived, destination = '/queue/messages') {
  const clientRef = useRef(null)

  useEffect(() => {
    if (!userId) {
      return undefined
    }

    const token = localStorage.getItem('token')
    if (!token) {
      return undefined
    }

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/user${destination}`, (frame) => {
          const message = JSON.parse(frame.body)
          onMessageReceived(message)
        })
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [destination, onMessageReceived, userId])

  const sendMessage = useCallback((chatMessage) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(chatMessage),
      })
    }
  }, [])

  return { sendMessage }
}
