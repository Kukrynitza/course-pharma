'use client'
import { useEffect, useState } from 'react'
import ChatMessages from '@/companenents/ChatMessages/ChatMessages'
import ChatInput from './ChatInput/ChatInput'
import { MessageType } from '@/companenents/Message/Message'
import styles from './Chat.module.css'

interface ChatProps {
  initialMessages?: MessageType[]
  onSendMessage?: (text: string, image?: File, audio?: Blob) => void
  accentColor: string
}

export default function Chat({ initialMessages, onSendMessage, accentColor }: ChatProps) {
  const [messages, setMessages] = useState(initialMessages)
    useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])
  const handleSendMessage = (text: string, image?: File, audio?: Blob) => {
  let audioUrl: string | undefined
  if (audio) {
    audioUrl = URL.createObjectURL(audio)
  }

  console.log(messages)
  const newMessage: MessageType = {
    id: Date.now().toString(),
    text: audio ? '' : text,
    isOwn: true,
    timestamp: new Date(),
    image: image ? URL.createObjectURL(image) : undefined,
    audio: audioUrl
  }

  setMessages(prev => [...(prev || []), newMessage]);

  
  if (onSendMessage) {
    onSendMessage(audio ? '' : text, image, audio)
  }
}
  return (
    <div className={styles.chatContainer}>
        <ChatMessages messages={messages || []} />
      <ChatInput onSendMessage={handleSendMessage} accentColor={accentColor} />
    </div>
  )
}