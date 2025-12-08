'use client'
import { useEffect, useRef } from 'react'
import Message from '@/companenents/Message/Message'
import styles from './ChatMessages.module.css'

export interface MessageType {
  id: number
  text: string 
  answer: boolean
  chat?: number
  createdAt: string
}

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
      {messages?.map((message, index) => (
        <Message key={index} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}