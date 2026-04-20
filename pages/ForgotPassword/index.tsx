import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Store } from '../../services/store';
import { BrandLogo } from '../../components/BrandLogo/index';
import './styles.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await Store.sendPasswordResetEmail(email);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Erro ao enviar e-mail de redefinição.');
      }
    } catch (err) {
      setError('Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Background Decorativo */}
      <div className="blob blob-top"></div>
      <div className="blob blob-bottom"></div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-container">
            <BrandLogo size="lg" />
          </div>
          <h2 className="auth-title">
            Redefinir <span className="highlight">Senha</span>
          </h2>
          <p className="auth-subtitle">
            Informe seu e-mail para receber um link de recuperação.
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle className="icon-sm" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="success-content">
            <div className="alert alert-success">
              <CheckCircle2 className="icon-lg" />
              <p>E-mail de recuperação enviado! Verifique sua caixa de entrada.</p>
            </div>
            <Link to="/login" className="btn-secondary">
              Voltar para Login
            </Link>
          </div>
        ) : (
          <>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <div className="input-icon">
                  <Mail className="icon-sm" />
                </div>
                <input
                  type="email"
                  required
                  className="auth-input"
                  placeholder="Seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? <Loader2 className="icon-loading" /> : 'Enviar Link de Recuperação'}
              </button>
            </form>

            <div className="auth-footer">
              <Link to="/login" className="back-link">
                <ArrowLeft className="icon-xs" />
                Voltar para o Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;