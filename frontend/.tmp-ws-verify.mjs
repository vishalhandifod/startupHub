import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const baseUrl = 'http://localhost:8080'

async function ensureUser(name, email, password) {
  const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })

  if (registerResponse.ok) {
    return registerResponse.json()
  }

  if (registerResponse.status === 409) {
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!loginResponse.ok) {
      throw new Error(`Login failed for ${email}: ${loginResponse.status}`)
    }
    return loginResponse.json()
  }

  throw new Error(`Register failed for ${email}: ${registerResponse.status}`)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function connectUser(user) {
  return new Promise((resolve, reject) => {
    const received = []
    const timeout = setTimeout(() => {
      client.deactivate()
      reject(new Error(`Timed out connecting websocket for user ${user.user.id}`))
    }, 10000)

    const client = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${user.token}`,
      },
      reconnectDelay: 0,
      onConnect: () => {
        clearTimeout(timeout)
        client.subscribe('/user/queue/messages', (frame) => {
          received.push(JSON.parse(frame.body))
        })
        resolve({ client, received })
      },
      onStompError: (frame) => {
        clearTimeout(timeout)
        reject(new Error(frame.headers.message || 'STOMP error'))
      },
      onWebSocketError: (error) => {
        clearTimeout(timeout)
        reject(error)
      },
    })

    client.activate()
  })
}

async function main() {
  const password = 'password123'
  const first = await ensureUser('WS Sender', 'ws-sender@example.com', password)
  const second = await ensureUser('WS Receiver', 'ws-receiver@example.com', password)

  const sender = await connectUser(first)
  const receiver = await connectUser(second)

  const payload = {
    clientMessageId: `verify-${Date.now()}`,
    senderId: first.user.id,
    receiverId: second.user.id,
    content: `socket-check-${Date.now()}`,
    senderName: first.user.name,
    senderAvatar: first.user.profilePhoto,
    timestamp: new Date().toISOString(),
  }

  sender.client.publish({
    destination: '/app/chat.send',
    body: JSON.stringify(payload),
  })

  await sleep(1500)

  const historyResponse = await fetch(`${baseUrl}/api/messages/${second.user.id}`, {
    headers: {
      Authorization: `Bearer ${first.token}`,
    },
  })

  if (!historyResponse.ok) {
    throw new Error(`History request failed: ${historyResponse.status}`)
  }

  const history = await historyResponse.json()
  const summary = {
    senderReceived: sender.received.length,
    receiverReceived: receiver.received.length,
    historyCount: history.length,
    lastHistoryMessage: history.at(-1)?.content || null,
  }

  console.log(JSON.stringify(summary))

  await sender.client.deactivate()
  await receiver.client.deactivate()
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
