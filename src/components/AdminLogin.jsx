import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles';
import { API_BASE_URL } from '../config';
import StyledButton from './StyledButton';
import { PizzaIcon } from './Icons';

const AdminLogin = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('admin@pizzaria.com');
    const [senha, setSenha] = useState('admin123');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const r = await fetch(`${API_BASE_URL}/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, senha }) });
            if (!r.ok) throw new Error('Credenciais inválidas.');
            const { token } = await r.json();
            login(token);
        } catch (err) {
            setError(err.message || 'Erro ao fazer login.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#FFFBFB',
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.04) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(220, 38, 38, 0.04) 0%, transparent 50%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem',
        }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                {/* Logo / brand */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '4rem',
                        height: '4rem',
                        backgroundColor: '#DC2626',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        boxShadow: '0 4px 16px rgba(220, 38, 38, 0.3)',
                    }}>
                        <PizzaIcon style={{ height: '2.25rem', width: '2.25rem', color: 'white' }} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1F2937', letterSpacing: '-0.03em', margin: 0 }}>
                        Acesso Restrito
                    </h2>
                    <p style={{ marginTop: '0.35rem', color: '#9CA3AF', fontSize: '0.875rem' }}>
                        Painel de Administração · La Brasa
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    border: '2px solid #FEE2E2',
                    boxShadow: '0 8px 24px rgba(220, 38, 38, 0.08)',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                        padding: '0.875rem 1.5rem',
                    }}>
                        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
                            Autenticação
                        </p>
                    </div>

                    <form onSubmit={handleLogin} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={styles.label} htmlFor="email">Email</label>
                            <input style={styles.input} id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <label style={styles.label} htmlFor="senha">Senha</label>
                            <input style={styles.input} id="senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
                        </div>
                        {error && (
                            <div style={{ backgroundColor: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '0.5rem', padding: '0.6rem 0.875rem' }}>
                                <p style={{ color: '#DC2626', fontSize: '0.8rem', fontWeight: 500, margin: 0 }}>{error}</p>
                            </div>
                        )}
                        <StyledButton type="submit" disabled={isLoading} style={{ width: '100%', height: '2.75rem', fontSize: '0.95rem' }}>
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </StyledButton>
                    </form>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                    <Link
                        to="/"
                        style={{ fontSize: '0.875rem', color: '#9CA3AF', textDecoration: 'none', fontWeight: 500 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                        onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
                    >
                        ← Voltar ao Cardápio
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
