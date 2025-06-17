import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button, Card, Input, Title, Form, FormGroup } from './styles';
import { TabbedOverlay } from './styles/components/overlays/TabbedOverlay.jsx';
import { useTabbedOverlay } from './styles/components/overlays/useTabbedOverlay.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const overlay = useTabbedOverlay();

  async function handleSubmit(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      overlay.open();
    } else {
      onLogin();
    }
  }

  return (
    <Card>
      <Title>Login</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormGroup>
        <Button type="submit">Entrar</Button>
      </Form>
      <TabbedOverlay isOpen={overlay.isOpen} title="Erro" icon="mdi:alert">
        <p>Falha no login</p>
        <Button onClick={overlay.close}>Fechar</Button>
      </TabbedOverlay>
    </Card>
  );
}
