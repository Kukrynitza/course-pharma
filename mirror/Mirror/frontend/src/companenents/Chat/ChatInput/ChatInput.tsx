'use client'
import { useState, useRef, useEffect } from 'react'
import { useCamera } from '@/hooks/useCamera'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import styles from './ChatInput.module.css'

interface ChatInputProps {
  onSendMessage: (text: string, image?: File, audio?: Blob) => void
  accentColor: string;
}

export default function ChatInput({ onSendMessage, accentColor }: ChatInputProps) {
  const [textColor, setTextColor] = useState<string | undefined>()
  const [inputText, setInputText] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const voiceButtonRef = useRef<HTMLButtonElement>(null)
  
  const { takePhoto, isTakingPhoto, error: cameraError } = useCamera()
  const {
    isRecording: isVoiceRecording,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
    error: voiceError
  } = useVoiceRecorder()

  useEffect(() => setTextColor(getComputedStyle(document.documentElement).getPropertyValue('--text')), [accentColor])
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputText])

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (isVoiceRecording && voiceButtonRef.current && !voiceButtonRef.current.contains(e.target as Node)) {
        stopRecording()
      }
    }

    if (isVoiceRecording) {
      document.addEventListener('click', handleDocumentClick)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('click', handleDocumentClick)
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('click', handleDocumentClick)
      document.body.style.overflow = ''
    }
  }, [isVoiceRecording, stopRecording])

  // Обработчик нажатия Enter для завершения записи
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isVoiceRecording && e.key === 'Enter') {
        e.preventDefault()
        stopRecording()
      }
    }

    if (isVoiceRecording) {
      document.addEventListener('keydown', handleKeyPress)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [isVoiceRecording, stopRecording])

  useEffect(() => {
    if (cameraError) {
      alert(cameraError)
    }
    if (voiceError) {
      alert(voiceError)
    }
  }, [cameraError, voiceError])

  const handleSendMessage = () => {
    if (inputText.trim() || selectedImage || audioBlob) {
      // Передаем текст только если нет аудио
      const textToSend = audioBlob ? '' : inputText.trim()
      onSendMessage(textToSend, selectedImage || undefined, audioBlob || undefined)
      setInputText('')
      setSelectedImage(null)
      setImagePreview('')
      resetRecording()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (isVoiceRecording) {
        stopRecording()
      } else {
        handleSendMessage()
      }
    }
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
    }
  }

  const setImageFile = (file: File) => {
    setSelectedImage(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Удаление аудио записи
  const handleRemoveAudio = () => {
    resetRecording()
  }

  // Функция съемки фото
  const handleTakePhoto = async () => {
    const photoFile = await takePhoto()
    if (photoFile) {
      setImageFile(photoFile)
    }
  }

  // Функция записи голоса
  const handleVoiceRecord = async () => {
    if (!isVoiceRecording) {
      await startRecording()
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Текст для отображения в поле ввода
  const getInputDisplayText = () => {
    if (isVoiceRecording) {
      return `🔴 Запись: ${formatTime(recordingTime)} (Нажмите Enter для завершения)`
    }
    if (audioBlob) {
      return `Голосовое сообщение: ${formatTime(recordingTime)}`
    }
    return inputText
  }

return (
    <>
      {imagePreview && (
        <div className={styles.imagePreview}>
          <div><img src={imagePreview} alt="Preview" onClick={handleRemoveImage} /></div>
        </div>
      )}

      {isVoiceRecording && (
        <div className={styles.voiceRecordingOverlay}>
          <div className={styles.voiceRecordingPanel}>
            <div className={styles.voiceRecordingVisualizer}>
              <div className={styles.voicePulse}></div>
              <div className={styles.voiceIcon}>🎤</div>
            </div>
            <div className={styles.voiceTimer}>
              {formatTime(recordingTime)}
            </div>
            <div className={styles.voiceHint}>
              Нажмите Enter или кликните в любом месте экрана чтобы остановить запись
            </div>
          </div>
        </div>
      )}

      <div className={`${styles.chatInputContainer} ${isVoiceRecording ? styles.recordingMode : ''}`}>
        <input
          type="file"
          ref={fileInputRef}
          className={styles.fileInput}
          accept="image/*"
          onChange={handleFileSelect}
        />
        
        <button
          className={styles.attachButton}
          onClick={handleAttachClick}
          aria-label="Прикрепить изображение"
          disabled={isVoiceRecording}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={accentColor} viewBox="0 0 256 256"><path d="M209.66,122.34a8,8,0,0,1,0,11.32l-82.05,82a56,56,0,0,1-79.2-79.21L147.67,35.73a40,40,0,1,1,56.61,56.55L105,193A24,24,0,1,1,71,159L154.3,74.38A8,8,0,1,1,165.7,85.6L82.39,170.31a8,8,0,1,0,11.27,11.36L192.93,81A24,24,0,1,0,159,47L59.76,147.68a40,40,0,1,0,56.53,56.62l82.06-82A8,8,0,0,1,209.66,122.34Z"></path></svg>
        </button>

        <button
          className={styles.cameraButton}
          onClick={handleTakePhoto}
          disabled={isTakingPhoto || isVoiceRecording}
          aria-label="Сделать фото"
        >
          {isTakingPhoto ? (
            <div className={styles.spinner}></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={accentColor} viewBox="0 0 256 256"><path d="M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.43l13.63,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z"></path></svg>
          )}
        </button>

        <div className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            className={styles.chatInput}
            value={getInputDisplayText()}
            onChange={(e) => {
              if (!isVoiceRecording && !audioBlob) {
                setInputText(e.target.value)
              }
            }}
            onKeyPress={handleKeyPress}
            placeholder={audioBlob ? "Голосовое сообщение готово к отправке" : "Введите сообщение..."}
            rows={1}
            disabled={isVoiceRecording}
            readOnly={isVoiceRecording || !!audioBlob}
          />
          
          {/* Кнопка записи голоса внутри поля ввода */}
          {/* <button
            ref={voiceButtonRef}
            className={`${styles.voiceButton} ${isVoiceRecording ? styles.recording : ''} ${audioBlob ? styles.hasAudio : ''}`}
            onClick={audioBlob ? handleRemoveAudio : handleVoiceRecord} // Изменяем обработчик для аудио
            disabled={isTakingPhoto}
            aria-label={isVoiceRecording ? 'Идет запись...' : audioBlob ? 'Удалить аудио запись' : 'Записать голосовое сообщение'}
          >
            {isVoiceRecording ? (
              <div className={styles.voiceButtonRecording}>
                <div className={styles.voiceButtonPulse}></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.6V240a8,8,0,0,1-16,0V207.6A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64,64,0,0,0,128,0,8,8,0,0,1,16,0A80.11,80.11,0,0,1,136,207.6Z"/>
                </svg>
              </div>
            ) : audioBlob ? (
              // Кнопка удаления вместо иконки микрофона
              <div className={styles.removeAudioIcon}>
                ×
              </div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill={accentColor} viewBox="0 0 256 256">
                <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.6V240a8,8,0,0,1-16,0V207.6A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64,64,0,0,0,128,0,8,8,0,0,1,16,0A80.11,80.11,0,0,1,136,207.6Z"/>
              </svg>
            )}
          </button> */}
        </div>

        <button
          className={styles.sendButton}
          onClick={handleSendMessage}
          disabled={(!inputText.trim() && !selectedImage && !audioBlob) || isVoiceRecording}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill={textColor} viewBox="0 0 256 256"><path d="M227.32,28.68a16,16,0,0,0-15.66-4.08l-.15,0L19.57,82.84a16,16,0,0,0-2.49,29.8L102,154l41.3,84.87A15.86,15.86,0,0,0,157.74,248q.69,0,1.38-.06a15.88,15.88,0,0,0,14-11.51l58.2-191.94c0-.05,0-.1,0-.15A16,16,0,0,0,227.32,28.68ZM157.83,231.85l-.05.14,0-.07-40.06-82.3,48-48a8,8,0,0,0-11.31-11.31l-48,48L24.08,98.25l-.07,0,.14,0L216,40Z"></path></svg>
        </button>
      </div>
    </>
  )
}