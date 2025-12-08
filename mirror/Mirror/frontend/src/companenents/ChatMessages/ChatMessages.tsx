'use client'
import { useEffect, useRef } from 'react'
import Message, { MessageType } from '@/companenents/Message/Message'
import styles from './ChatMessages.module.css'

interface ChatMessagesProps {
  messages: MessageType[]
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className={styles.chatMessages}>
      {messages?.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}