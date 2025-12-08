'use client'
import { useActionState, useEffect, useRef } from 'react'
import { maxLength, minLength, pipe, string, trim, email, parse } from 'valibot'
import styles from './Registration.module.css'
import RegistrationUser from '@/actions/User/RegistrationUser'

const passwordSchema = pipe(
  string(),
  trim(),
  minLength(6, 'Минимальная длина пароля - 6 символов'),
  maxLength(30, 'Максимальная длина пароля - 30 символов')
)

const loginSchema = pipe(
  string(),
  trim(),
  minLength(5, 'Минимальная длина логина - 5 символов'),
  maxLength(27, 'Максимальная длина логина - 27 символов')
)

const emailSchema = pipe(
  string(),
  trim(),
  email('Введите корректный email адрес')
)

interface RegistrationState {
  success: boolean
  error: string | null
  fieldErrors: {
    login?: string
    email?: string
    password?: string
    [key: string]: string | undefined
  }
}

interface Registration {
  registration: number;
  setRegistration: (registration: number) => void;
}

async function registrationAction(prevState: RegistrationState, formData: FormData) {
  const login = formData.get('login') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  try {
    parse(emailSchema, email)
} catch (error: unknown) {
  return { 
    success: false, 
    error: 'Проверьте правильность введенных данных',
    fieldErrors: { email: 'Введите корректный email адрес' }
  }
}

  
  try {
    parse(loginSchema, login)
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Ошибка'
  return { 
    success: false, 
    error: 'Проверьте правильность введенных данных',
    fieldErrors: { login: message }
  }
}

  
  try {
    parse(passwordSchema, password)
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Ошибка'
  return { 
    success: false, 
    error: 'Проверьте правильность введенных данных',
    fieldErrors: { password: message }
  }
}

  try {
    await RegistrationUser(login, password, email)
    return { success: true, error: null, fieldErrors: {} }
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Ошибка регистрации. Попробуйте позже.'
  return {
    success: false,
    error: message,
    fieldErrors: {}
  }
}

  
  // if (login === 'existinguser') {
  //   return { 
  //     success: false, 
  //     error: 'Такой пользователь уже существует',
  //     fieldErrors: { login: 'Такой пользователь уже существует' }
  //   }
  // }
  
  // // Имитация проверки существующего email
  // if (email === 'existing@email.com') {
  //   return { 
  //     success: false, 
  //     error: 'Этот email уже используется',
  //     fieldErrors: { email: 'Этот email уже используется' }
  //   }
  // }
  
  return { success: true, error: null, fieldErrors: {} }
}

export default function Registration({ registration, setRegistration }: Registration) {
  const [state, action, isPending] = useActionState(registrationAction, {
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
              minLength={5}
              maxLength={27}
            />
            {state.fieldErrors?.login && (
              <span className={styles.errorText}>{state.fieldErrors.login}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="example@gmail.com"
              required
            />
            {state.fieldErrors?.email && (
              <span className={styles.errorText}>{state.fieldErrors.email}</span>
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
            />
            {state.fieldErrors?.password && (
              <span className={styles.errorText}>{state.fieldErrors.password}</span>
            )}
          </div>

          {state.error && !state.fieldErrors?.login && !state.fieldErrors?.email && !state.fieldErrors?.password && (
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