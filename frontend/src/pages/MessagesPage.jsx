import { ArrowLeft, MessageCircleMore, SendHorizontal } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getConversations, getMessages } from '../api/messages'
import { getProfile } from '../api/profile'
import Avatar from '../components/common/Avatar.jsx'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import SkeletonLoader from '../components/common/SkeletonLoader.jsx'
import { useToast } from '../components/common/Toast.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useWebSocket } from '../hooks/useWebSocket.js'
import { getErrorMessage } from '../utils/apiError.js'
import { timeAgo } from '../utils/timeAgo.js'

function mapIncomingConversation(currentUserId, message, existingConversation) {
  const otherUserId = message.senderId === currentUserId ? message.receiverId : message.senderId
  const otherUserName =
    message.senderId === currentUserId
      ? existingConversation?.otherParticipant?.name || existingConversation?.otherUserName || 'Conversation'
      : message.senderName

  const otherUserAvatar =
    message.senderId === currentUserId
      ? existingConversation?.otherParticipant?.profilePhoto || existingConversation?.otherUserAvatar || null
      : message.senderAvatar

  return {
    conversationId: existingConversation?.conversationId || `temp-${otherUserId}`,
    otherParticipant: {
      id: otherUserId,
      name: otherUserName,
      profilePhoto: otherUserAvatar,
    },
    lastMessagePreview: message.content,
    lastMessageTime: message.timestamp,
    unreadCount: message.senderId === currentUserId ? 0 : (existingConversation?.unreadCount || 0) + 1,
  }
}

export default function MessagesPage() {
  const location = useLocation()
  const { currentUser } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [mobileChatOpen, setMobileChatOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const { showToast } = useToast()

  const queryUserId = useMemo(() => new URLSearchParams(location.search).get('userId'), [location.search])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSocketMessage = useCallback((message) => {
    if (!currentUser?.id) {
      return
    }

    const otherUserId = message.senderId === currentUser.id ? message.receiverId : message.senderId
    const isActive = activeConversation?.otherParticipant?.id === otherUserId

    setMessages((current) => {
      const duplicate = current.some((item) => item.clientMessageId && item.clientMessageId === message.clientMessageId)
      if (duplicate || !isActive) {
        return current
      }
      return [...current, message]
    })

    setConversations((current) => {
      const existing = current.find((item) => item.otherParticipant.id === otherUserId)
      const nextConversation = mapIncomingConversation(currentUser.id, message, existing)
      const filtered = current.filter((item) => item.otherParticipant.id !== otherUserId)
      return [nextConversation, ...filtered]
    })

    if (isActive) {
      setConversations((current) =>
        current.map((item) =>
          item.otherParticipant.id === otherUserId
            ? { ...item, unreadCount: 0 }
            : item,
        ),
      )
    }
  }, [activeConversation?.otherParticipant?.id, currentUser?.id])

  const { sendMessage } = useWebSocket(currentUser?.id, handleSocketMessage)

  useEffect(() => {
    let ignore = false

    async function loadConversations() {
      setLoadingConversations(true)
      try {
        const data = await getConversations()
        if (ignore) {
          return
        }
        setConversations(data)

        if (queryUserId) {
          const matching = data.find((item) => String(item.otherParticipant.id) === String(queryUserId))
          if (matching) {
            setActiveConversation(matching)
            setMobileChatOpen(true)
          } else {
            const profile = await getProfile(queryUserId)
            if (!ignore) {
              setActiveConversation({
                conversationId: `temp-${profile.id}`,
                otherParticipant: {
                  id: profile.id,
                  name: profile.name,
                  profilePhoto: profile.profilePhoto,
                },
                lastMessagePreview: '',
                lastMessageTime: null,
                unreadCount: 0,
              })
              setMobileChatOpen(true)
            }
          }
        } else {
          setActiveConversation((current) => current || data[0] || null)
        }
      } catch (error) {
        showToast({
          title: 'Inbox unavailable',
          message: getErrorMessage(error, 'Your conversations could not be loaded.'),
          tone: 'error',
        })
      } finally {
        if (!ignore) {
          setLoadingConversations(false)
        }
      }
    }

    loadConversations()

    return () => {
      ignore = true
    }
  }, [queryUserId, showToast])

  useEffect(() => {
    if (!activeConversation) {
      setMessages([])
      return
    }

    let ignore = false

    async function loadConversation() {
      setLoadingMessages(true)
      try {
        const data = await getMessages(activeConversation.otherParticipant.id)
        if (!ignore) {
          setMessages(data)
          setConversations((current) =>
            current.map((item) =>
              item.otherParticipant.id === activeConversation.otherParticipant.id
                ? { ...item, unreadCount: 0 }
                : item,
            ),
          )
        }
      } catch (error) {
        showToast({
          title: 'Conversation unavailable',
          message: getErrorMessage(error, 'The selected conversation could not be loaded.'),
          tone: 'error',
        })
      } finally {
        if (!ignore) {
          setLoadingMessages(false)
        }
      }
    }

    loadConversation()

    return () => {
      ignore = true
    }
  }, [activeConversation, showToast])

  function resizeComposer() {
    if (!textareaRef.current) {
      return
    }
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 112)}px`
  }

  useEffect(() => {
    resizeComposer()
  }, [messageText])

  function openConversation(conversation) {
    setActiveConversation(conversation)
    setMobileChatOpen(true)
  }

  function appendOptimisticMessage(content) {
    if (!currentUser || !activeConversation) {
      return null
    }

    const optimistic = {
      clientMessageId: crypto.randomUUID(),
      senderId: currentUser.id,
      receiverId: activeConversation.otherParticipant.id,
      content,
      senderName: currentUser.name,
      senderAvatar: currentUser.profilePhoto,
      timestamp: new Date().toISOString(),
    }

    setMessages((current) => [...current, optimistic])
    setConversations((current) => {
      const existing = current.find((item) => item.otherParticipant.id === activeConversation.otherParticipant.id)
      const nextConversation = mapIncomingConversation(currentUser.id, optimistic, existing || activeConversation)
      const filtered = current.filter((item) => item.otherParticipant.id !== activeConversation.otherParticipant.id)
      return [nextConversation, ...filtered]
    })

    return optimistic
  }

  async function handleSend(event) {
    event.preventDefault()
    const content = messageText.trim()
    if (!content || !activeConversation || !currentUser) {
      return
    }

    setSending(true)
    setMessageText('')
    appendOptimisticMessage(content)

    try {
      sendMessage({
        clientMessageId: optimistic.clientMessageId,
        senderId: currentUser.id,
        receiverId: activeConversation.otherParticipant.id,
        content,
        senderName: currentUser.name,
        senderAvatar: currentUser.profilePhoto,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      showToast({
        title: 'Message failed',
        message: getErrorMessage(error, 'Your message could not be sent.'),
        tone: 'error',
      })
    } finally {
      setSending(false)
    }
  }

  function handleComposerKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  const activeOther = activeConversation?.otherParticipant

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <Card className={`${mobileChatOpen ? 'hidden lg:block' : 'block'} overflow-hidden p-0`}>
        <div className="border-b border-white/10 px-5 py-4">
          <h1 className="font-display text-2xl font-bold">Messages</h1>
          <p className="mt-1 text-left text-sm text-gray-400">Your direct conversations and recent replies.</p>
        </div>
        {loadingConversations ? (
          <div className="space-y-3 p-5">
            <SkeletonLoader className="h-20" />
            <SkeletonLoader className="h-20" />
            <SkeletonLoader className="h-20" />
          </div>
        ) : conversations.length > 0 ? (
          <div className="max-h-[70vh] overflow-y-auto">
            {conversations.map((conversation) => (
              <button
                key={`${conversation.conversationId}-${conversation.otherParticipant.id}`}
                type="button"
                onClick={() => openConversation(conversation)}
                className={`flex w-full items-start gap-3 border-b border-white/5 px-5 py-4 text-left transition ${
                  activeConversation?.otherParticipant?.id === conversation.otherParticipant.id
                    ? 'bg-primary/12'
                    : 'hover:bg-white/5'
                }`}
              >
                <Avatar src={conversation.otherParticipant.profilePhoto} name={conversation.otherParticipant.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className={`truncate text-left text-sm ${conversation.unreadCount > 0 ? 'font-semibold' : 'font-medium'}`}>
                      {conversation.otherParticipant.name}
                    </p>
                    <div className="flex items-center gap-2">
                      {conversation.unreadCount > 0 ? <span className="h-2.5 w-2.5 rounded-full bg-primary" /> : null}
                      <p className="text-sm text-gray-400">{timeAgo(conversation.lastMessageTime)}</p>
                    </div>
                  </div>
                  <p className="mt-1 truncate text-left text-sm text-gray-400">
                    {conversation.lastMessagePreview || 'No messages yet'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={MessageCircleMore}
              title="No conversations yet"
              message="Start a chat from someone's profile to see it appear here."
            />
          </div>
        )}
      </Card>

      <Card className={`${mobileChatOpen ? 'flex' : 'hidden lg:flex'} min-h-[72vh] flex-col overflow-hidden p-0`}>
        {activeOther ? (
          <>
            <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
              <button
                type="button"
                className="rounded-full p-2 text-[rgb(var(--text-soft))] transition hover:bg-white/10 lg:hidden"
                onClick={() => setMobileChatOpen(false)}
              >
                <ArrowLeft size={18} />
              </button>
              <Avatar src={activeOther.profilePhoto} name={activeOther.name} />
              <div>
                <p className="text-left font-semibold">{activeOther.name}</p>
                <p className="text-left text-sm text-gray-400">Direct conversation</p>
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
              {loadingMessages ? (
                <>
                  <SkeletonLoader className="h-16 w-3/4" />
                  <SkeletonLoader className="ml-auto h-16 w-3/5" />
                </>
              ) : messages.length > 0 ? (
                messages.map((message, index) => {
                  const mine = message.senderId === currentUser?.id
                  const previous = messages[index - 1]
                  const showTimestamp = !previous || timeAgo(previous.timestamp) !== timeAgo(message.timestamp)

                  return (
                    <div key={`${message.timestamp}-${index}`} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xl ${mine ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div
                          className={`rounded-2xl px-4 py-3 text-left text-sm ${
                            mine
                              ? 'rounded-br-sm bg-primary text-white'
                              : 'rounded-bl-sm bg-white/5 text-[rgb(var(--text))]'
                          }`}
                        >
                          <p className="text-left">{message.content}</p>
                        </div>
                        {showTimestamp ? (
                          <p className="mt-2 text-sm text-gray-400">{timeAgo(message.timestamp)}</p>
                        ) : null}
                      </div>
                    </div>
                  )
                })
              ) : (
                <EmptyState
                  icon={MessageCircleMore}
                  title="No messages yet"
                  message="Send the first message to start this conversation."
                />
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="border-t border-white/10 px-6 py-4">
              <div className="flex items-end gap-3 rounded-3xl bg-white/5 p-2">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  className="max-h-28 min-h-[44px] w-full resize-none bg-transparent px-3 py-2 text-left outline-none placeholder:text-[rgb(var(--text-soft))]"
                  placeholder="Write a message"
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                />
                <Button type="submit" loading={sending} disabled={!messageText.trim()}>
                  <SendHorizontal size={16} />
                  Send
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex h-full items-center justify-center p-8">
            <EmptyState
              icon={MessageCircleMore}
              title="Select a conversation to start chatting"
              message="Choose an existing conversation or open a profile and start a new message."
            />
          </div>
        )}
      </Card>
    </div>
  )
}
