'use client'
import { useEffect, useState } from 'react'
import ChatMessages from '@/companenents/ChatMessages/ChatMessages'
import ChatInput from './ChatInput/ChatInput'
import { Message } from '@/types/chat'
import styles from './Chat.module.css'

interface ChatProps {
  textColor?: string
  messages: Message[]
  onSendMessage: (text: string) => void
  accentColor: string
  isInputDisabled: boolean
  initialMessage?: string
  
}

export default function Chat({ 
  textColor = '#1F2937', 
  messages, 
  onSendMessage, 
  accentColor, 
  isInputDisabled,
  initialMessage 
}: ChatProps) {
  const [displayMessages, setDisplayMessages] = useState<Message[]>([])

  useEffect(() => {
    setDisplayMessages(messages)
  }, [messages])

  const handleSendMessage = (text: string) => {
    onSendMessage(text)
  }

  return (
    <div className={styles.chatContainer}>
      <ChatMessages messages={displayMessages} />
      <ChatInput 
        onSendMessage={handleSendMessage} 
        accentColor={accentColor}
        textColor={textColor}
        disabled={isInputDisabled}
        initialMessage={initialMessage}
      />
    </div>
  )
}