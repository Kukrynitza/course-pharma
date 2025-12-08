'use client'
import { useActionState, useEffect, useRef } from 'react'
import { maxLength, minLength, pipe, string, trim, parse } from 'valibot'
import styles from './Auntification.module.css'
import LoginUser from '@/actions/User/LoginUser'

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

interface Auntification {
  registration: number
  setRegistration: (registration: number) => void
  setUserId: (user: { token: string; userId: number }) => void
}

interface AuntificationState {
  success: boolean
  error: string | null
  fieldErrors: {
    login?: string
    password?: string
    [key: string]: string | undefined
  }
  setUserId?: (user: { token: string; userId: number }) => void
}


async function auntificationAction(
  prevState: AuntificationState,
  formData: FormData
): Promise<AuntificationState> {
  const login = formData.get('login') as string
  const password = formData.get('password') as string

  try {
    parse(loginSchema, login)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Проверьте логин'
    return {
      success: false,
      error: 'Проверьте логин',
      fieldErrors: { login: message },
    }
  }


  try {
    parse(passwordSchema, password)
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Проверьте пароль'
  return {
    success: false,
    error: 'Проверьте пароль',
    fieldErrors: { password: message },
  }
}


  try {
    const { token, userId } = await LoginUser(login, password)

    prevState.setUserId?.({ token, userId })
    localStorage.setItem('user', String(userId))
    return { success: true, error: null, fieldErrors: {} }
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Ошибка входа'
  return {
    success: false,
    error: message,
    fieldErrors: {
      login: message.includes('логин') ? message : undefined
    },
  }
}

}

export default function Auntification({
  registration,
  setRegistration,
  setUserId,
}: Auntification) {
  const wrappedAction = async (prevState: AuntificationState, formData: FormData) => {
    return auntificationAction({ ...prevState, setUserId }, formData)
  }

  const [state, action, isPending] = useActionState(wrappedAction, {
    success: false,
    error: null,
    fieldErrors: {},
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
              aria-label="Закрыть"
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