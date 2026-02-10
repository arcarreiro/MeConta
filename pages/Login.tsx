
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../services/store';
import { Role } from '../types';
import { Mail, Lock, User as UserIcon, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '../App';

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-100/50 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-100/40 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[3rem] shadow-soft relative z-10 border border-white">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <BrandLogo size="lg" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Me<span className="text-violet-600">Conta</span>
          </h2>
          <p className="mt-3 text-slate-500 font-medium text-sm">
            {isLogin ? 'Faça login para gerenciar seus feedbacks.' : 'Crie sua conta para começar.'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border border-rose-100">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-500">
                <UserIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-violet-100 focus:bg-white rounded-2xl focus:ring-0 text-slate-900 placeholder-slate-400 font-semibold transition-all"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-500">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              required
              className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-violet-100 focus:bg-white rounded-2xl focus:ring-0 text-slate-900 placeholder-slate-400 font-semibold transition-all"
              placeholder="E-mail profissional"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-500">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              className="block w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent focus:border-violet-100 focus:bg-white rounded-2xl focus:ring-0 text-slate-900 placeholder-slate-400 font-semibold transition-all"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-violet-500"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {!isLogin && (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-500">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-violet-100 focus:bg-white rounded-2xl focus:ring-0 text-slate-900 placeholder-slate-400 font-semibold transition-all"
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex justify-center py-4 px-4 bg-violet-600 hover:bg-violet-700 text-white text-lg font-bold rounded-2xl shadow-brand disabled:opacity-50 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : isLogin ? 'Acessar Conta' : 'Criar Minha Conta'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setPassword('');
              setConfirmPassword('');
            }}
            className="text-sm font-bold text-slate-400 hover:text-violet-600 transition-colors"
          >
            {isLogin ? 'Ainda não tem conta? Clique aqui' : 'Já possui uma conta? Entre agora'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
