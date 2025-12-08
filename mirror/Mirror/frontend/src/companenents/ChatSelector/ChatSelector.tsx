'use client'

import { useEffect, useRef, useState } from 'react'
import { ChatType } from '@/types/chat'
import styles from './ChatSelector.module.css'

interface ChatSelectorProps {
  isOpen: boolean
  onClose: () => void
  chats: ChatType[]
  onChatSelect: (chatId: string) => void
  selectedChatId?: string
  onCreateNewChat?: (chatName: string) => void
  isLoading?: boolean
}

export default function ChatSelector({ 
  isOpen, onClose, chats, onChatSelect, selectedChatId, onCreateNewChat, isLoading = false
}: ChatSelectorProps) {
  // console.log(chats)
  const modalRef = useRef<HTMLDivElement>(null)
  const [showNameInput, setShowNameInput] = useState(false)
  const [chatName, setChatName] = useState('')

  const truncateChatName = (name: string, maxLength: number = 30) => {
    if (!name) return ''
    if (name.length <= maxLength) return name
    return name.substring(0, maxLength - 3) + '...'
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showNameInput) {
          setShowNameInput(false)
          setChatName('')
        } else onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showNameInput, onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (showNameInput) { setShowNameInput(false); setChatName('') } 
      else onClose()
    }
  }

  const handleChatClick = (chatId: string) => onChatSelect(chatId)
  const handleCreateChatClick = () => setShowNameInput(true)
  const handleCancelCreate = () => { setShowNameInput(false); setChatName('') }
  const handleKeyPress = (e: React.KeyboardEvent) => { if(e.key==='Enter') handleCreateChat() }

  const handleCreateChat = () => {
    if (onCreateNewChat) {
      const finalName = chatName.trim() || 'Новый чат'
      onCreateNewChat(finalName)
      setShowNameInput(false)
      setChatName('')
    }
  }

  return (
    <section
      className={isOpen ? styles.modalVisible : styles.modalUnvisible}
      onClick={handleOverlayClick}
      ref={modalRef}
    >
      <div className={styles.modalContent}>
        <div className={styles.formHeader}>
          <h2>Мои чаты</h2>
          <button type="button" className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.chatsContainer}>
          {showNameInput ? (
            <div className={styles.nameInputSection}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Название чата</label>
                <input
                  type="text"
                  className={styles.nameInput}
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Введите название чата..."
                  autoFocus
                />
                <div className={styles.inputHint}>
                  Если оставить пустым, будет использовано &quot;Новый чат&quot;
                </div>
              </div>
              <div className={styles.nameActions}>
                <button className={styles.cancelButton} onClick={handleCancelCreate}>Отменить</button>
                <button className={styles.createButton} onClick={handleCreateChat}>Создать чат</button>
              </div>
            </div>
          ) : chats.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>У вас пока нет чатов</p>
              {onCreateNewChat && (
                <button 
                  className={styles.createFirstChatButton}
                  onClick={handleCreateChatClick}
                  disabled={isLoading}
                >
                  {isLoading ? 'Создание...' : 'Создать первый чат'}
                </button>
              )}
            </div>
          ) : (
            <>
              {onCreateNewChat && (
                <div className={styles.createChatSection}>
                  <button 
                    className={styles.createChatButton}
                    onClick={handleCreateChatClick}
                    disabled={isLoading}
                  >
                    + Создать новый чат
                  </button>
                </div>
              )}

              <div className={styles.chatsList}>
                {chats.map(chat => (
                  <button
                    key={chat.id}
                    className={`${styles.chatItem} ${selectedChatId === chat.id ? styles.chatItemSelected : ''}`}
                    onClick={() => handleChatClick(chat.id)}
                    disabled={isLoading}
                  >
                    <div className={styles.chatInfo}>
                      <span className={styles.chatName}>{truncateChatName(decodeURIComponent(chat.name))}</span>
                    </div>
                    {selectedChatId === chat.id && <div className={styles.selectedIndicator}>✓</div>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
