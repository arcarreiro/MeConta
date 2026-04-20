import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store } from '../../services/store';
import { Mail, Lock, User as UserIcon, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';
import './styles.css';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formatErrorMessage = (msg: string) => {
    if (msg.includes('email rate limit exceeded')) {
      return 'Muitas tentativas. Por favor, aguarde 10 minutos.';
    }
    if (msg.includes('Invalid login credentials')) {
      return 'E-mail ou senha incorretos.';
    }
    if (msg.includes('User already registered')) {
      return 'Este e-mail já possui uma conta vinculada.';
    }
    if (msg.includes('weak_password')) {
      return 'A senha precisa ter pelo menos 6 caracteres.';
    }
    return msg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      if (password.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const result = await Store.login(email, password);
        if (result.user) {
          navigate('/');
        } else {
          setError(result.error || 'Erro ao realizar login.');
        }
      } else {
        if (!name || !email || !password) {
          setError('Por favor, preencha todos os campos.');
          setLoading(false);
          return;
        }
        const result = await Store.register({ name, email, password });
        if (result.success) {
          setIsLogin(true);
          setPassword('');
          setConfirmPassword('');
          alert('Conta criada com sucesso! Agora você pode entrar.');
        } else {
          setError(formatErrorMessage(result.error || 'Erro ao criar conta.'));
        }
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__bubble login-page__bubble--top" />
      <div className="login-page__bubble login-page__bubble--bottom" />

      <div className="login-card">
        <div className="login-card__header">
          <div className="login-card__logo">
            <BrandLogo size="lg" />
          </div>
          <h2 className="login-card__title">
            Me<span className="login-card__title-highlight">Conta</span>
          </h2>
          <p className="login-card__subtitle">
            {isLogin
              ? 'Faça login para gerenciar seus feedbacks.'
              : 'Crie sua conta para começar.'}
          </p>
        </div>

        {error && (
          <div className="login-card__error">
            <AlertCircle className="login-card__error-icon" />
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="login-field">
              <div className="login-field__icon">
                <UserIcon className="login-field__icon-svg" />
              </div>
              <input
                type="text"
                required
                className="login-field__input"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="login-field">
            <div className="login-field__icon">
              <Mail className="login-field__icon-svg" />
            </div>
            <input
              type="email"
              required
              className="login-field__input"
              placeholder="E-mail profissional"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="login-field login-field--with-toggle">
            <div className="login-field__icon">
              <Lock className="login-field__icon-svg" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="login-field__input login-field__input--with-toggle"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="login-field__toggle"
            >
              {showPassword ? (
                <EyeOff className="login-field__icon-svg" />
              ) : (
                <Eye className="login-field__icon-svg" />
              )}
            </button>
          </div>

          {isLogin && (
            <div className="flex justify-end pt-1">
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-slate-400 hover:text-violet-600 transition-colors"
              >
                Esqueceu sua senha?
              </Link>
            </div>
          )}

          {!isLogin && (
            <div className="login-field">
              <div className="login-field__icon">
                <CheckCircle2 className="login-field__icon-svg" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="login-field__input"
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="login-submit"
          >
            {loading ? (
              <Loader2 className="login-submit__spinner" />
            ) : isLogin ? (
              'Acessar Conta'
            ) : (
              'Criar Minha Conta'
            )}
          </button>
        </form>

        <div className="login-switch">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setPassword('');
              setConfirmPassword('');
            }}
            className="login-switch__button"
          >
            {isLogin
              ? 'Ainda não tem conta? Clique aqui'
              : 'Já possui uma conta? Entre agora'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

