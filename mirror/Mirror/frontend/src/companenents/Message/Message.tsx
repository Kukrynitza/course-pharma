import styles from './Message.module.css'
import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

export interface MessageType {
  id: string
  text?: string
  isOwn: boolean
  timestamp: Date
  image?: string
  audio?: string
}

interface MessageProps {
  message: MessageType
}

export default function Message({ message }: MessageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
  }

  return (
    <div
      className={`${styles.message} ${
        message.isOwn ? styles.messageOwn : styles.messageOther
      }`}
    >
      {message.image && (
        <img
          src={message.image}
          alt="Attached"
          className={styles.messageImage}
        />
      )}
      
      {message.audio && (
        <div className={styles.audioMessage}>
          <audio
            ref={audioRef}
            src={message.audio}
            onEnded={handleEnded}
          />
          <button
            className={`${styles.audioPlayButton} ${isPlaying ? styles.playing : ''}`}
            onClick={togglePlay}
            aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          
          <div className={styles.audioInfo}>
            <span>Голосовое сообщение</span>
          </div>
        </div>
      )}
      
      {message.text && (
        <div className={styles.messageText}>
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
      )}
      
      <div className={styles.messageTime}>
        {formatTime(message.timestamp)}
      </div>
    </div>
  )
}
