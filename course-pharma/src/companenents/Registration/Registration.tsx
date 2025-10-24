'use client'
import { useActionState, useEffect, useRef, useState } from 'react'
import { maxLength, minLength, pipe, string, trim, parse } from 'valibot'
import styles from './Registration.module.css'
import insertUser from '@/actions/User/insertUser'
import selectUsersLogin from '@/actions/User/selectUsersLogin'

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

interface Registration {
  registration: number;
  setRegistration: (registration: number) => void;
}

export default function Registration({ registration, setRegistration }: Registration) {
  const [usersLogins, setUsersLogin] = useState<string[] | undefined>()
  const modalRef = useRef<HTMLDivElement>(null)

  async function registrationAction(prevState: any, formData: FormData) {
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
  
    if (!usersLogins || usersLogins.find(element => element === login)) {
      console.log(usersLogins)
      return { 
        login: formData.get('login'),
        password: formData.get('password'),
        success: false, 
        error: 'Этот логин уже используется',
        fieldErrors: { login: 'Этот логин уже используется' }
      }
    }
    insertUser({login: login, password: password})
    setRegistration(0)
    return {       
      login: formData.get('login'),
      password: formData.get('password'), 
      success: true, 
      error: null, 
      fieldErrors: {} 
    }
  }

  const [state, action, isPending] = useActionState(registrationAction, {
    login: '',
    password: '',
    success: false,
    error: null,
    fieldErrors: {}
  })

  useEffect(() => {
    async function selectLogins() {
      const data = await selectUsersLogin()
      setUsersLogin(data)
    }
    selectLogins()
  }, [])

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

  const handleLoginClick = () => {
    setRegistration(2)
  }

  return (
    <section 
      className={registration === 1 ? styles.modalVisible : styles.modalUnvisible}
      onClick={handleOverlayClick}
      ref={modalRef}
    >
      <div className={styles.modalContent}>
        <form action={action} className={styles.registrationForm}>
          <div className={styles.formHeader}>
            <h2>Регистрация</h2>
            <button 
              type="button" 
              className={styles.closeButton}
              onClick={() => setRegistration(0)}
              aria-label="Закрыть регистрацию"
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
            {isPending ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>

          <div className={styles.loginSwitch}>
            <p className={styles.p}>Уже есть аккаунт?</p>
            <button 
              type="button" 
              className={styles.loginButton}
              onClick={handleLoginClick}
            >
              Войти в аккаунт
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}