'use client'
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Header from "@/companenents/Header/Header";
import Registration from "@/companenents/Registration/Registration";
import Auntification from "@/companenents/Auntification/Auntification";
import ChatSelector from '@/companenents/ChatSelector/ChatSelector'
import Chat from "@/companenents/Chat/Chat";
import { Chat as ChatType, Message } from '@/types/chat'
import selectChats from "@/actions/Chat/selectChats";
import selectChatMessages from "@/actions/Message/selectChatMessages";
import insertChat from "@/actions/Chat/insertChat";
import insertMessage from "@/actions/Message/insertMessage";
import sendMessageToAI from "@/actions/AI/sendMessageToAI";

export default function Page() {
  const [registration, setRegistration] = useState<number>(0)
  const [userId, setUserId] = useState<number | null>(null)
  const [chats, setChats] = useState<ChatType[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [currentChatId, setCurrentChatId] = useState<number | null>(null)
  const [isChatSelectorOpen, setIsChatSelectorOpen] = useState(false)
  const [accentColor, setAccentColor] = useState('#059669')
  const [textColor, setTextColor] = useState('#1F2937')
  const [isInputDisabled, setIsInputDisabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loadUserChats = async () => {
    if (!userId) return
    
    try {
      const userChats = await selectChats(userId)
      setChats(userChats)
      
      if (userChats.length > 0 && !currentChatId) {
        setCurrentChatId(userChats[0].id)
      }
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error)
    }
  }

  const loadChatMessages = async (chatId: number) => {
    try {
      const chatMessages = await selectChatMessages(chatId)
      setMessages(chatMessages)
      checkIfInputShouldBeEnabled(chatMessages)
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error)
    }
  }

  const checkIfInputShouldBeEnabled = (chatMessages: Message[]) => {
    if (chatMessages.length === 0) {
      setIsInputDisabled(false)
      return
    }
    
    const lastMessage = chatMessages[chatMessages.length - 1]
    setIsInputDisabled(!lastMessage.answer)
  }

  const handleCreateNewChat = async (chatName: string) => {
    if (!userId) {
      setRegistration(1)
      return
    }

    try {
      const newChat = await insertChat({
        name: chatName,
        user: userId
      })
      if (!newChat) {
        throw new Error('Не удалось создать чат')
        }
      setChats(prev => [...prev, newChat])
      setCurrentChatId(newChat.id)
      setIsChatSelectorOpen(false)
      setMessages([])
      setIsInputDisabled(false)
    } catch (error) {
      console.error('Ошибка создания чата:', error)
    }
  }

  const handleSendMessage = async (text: string) => {
    if (!currentChatId || !userId) return

    const date = new Date(Date.now())
    const time = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
  
    const dateStr = date.toLocaleDateString('ru-RU')
    setIsInputDisabled(true)
    setIsLoading(true)

    const userMessage: Message = {
      id: Date.now(),
      text: text,
      answer: false,
      chat: currentChatId,
      createdAt: `${time} ${dateStr}`
    }

    try {
      await insertMessage(userMessage)
      setMessages(prev => [...prev, userMessage])
      const aiResponse = await sendMessageToAI(text)

      if (aiResponse.success && aiResponse.text) {
        const aiMessage: Message = {
          id: Date.now() + 1,
          text: aiResponse.text,
          answer: true,
          chat: currentChatId,
          createdAt: `${time} ${dateStr}`
                }
        
        await insertMessage(aiMessage)
        setMessages(prev => [...prev, aiMessage])
        setIsInputDisabled(false)
      } else {
        const errorMessage: Message = {
          id: Date.now() + 1,
          text: aiResponse.error || 'Произошла ошибка при обработке запроса',
          answer: true,
          chat: currentChatId,
          createdAt: `${time} ${dateStr}`
        }
        await insertMessage(errorMessage)
        setMessages(prev => [...prev, errorMessage])
        setIsInputDisabled(false)
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
      setIsInputDisabled(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChatSelect = async (chatId: number) => {
    setCurrentChatId(chatId)
    setIsChatSelectorOpen(false)
    await loadChatMessages(chatId)
  }

  const handleOpenChatSelector = () => {
    if (!userId) {
      setRegistration(1)
      return
    }
    setIsChatSelectorOpen(true)
  }

  useEffect(() => {
    if (userId) {
      loadUserChats()
    }
  }, [userId])

  useEffect(() => {
    if (currentChatId && userId) {
      loadChatMessages(currentChatId)
    }
  }, [currentChatId, userId])
// console.log(messages)
  return (
    <>
      <Header 
        setUserId={setUserId}
        registration={registration} 
        setRegistration={setRegistration} 
        onChatButtonClick={handleOpenChatSelector} 
        accentColor={accentColor} 
        setTextColor={setTextColor}
        setAccentColor={setAccentColor} 
      />
      
      <main className={styles.main}>
        {!userId && (
          <div className={styles.welcome}>
            <p>Для начала общения необходимо зарегистрироваться</p>
            <button 
              className={styles.registerButton}
              onClick={() => setRegistration(1)}
            >
              Зарегистрироваться
            </button>
          </div>
        )}
        
        {userId && currentChatId && (
          <Chat 
            key={currentChatId}
            messages={messages}
            onSendMessage={handleSendMessage}
            textColor={textColor}
            accentColor={accentColor}
            isInputDisabled={isInputDisabled || isLoading}
          />
        )}
        
        {userId && !currentChatId && chats.length === 0 && (
          <div className={styles.welcome}>
            <p>У вас пока нет чатов</p>
            <button 
              className={styles.createFirstChatButton}
              onClick={() => setIsChatSelectorOpen(true)}
            >
              Создать первый чат
            </button>
          </div>
        )}
        
        {registration === 1 && (
          <Registration 
            registration={registration} 
            setRegistration={setRegistration}
          />
        )}
        {registration === 2 && (
          <Auntification 
            registration={registration} 
            setRegistration={setRegistration}
          />
        )}
      </main>

      {userId && (
        <ChatSelector
          isOpen={isChatSelectorOpen}
          onClose={() => setIsChatSelectorOpen(false)}
          chats={chats}
          onChatSelect={handleChatSelect}
          selectedChatId={currentChatId}
          onCreateNewChat={handleCreateNewChat}
        />
      )}
    </>
  );
}
