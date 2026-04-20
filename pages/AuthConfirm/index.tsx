import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { Store } from '../../services/store';


const AuthConfirm: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleConfirm = async () => {
            const token_hash = searchParams.get('token_hash');
            const type = searchParams.get('type');
            const next = searchParams.get('next') || '/';

            if (!token_hash || !type) {
                setError('Parâmetros de confirmação ausentes.');
                return;
            }

            try {
                const { success, error: authError } = await Store.verifyOtp(token_hash, type);

                if (success) {
                    navigate(next);
                } else {
                    setError(authError || 'Falha ao verificar o token.');
                }
            } catch (err) {
                console.error('Auth confirm error:', err);
                setError('Ocorreu um erro inesperado durante a confirmação.');
            }
        };

        handleConfirm();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-soft text-center space-y-6">
                {!error ? (
                    <>
                        <div className="flex justify-center">
                            <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verificando...</h2>
                        <p className="text-slate-500 font-medium">Por favor, aguarde enquanto validamos sua solicitação.</p>
                    </>
                ) : (
                    <>
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-10 h-10" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ops! Algo deu errado</h2>
                        <p className="text-rose-600 font-bold">{error}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
                        >
                            Voltar para o Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthConfirm;