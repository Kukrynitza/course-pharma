'use client'
import styles from "./Header.module.css"
import { useEffect, useState } from "react";
import { useMedia } from 'react-use'

interface Registration {
    setRegistration: (registration: number) => void;
    onChatButtonClick: () => void;
    accentColor: string;
    setAccentColor: (accentColor: string) => void;
}

const useThemeDetector = () => {
  const isDark = useMedia('(prefers-color-scheme: light)')
  return isDark ? 0 : 1
}

export default function Header({setRegistration, onChatButtonClick, accentColor, setAccentColor}: Registration) {
  const themeValue = useThemeDetector()
  const [isRegistered, setRegistered] = useState<boolean>(true)
const [isDark, setIsDark] = useState<number>(themeValue);
useEffect(() => {
  let theme = 'light'
  if (isDark === 0) {
    theme = 'light'
    setAccentColor("#059669")
  } else if (isDark === 1) {
    theme = 'dark'
    setAccentColor("#2A9D8F")
  } else {
    theme = 'sepia'
    setAccentColor("#8B6B3F")
  }
  document.documentElement.setAttribute('data-theme', theme);
}, [isDark]);

  const toggleTheme = () => {
    setIsDark((element) => element === 2 ? 0 : element += 1);
    if (isDark === 0) {
      setAccentColor("#059669")
    } else if (isDark === 1) {
      setAccentColor("#2A9D8F")
    } else {
      setAccentColor("#8B6B3F")
    }
  };

  return (
    <header className={styles.header}>
      <li className={styles.liLeft}>
      {isRegistered &&
      <button className={styles.slidebar} onClick={() => onChatButtonClick()}>
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={accentColor} viewBox="0 0 256 256"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H80V200H40ZM216,200H96V56H216V200Z"></path></svg>
      </button>
      }
      <button className={styles.login} onClick={() => setRegistration(1)}>
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={accentColor} viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM74.08,197.5a64,64,0,0,1,107.84,0,87.83,87.83,0,0,1-107.84,0ZM96,120a32,32,0,1,1,32,32A32,32,0,0,1,96,120Zm97.76,66.41a79.66,79.66,0,0,0-36.06-28.75,48,48,0,1,0-59.4,0,79.66,79.66,0,0,0-36.06,28.75,88,88,0,1,1,131.52,0Z"></path></svg>
      </button>
      </li>
      <li className={styles.liRight}>
      <button className={styles.toggle} onClick={toggleTheme}>
      {isDark === 0 && 
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={accentColor} viewBox="0 0 256 256"><path d="M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z"></path></svg>
      }
      {isDark === 2
      && <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={accentColor} viewBox="0 0 256 256"><path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"></path></svg>
      }
      {isDark === 1
      && <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={accentColor} viewBox="0 0 256 256"><path d="M223.45,40.07a8,8,0,0,0-7.52-7.52C139.8,28.08,78.82,51,52.82,94a87.09,87.09,0,0,0-12.76,49c.57,15.92,5.21,32,13.79,47.85l-19.51,19.5a8,8,0,0,0,11.32,11.32l19.5-19.51C81,210.73,97.09,215.37,113,215.94q1.67.06,3.33.06A86.93,86.93,0,0,0,162,203.18C205,177.18,227.93,116.21,223.45,40.07ZM153.75,189.5c-22.75,13.78-49.68,14-76.71.77l88.63-88.62a8,8,0,0,0-11.32-11.32L65.73,179c-13.19-27-13-54,.77-76.71,22.09-36.47,74.6-56.44,141.31-54.06C210.2,114.89,190.22,167.41,153.75,189.5Z"></path></svg>
      }
      </button>       
      </li>
    </header>
  );
}