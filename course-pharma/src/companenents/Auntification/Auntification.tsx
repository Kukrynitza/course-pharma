'use client'
import { useActionState, useEffect, useRef, useState } from 'react'
import { maxLength, minLength, pipe, string, trim, parse } from 'valibot'
import styles from './Auntification.module.css'
import selectUsers from '@/actions/User/selectUsers';
import autentificationUser from '@/actions/User/autentificationUser';
import { verify } from '@node-rs/bcrypt';

interface User {
  login: string;
  password: string;
}

const passwordSchema = pipe(
  string(),
  trim(),
  minLength(6, 'Минимальная длина пароля - 6 символов'),
  maxLength(30, 'Максимальная длина пароля - 30 символов')
)

const loginSchema = pipe(
  string(),
  trim(),
  minLength(3, 'Минимальная длина логина - 3 символа'),
  maxLength(20, 'Максимальная длина логина - 20 символов')
)

interface Auntification {
  registration: number;
  setRegistration: (registration: number) => void;
}

export default function Auntification({ registration, setRegistration }: Auntification) {
  const [users, setUsers] = useState<User[]>()
  useEffect(() => {
    async function selectUsersPasAndLog() {
      const data = await selectUsers()
      setUsers(data)
    }
  selectUsersPasAndLog()
  },[])
  async function auntificationAction(prevState: any, formData: FormData) {
  const login = formData.get('login') as string
  const password = formData.get('password') as string
  
  try {
    parse(loginSchema, login)
  } catch (error: any) {
    return { 
      login: formData.get('login'),
      password: formData.get('password'),
      success: false, 
      error: 'Проверьте правильность введенных данных',
      fieldErrors: { login: 'Введите корректный логин' }
    }
  }
  
  try {
    parse(passwordSchema, password)
  } catch (error: any) {
    return { 
      login: formData.get('login'),
      password: formData.get('password'),
      success: false, 
      error: 'Проверьте правильность введенных данных',
      fieldErrors: { password: error.message }
    }
  }
  if (!users || !users.find(element => element.login === login)) {
    return { 
      login: formData.get('login'),
      password: formData.get('password'),
      success: false, 
      error: 'Неверный логин или пароль',
      fieldErrors: { login: 'Неверный логин или пароль' }
    }
  }
  async function autentficate() {
    const isOK = await autentificationUser({login: login, password: password})
    if(isOK){
      setRegistration(0)   
      return {      
        login: formData.get('login'),
        password: formData.get('password'), 
        success: true, 
        error: null, 
        fieldErrors: {} 
      }
    }
    return { 
      login: formData.get('login'),
      password: formData.get('password'),
      success: false, 
      error: 'Неверный логин или пароль',
      fieldErrors: { login: 'Неверный логин или пароль' }
    }
    } 
  autentficate()
      return { 
      login: formData.get('login'),
      password: formData.get('password'),
      success: false, 
      error: 'Ожидание твоего',
      fieldErrors: { login: 'Неверный пароль' }
    }
}
  const [state, action, isPending] = useActionState(auntificationAction, {
    login: '',
    password: '',
    success: false,
    error: null,
    fieldErrors: {}
  })

  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && registration !== 0) {
        setRegistration(0)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [registration, setRegistration])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setRegistration(0)
    }
  }

  const handleRegistrationClick = () => {
    setRegistration(1)
  }

  return (
    <section 
      className={registration === 2 ? styles.modalVisible : styles.modalUnvisible}
      onClick={handleOverlayClick}
      ref={modalRef}
    >
      <div className={styles.modalContent}>
        <form action={action} className={styles.auntificationForm}>
          <div className={styles.formHeader}>
            <h2>Вход в аккаунт</h2>
            <button 
              type="button" 
              className={styles.closeButton}
              onClick={() => setRegistration(0)}
              aria-label="Закрыть аутентификацию"
            >
              ×
            </button>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="login">Логин</label>
            <input
              type="text"
              id="login"
              name="login"
              placeholder="Введите логин"
              required
              minLength={3}
              maxLength={20}
              defaultValue={typeof state.login === 'string' ? state.login : ''}
            />
            {state.fieldErrors?.login && (
              <span className={styles.errorText}>{state.fieldErrors.login}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Введите пароль"
              required
              minLength={6}
              maxLength={30}
              defaultValue={typeof state.password === 'string' ? state.password : ''}
            />
            {state.fieldErrors?.password && (
              <span className={styles.errorText}>{state.fieldErrors.password}</span>
            )}
          </div>

          {state.error && !state.fieldErrors?.login && !state.fieldErrors?.password && (
            <div className={styles.formError}>{state.error}</div>
          )}

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isPending}
          >
            {isPending ? 'Вход...' : 'Войти'}
          </button>

          <div className={styles.registrationSwitch}>
            <p className={styles.p}>Нет аккаунта?</p>
            <button 
              type="button" 
              className={styles.registrationButton}
              onClick={handleRegistrationClick}
            >
              Зарегистрироваться
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}