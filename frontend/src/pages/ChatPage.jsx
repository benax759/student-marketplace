import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { io } from 'socket.io-client'
import {
  HiOutlineArrowLeft, HiOutlinePaperAirplane, HiOutlinePhotograph,
  HiOutlineDotsVertical, HiOutlineSearch
} from 'react-icons/hi'
import api from '../lib/api'
import useAuthStore from '../store/authStore'
import { formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'

let socket = null

export default function ChatPage() {
  const { chatId } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }

    // Connect socket
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: localStorage.getItem('token') }
    })
    socket.emit('user_online', user._id)

    socket.on('receive_message', (msg) => {
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev
        return [...prev, msg]
      })
    })

    // Fetch chat list
    api.get('/chat').then(({ data }) => {
      setChats(data.chats)
      if (chatId) {
        const found = data.chats.find(c => c._id === chatId)
        if (found) openChat(found)
      }
    }).finally(() => setLoading(false))

    return () => { socket?.disconnect() }
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const openChat = async (chat) => {
    setActiveChat(chat)
    navigate(`/chat/${chat._id}`, { replace: true })
    socket?.emit('join_room', chat._id)

    try {
      const { data } = await api.get(`/chat/${chat._id}`)
      setMessages(data.chat.messages || [])
    } catch { toast.error('Could not load messages') }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat || sending) return
    const content = newMessage.trim()
    setNewMessage('')
    setSending(true)

    // Optimistic UI
    const optimistic = {
      _id: Date.now().toString(),
      sender: { _id: user._id, name: user.name, avatar: user.avatar },
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    try {
      await api.post(`/chat/${activeChat._id}/message`, { content })
      // Update last message in list
      setChats(prev => prev.map(c =>
        c._id === activeChat._id ? { ...c, lastMessage: content, lastMessageAt: new Date() } : c
      ))
    } catch { toast.error('Failed to send') }
    finally { setSending(false) }
  }

  const getOtherParticipant = (chat) => {
    return chat.participants?.find(p => p._id !== user?._id)
  }

  if (!user) return null

  return (
    <div className="page-container py-4">
      <div className="flex gap-0 h-[calc(100vh-140px)] min-h-[500px] card overflow-hidden">

        {/* ── Chat list sidebar ── */}
        <div className={`${activeChat ? 'hidden sm:flex' : 'flex'} flex-col w-full sm:w-80 border-r border-[var(--border-color)] shrink-0`}>
          {/* Header */}
          <div className="p-4 border-b border-[var(--border-color)]">
            <h2 className="font-bold text-[var(--text-primary)] text-lg">Messages</h2>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-3">
                    <div className="skeleton w-12 h-12 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-3/4 rounded" />
                      <div className="skeleton h-3 w-1/2 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="text-4xl mb-3">💬</div>
                <p className="font-semibold text-[var(--text-primary)] text-sm">No conversations yet</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Contact a seller to start chatting</p>
              </div>
            ) : (
              chats.map(chat => {
                const other = getOtherParticipant(chat)
                const isActive = activeChat?._id === chat._id
                return (
                  <button
                    key={chat._id}
                    onClick={() => openChat(chat)}
                    className={`w-full flex items-start gap-3 p-4 hover:bg-[var(--bg-secondary)] transition-colors text-left ${
                      isActive ? 'bg-brand-50 dark:bg-brand-950/30' : ''
                    }`}
                  >
                    {other?.avatar ? (
                      <img src={other.avatar} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold shrink-0">
                        {other?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{other?.name || 'Unknown'}</p>
                        <span className="text-[10px] text-[var(--text-muted)] shrink-0">{formatDate(chat.lastMessageAt)}</span>
                      </div>
                      {chat.listing && (
                        <p className="text-[10px] text-brand-500 truncate font-medium">{chat.listing.title}</p>
                      )}
                      <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{chat.lastMessage || 'No messages yet'}</p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ── Chat window ── */}
        {activeChat ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat header */}
            {(() => {
              const other = getOtherParticipant(activeChat)
              return (
                <div className="flex items-center gap-3 p-4 border-b border-[var(--border-color)]">
                  <button onClick={() => { setActiveChat(null); navigate('/chat') }} className="sm:hidden btn-ghost p-1.5 mr-1">
                    <HiOutlineArrowLeft className="w-5 h-5" />
                  </button>
                  <Link to={`/profile/${other?._id}`} className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity min-w-0">
                    {other?.avatar ? (
                      <img src={other.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold shrink-0">
                        {other?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{other?.name}</p>
                      {other?.college && <p className="text-xs text-[var(--text-muted)] truncate">{other.college}</p>}
                    </div>
                  </Link>
                  {activeChat.listing && (
                    <Link to={`/listing/${activeChat.listing._id}`} className="hidden sm:flex items-center gap-2 bg-[var(--bg-secondary)] rounded-xl px-3 py-2 hover:bg-[var(--bg-card)] transition-colors shrink-0">
                      {activeChat.listing.images?.[0] && (
                        <img src={activeChat.listing.images[0].url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      )}
                      <div className="text-left">
                        <p className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-[120px]">{activeChat.listing.title}</p>
                        <p className="text-xs text-brand-500 font-bold">₹{activeChat.listing.price}</p>
                      </div>
                    </Link>
                  )}
                </div>
              )
            })()}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => {
                  const isMe = msg.sender?._id === user._id || msg.sender === user._id
                  return (
                    <motion.div
                      key={msg._id || i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold mr-2 self-end shrink-0">
                          {msg.sender?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className={`max-w-[70%] group`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? 'bg-brand-500 text-white rounded-br-md'
                            : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-bl-md'
                        }`}>
                          {msg.content}
                        </div>
                        <p className={`text-[10px] text-[var(--text-muted)] mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                          {formatDate(msg.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-[var(--border-color)]">
              <div className="flex gap-3 items-end">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message…"
                  className="input-base flex-1 py-3 text-sm"
                  maxLength={1000}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="btn-primary p-3 rounded-xl shrink-0 disabled:opacity-50"
                >
                  <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="hidden sm:flex flex-1 items-center justify-center flex-col gap-3 text-center p-8">
            <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center mb-2">
              <span className="text-3xl">💬</span>
            </div>
            <h3 className="font-semibold text-[var(--text-primary)]">Select a conversation</h3>
            <p className="text-sm text-[var(--text-muted)] max-w-xs">Choose a chat from the left to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}
