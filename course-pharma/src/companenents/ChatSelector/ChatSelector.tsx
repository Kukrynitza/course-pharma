'use client'
import { useEffect, useRef, useState } from 'react'
import { Chat } from '@/types/chat'
import styles from './ChatSelector.module.css'

interface ChatSelectorProps {
  isOpen: boolean
  onClose: () => void
  chats: Chat[]
  onChatSelect: (chatId: number) => void
  selectedChatId?: number | null
  onCreateNewChat?: (chatName: string) => void
}

export default function ChatSelector({ 
  isOpen, 
  onClose, 
  chats, 
  onChatSelect, 
  selectedChatId,
  onCreateNewChat
}: ChatSelectorProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [showNameInput, setShowNameInput] = useState(false)
  const [chatName, setChatName] = useState('')
  const [nameError, setNameError] = useState('')

  const isChatNameUnique = (name: string): boolean => {
    return !chats.some(chat => 
      chat.name.toLowerCase() === name.toLowerCase().trim()
    )
  }

  const handleCreateChatClick = () => {
    setShowNameInput(true)
    setNameError('')
    setChatName('')
  }

  const handleCreateChat = () => {
    if (!onCreateNewChat || !chatName.trim()) return

    const trimmedName = chatName.trim()
    
    if (!isChatNameUnique(trimmedName)) {
      setNameError('Чат с таким названием уже существует')
      return
    }

    if (trimmedName.length > 100) {
      setNameError('Название чата не должно превышать 100 символов')
      return
    }

    onCreateNewChat(trimmedName)
  }

  const handleCancelCreate = () => {
    setShowNameInput(false)
    setChatName('')
    setNameError('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateChat()
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showNameInput) {
          handleCancelCreate()
        } else {
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, showNameInput])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (showNameInput) {
        handleCancelCreate()
      } else {
        onClose()
      }
    }
  }

  if (!isOpen) return null

  return (
    <section 
      className={isOpen ? styles.modalVisible : styles.modalUnvisible}
      onClick={handleOverlayClick}
      ref={modalRef}
    >
      <div className={styles.modalContent}>
        <div className={styles.formHeader}>
          <h2>Мои чаты</h2>
          <button 
            type="button" 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Закрыть выбор чата"
          >
            ×
          </button>
        </div>

        <div className={styles.chatsContainer}>
          {showNameInput ? (
            <div className={styles.nameInputSection}>
              <div className={styles.inputGroup}>
                <label htmlFor="chatName" className={styles.inputLabel}>
                  Название чата
                </label>
                <input
                  id="chatName"
                  type="text"
                  className={`${styles.nameInput} ${nameError ? styles.inputError : ''}`}
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Введите название чата..."
                  autoFocus
                  maxLength={100}
                />
                {nameError && (
                  <div className={styles.errorText}>{nameError}</div>
                )}
              </div>
              
              <div className={styles.nameActions}>
                <button
                  className={styles.cancelButton}
                  onClick={handleCancelCreate}
                >
                  Отменить
                </button>
                <button
                  className={styles.createButton}
                  onClick={handleCreateChat}
                  disabled={!chatName.trim()}
                >
                  Создать чат
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.createChatSection}>
                <button 
                  className={styles.createChatButton}
                  onClick={handleCreateChatClick}
                >
                  + Создать новый чат
                </button>
              </div>
              
              <div className={styles.chatsList}>
                {chats.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p className={styles.emptyText}>У вас пока нет чатов</p>
                    <button 
                      className={styles.createFirstChatButton}
                      onClick={handleCreateChatClick}
                    >
                      Создать первый чат
                    </button>
                  </div>
                ) : (
                  chats.map((chat) => (
                    <button
                      key={chat.id}
                      className={`${styles.chatItem} ${
                        selectedChatId === chat.id ? styles.chatItemSelected : ''
                      }`}
                      onClick={() => onChatSelect(chat.id)}
                    >
                      <div className={styles.chatInfo}>
                        <span className={styles.chatName}>
                          {chat.name}
                        </span>
                        <span className={styles.chatMeta}>
                          Обновлен: {chat.updateAt}
                        </span>
                      </div>
                      {selectedChatId === chat.id && (
                        <div className={styles.selectedIndicator}>✓</div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}