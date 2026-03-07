import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PedidoCard from './PedidoCard';
import { API_BASE_URL } from '../config';

const tocarNotificacao = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const tocarDing = (inicio) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 1400;
        osc.type = 'sine';
        gain.gain.setValueAtTime(3.0, ctx.currentTime + inicio);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + inicio + 0.4);
        osc.start(ctx.currentTime + inicio);
        osc.stop(ctx.currentTime + inicio + 0.4);
    };
    tocarDing(0); tocarDing(0.2); tocarDing(0.4);
};

const COLUNAS = [
    { status: 1, label: 'Em Análise',  acento: '#F59E0B', fundo: '#FAFAFA' },
    { status: 2, label: 'Na Fila',     acento: '#2563EB', fundo: '#FAFAFA' },
    { status: 3, label: 'Pronto',      acento: '#16A34A', fundo: '#FAFAFA' },
];

const PedidoManager = () => {
    const [pedidos, setPedidos] = useState([]);
    const [fetchError, setFetchError] = useState('');
    const [ultimaAt, setUltimaAt] = useState(null);
    const idsAnterioresRef = useRef(null);
    const { token } = useAuth();

    const fetchPedidos = async () => {
        try {
            if (!token) return;
            const res = await fetch(`${API_BASE_URL}/admin/pedidos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Falha ao buscar pedidos');
            const data = await res.json();
            setPedidos(data);
            setUltimaAt(new Date());
            const idsAtuais = new Set(data.filter(p => p.status === 1).map(p => p.id));
            if (idsAnterioresRef.current !== null) {
                if ([...idsAtuais].some(id => !idsAnterioresRef.current.has(id))) tocarNotificacao();
            }
            idsAnterioresRef.current = idsAtuais;
        } catch (e) {
            setFetchError(e.message);
        }
    };

    useEffect(() => {
        fetchPedidos();
        const id = setInterval(fetchPedidos, 30000);
        return () => clearInterval(id);
    }, []);

    const handleStatusChange = async (pedidoId, novoStatus) => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/pedidos/${pedidoId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: Number(novoStatus) }),
            });
            if (!res.ok) throw new Error('Falha ao atualizar status');
            fetchPedidos();
        } catch (e) {
            setFetchError(e.message);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#F1F5F9' }}>

            {/* Barra de topo */}
            <div style={{
                padding: '0.875rem 1.5rem',
                backgroundColor: '#1E293B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'white', letterSpacing: '-0.01em' }}>
                        Pedidos em Andamento
                    </span>
                    {COLUNAS.map(col => {
                        const qtd = pedidos.filter(p => p.status === col.status).length;
                        return (
                            <div key={col.status} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    backgroundColor: col.acento, flexShrink: 0,
                                }} />
                                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 500 }}>
                                    {col.label}: <strong style={{ color: 'white' }}>{qtd}</strong>
                                </span>
                            </div>
                        );
                    })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {ultimaAt && (
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            Atualizado {ultimaAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                    <button
                        onClick={fetchPedidos}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.4rem 0.75rem',
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem', fontWeight: 600, color: '#CBD5E1',
                            cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.14)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                            <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
                        </svg>
                        Atualizar
                    </button>
                </div>
            </div>

            {fetchError && (
                <div style={{ padding: '0.5rem 1.5rem', backgroundColor: '#FEF2F2', borderBottom: '1px solid #FECACA' }}>
                    <p style={{ color: '#DC2626', fontSize: '0.78rem', fontWeight: 500, margin: 0 }}>{fetchError}</p>
                </div>
            )}

            {/* Colunas */}
            <div style={{
                flex: 1, display: 'flex', gap: '1px',
                overflow: 'hidden', minHeight: 0,
                backgroundColor: '#CBD5E1',
            }}>
                {COLUNAS.map(col => {
                    const lista = pedidos.filter(p => p.status === col.status);
                    return (
                        <div key={col.status} style={{
                            flex: '1 1 0',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: col.fundo,
                            minWidth: 0,
                        }}>
                            {/* Header da coluna */}
                            <div style={{
                                padding: '0.6rem 1rem',
                                borderBottom: `3px solid ${col.acento}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: 'white',
                                flexShrink: 0,
                            }}>
                                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {col.label}
                                </span>
                                <span style={{
                                    backgroundColor: col.acento,
                                    color: 'white',
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    padding: '0.1rem 0.5rem',
                                    borderRadius: '9999px',
                                }}>
                                    {lista.length}
                                </span>
                            </div>

                            {/* Lista de cards */}
                            <div style={{
                                flex: 1, overflowY: 'auto',
                                padding: '0.75rem',
                                display: 'flex', flexDirection: 'column', gap: '0.625rem',
                            }}>
                                {lista.length === 0 ? (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        height: '80px',
                                        color: '#CBD5E1', fontSize: '0.8rem',
                                        border: '1.5px dashed #E2E8F0', borderRadius: '0.5rem',
                                    }}>
                                        Nenhum pedido
                                    </div>
                                ) : lista.map(pedido => (
                                    <PedidoCard
                                        key={pedido.id}
                                        pedido={pedido}
                                        onStatusChange={handleStatusChange}
                                        acento={col.acento}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PedidoManager;
