import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Store } from '../../services/store';
import { BrandLogo } from '../../components/BrandLogo/index';
import './styles.css';

const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await Store.updatePassword(password);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(result.error || 'Erro ao redefinir senha.');
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
                        Nova <span className="highlight">Senha</span>
                    </h2>
                    <p className="auth-subtitle">
                        Digite sua nova senha abaixo.
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <AlertCircle className="icon-sm" />
                        <span>{error}</span>
                    </div>
                )}

                {success ? (
                    <div className="alert alert-success animate-success">
                        <CheckCircle2 className="icon-lg" />
                        <p>Senha alterada com sucesso! Redirecionando para o login...</p>
                    </div>
                ) : (
                    <form className="auth-form" onSubmit={handleSubmit}>
                        {/* Input Nova Senha */}
                        <div className="input-group">
                            <div className="input-icon">
                                <Lock className="icon-sm" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="auth-input has-right-icon"
                                placeholder="Nova senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="toggle-password"
                            >
                                {showPassword ? <EyeOff className="icon-sm" /> : <Eye className="icon-sm" />}
                            </button>
                        </div>

                        {/* Input Confirmar Senha */}
                        <div className="input-group">
                            <div className="input-icon">
                                <CheckCircle2 className="icon-sm" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="auth-input"
                                placeholder="Confirmar nova senha"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? <Loader2 className="icon-loading" /> : 'Redefinir Senha'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;