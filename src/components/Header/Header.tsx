import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PAGES } from '../../constants/url.constants'
import { authService } from '../../services/auth.service'
import styles from './Header.module.scss'

interface HeaderProps {
  transparent?: boolean;
  theme?: string;
  toggleTheme?: () => void;
}

const Header: React.FC<HeaderProps> = ({ transparent, theme, toggleTheme }) => {
  const jwt = localStorage.getItem("jwt")

  const { data: userData } = useQuery({
    queryKey: ['userData'],
    queryFn: () => authService.getUserData(),
    enabled: !!jwt,
    staleTime: 600000
  })

  const isAdmin = userData?.user?.role === 'ADMIN';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`${styles.header} ${transparent ? styles.transparent : ''}`}>
      <div className={styles.content}>
        <div className={styles.left}>
          <Link to={PAGES.HOME} style={{ textDecoration: 'none' }}>
            <h1 className={styles.textLogo}>BOOKVETERAN.UA</h1>
            <span className={styles.textSubtitle}>Санаторії для захисників</span>
          </Link>
        </div>
        <div className={styles.hamburger} onClick={toggleMobileMenu}>
          <span className={isMobileMenuOpen ? styles.open : ''}></span>
          <span className={isMobileMenuOpen ? styles.open : ''}></span>
          <span className={isMobileMenuOpen ? styles.open : ''}></span>
        </div>

        <div className={`${styles.right} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
          <ul>
            <li><Link to={PAGES.HOME} onClick={closeMobileMenu}>Головна</Link></li>
            <li><Link to={PAGES.CATALOG} onClick={closeMobileMenu}>Каталог</Link></li>
            {isAdmin && <li><Link to={PAGES.ADMIN} onClick={closeMobileMenu}>Адмін-панель</Link></li>}
            {jwt && <li><Link to={PAGES.PROFILE} onClick={closeMobileMenu}>Мій Кабінет</Link></li>}
          </ul>

          {!jwt && (
            <div className={styles.authButtons}>
              <Link to={PAGES.SIGNUP} onClick={closeMobileMenu}>
                <button>Реєстрація</button>
              </Link>
              <Link to={PAGES.LOGIN} onClick={closeMobileMenu}>
                <button>Вхід</button>
              </Link>
            </div>
          )}

          {toggleTheme && (
            <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

