'use client'

import styles from "./page.module.css"
import Header from "@/companenents/Header/Header"
import { useEffect, useState } from "react"
import Registration from "@/companenents/Registration/Registration"
import Auntification from "@/companenents/Auntification/Auntification"
import ChatSelector from '@/companenents/ChatSelector/ChatSelector'
import Chat from "@/companenents/Chat/Chat"
import { ChatType, ChatHistory } from '@/types/chat'
import { MessageType } from '@/companenents/Message/Message'
import createNewChat from "@/actions/Chat/createNewChat"
import loadUserChats from "@/actions/Chat/loadUserChats"
import loadMessages from "@/actions/Messages/loadMessages"
import sendMessage from "@/actions/Messages/sendMessage"
import sendMessageToAI from "@/actions/Messages/sendMessageToAI"

export default function Page() {
  const [registration, setRegistration] = useState<number>(0)
  const [userId, setUserId] = useState<{ token: string; userId: number }>()
  const [chats, setChats] = useState<ChatType[]>([])
  const [messagesByChat, setMessagesByChat] = useState<Record<string, MessageType[]>>({})
  const [chatKey, setChatKey] = useState<string>('') 
  const [isChatSelectorOpen, setIsChatSelectorOpen] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [accentColor, setAccentColor] = useState('#059669')
  useEffect(() => {
    const user = localStorage.getItem('user')
    if (typeof user === "string") {
      setUserId({token: user, userId: Number(user)})
    }
  }, [])
  useEffect(() => {
    const initializeChats = async () => {
      if (!userId?.userId) {
        setIsInitializing(false)
        return
      }

      try {
        const userChats = await loadUserChats(userId.userId)

        if (userChats.length === 0) {
          const firstChat = await createNewChat(userId, 'Мой первый чат')
          const newChat: ChatType = {
            id: firstChat.chatId.toString(),
            name: 'Мой первый чат',
            createdAt: new Date().toISOString(),
            userId: userId.userId,
            isEmpty: true
          }
          setChats([newChat])
          setMessagesByChat({ [newChat.id]: [] })
          setChatKey(newChat.id)
        } else {
          const sortedChats = userChats.sort((a, b) => Number(b.id) - Number(a.id))
          setChats(sortedChats)

          const firstChatId = sortedChats[0].id.toString()
          const firstChatMessages = await loadMessages(Number(firstChatId))
          setMessagesByChat({ [firstChatId]: firstChatMessages })
          setChatKey(firstChatId)
        }
      } catch (error) {
        console.error('Ошибка инициализации чатов:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeChats()
  }, [userId])

  const handleChatSelect = async (chatId: string) => {
    setChatKey(chatId)

    if (messagesByChat[chatId]?.length) {
      setIsChatSelectorOpen(false)
      return
    }

    setIsChatLoading(true)

    try {
      const messages = await loadMessages(Number(chatId))
      console.log(messages)
      setMessagesByChat(prev => ({ ...prev, [chatId]: messages }))
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error)
      setMessagesByChat(prev => ({ ...prev, [chatId]: [] }))
    } finally {
      setIsChatSelectorOpen(false)
      setIsChatLoading(false)
    }
  }

  const handleCreateNewChat = async (chatName?: string) => {
    if (!userId) return

    try {
      const newChatId = await createNewChat(userId, chatName || 'Новый чат')
      const newChat: ChatType = {
        id: newChatId.chatId.toString(),
        name: chatName || 'Новый чат',
        createdAt: new Date().toISOString(),
        userId: userId.userId,
        isEmpty: true
      }

      setChats(prev => [...prev, newChat].sort((a, b) => Number(b.id) - Number(a.id)))
      setMessagesByChat(prev => ({ ...prev, [newChat.id]: [] }))
      setChatKey(newChat.id)
      setIsChatSelectorOpen(false)
    } catch (error) {
      console.error('Ошибка создания чата:', error)
    }
  }

  const handleSendMessage = async (text: string, image?: File, audio?: Blob) => {
    if (!chatKey || !userId) {
      console.warn("Нет текущего чата или пользователя")
      return
    }

    const newMessage: MessageType = {
      id: Date.now().toString(),
      text: audio ? '' : text,
      isOwn: true,
      timestamp: new Date(),
      image: image ? URL.createObjectURL(image) : undefined,
      audio: audio ? URL.createObjectURL(audio) : undefined,
    }

    setMessagesByChat(prev => ({
      ...prev,
      [chatKey]: [...(prev[chatKey] || []), newMessage]
    }))

    try {
      let response: Awaited<ReturnType<typeof sendMessage>>;

      if (image) {
        response = await sendMessage(Number(chatKey), userId.userId, text, image, audio);
      } else {
        response = await sendMessageToAI(userId.userId, text, Number(chatKey));
      }

      console.log("Ответ сервера:", response);

      if (response.response) {
        const botMessage: MessageType = {
          id: Date.now().toString() + "-bot",
          text: response.response,
          isOwn: false,
          timestamp: new Date(),
        }
        console.log(botMessage)
        setMessagesByChat(prev => ({
          ...prev,
          [chatKey]: [...(prev[chatKey] || []), botMessage]
        }))
      }
      
      // const updatedMessages = await loadMessages(Number(chatKey))
      // setMessagesByChat(prev => ({
        //   ...prev,
        //   [chatKey]: updatedMessages
        // }))
      } catch (error) {
        console.error("Ошибка при отправке сообщения:", error)
      }
    }
    
    // console.log(messagesByChat)
  const handleOpenChatSelector = () => {
    if (userId?.userId) setIsChatSelectorOpen(true)
  }

  if (isInitializing) {
    return <div className={styles.loadingContainer}><p>Загрузка чатов...</p></div>
  }

  const currentMessages = messagesByChat[chatKey] || []
  // console.log(currentMessages)
  return (
    <>
      <Header 
        setRegistration={setRegistration} 
        onChatButtonClick={handleOpenChatSelector} 
        accentColor={accentColor} 
        setAccentColor={setAccentColor} 
      />

      <main className={styles.main}>
        {userId ? (
          isChatLoading ? (
            <div className={styles.loadingContainer}><p>Загрузка сообщений...</p></div>
          ) : (
            <Chat
              key={chatKey}
              initialMessages={currentMessages}
              onSendMessage={handleSendMessage}
              accentColor={accentColor}
            />
          )
        ) : (
            <div className={styles.welcome}>
          <p>Для начала общения необходимо зарегистрироваться</p>
          <button 
            className={styles.createFirstChatButton}
            onClick={() => setRegistration(1)}
          >
            Зарегистрироваться
          </button>
        </div>
        )}

        {registration === 1 && (
          <Registration registration={registration} setRegistration={setRegistration} />
        )}

        {registration === 2 && (
          <Auntification setUserId={setUserId} registration={registration} setRegistration={setRegistration} />
        )}
      </main>

      {userId && (
        <ChatSelector
          isOpen={isChatSelectorOpen}
          onClose={() => setIsChatSelectorOpen(false)}
          chats={chats}
          onChatSelect={handleChatSelect}
          selectedChatId={chatKey}
          onCreateNewChat={handleCreateNewChat}
        />
      )}
    </>
  )
}
