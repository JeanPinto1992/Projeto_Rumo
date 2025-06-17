import { Title } from './styles'
import LoginPage from './LoginPage.jsx'

function HomePage({ onLogin, goToRegister, goToRecover }) {
  return (
    <div style={{ padding: 'var(--spacing-lg)' }}>
      <Title>Bem-vindo</Title>
      <LoginPage
        onLogin={onLogin}
        goToRegister={goToRegister}
        goToRecover={goToRecover}
      />
    </div>
  )
}

export default HomePage
