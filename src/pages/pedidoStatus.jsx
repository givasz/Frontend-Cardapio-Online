import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import StyledButton from '../components/StyledButton';

const statusInfo = {
    1: { texto: "Em Análise",            cor: "#F59E0B", emoji: "🧐" },
    2: { texto: "Na Fila",               cor: "#3B82F6", emoji: "🧑‍🍳" },
    3: { texto: "Pronto para Entrega",   cor: "#16A34A", emoji: "📦" },
    4: { texto: "Finalizado / Entregue", cor: "#6B7280", emoji: "✅" },
    5: { texto: "Cancelado",             cor: "#DC2626", emoji: "❌" },
};

const PedidosStatus = () => {
    const navigate = useNavigate();
    const [telefone, setTelefone] = useState('');
    const [pedidos, setPedidos] = useState([]);
    const [nomeCliente, setNomeCliente] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const buscarPedidosPorTelefone = useCallback(async (numeroParaBuscar) => {
        if (!numeroParaBuscar) return;
        setIsLoading(true);
        setError('');
        setPedidos([]);
        setNomeCliente('');
        try {
            const response = await fetch(`${API_BASE_URL}/pedidos/cliente/${numeroParaBuscar}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha ao buscar pedidos.');
            setPedidos(data);
            if (data.length > 0) setNomeCliente(data[0].nomeCliente);
        } catch (err) {
            setError(err.message);
            setPedidos([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        buscarPedidosPorTelefone(telefone);
    };

    useEffect(() => {
        const savedDataString = localStorage.getItem('customerData');
        if (savedDataString) {
            const savedData = JSON.parse(savedDataString);
            if (savedData.telefone) {
                setTelefone(savedData.telefone);
                buscarPedidosPorTelefone(savedData.telefone);
            }
        }
    }, [buscarPedidosPorTelefone]);

    useEffect(() => {
        if (telefone && pedidos.length > 0) {
            const intervalId = setInterval(() => buscarPedidosPorTelefone(telefone), 60000);
            return () => clearInterval(intervalId);
        }
    }, [telefone, pedidos.length, buscarPedidosPorTelefone]);

    const formatarData = (dataString) => {
        return new Date(dataString).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <div className="status-page">
            {/* Mini header */}
            <div style={{
                backgroundColor: 'white',
                borderBottom: '2.5px solid #DC2626',
                boxShadow: '0 1px 0 #FEE2E2, 0 4px 16px rgba(220,38,38,0.06)',
                padding: '0 1.25rem',
                display: 'flex',
                alignItems: 'center',
                height: '4rem',
            }}>
                <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                        onClick={() => navigate('/')}
                        style={{
                            width: '2.25rem', height: '2.25rem',
                            backgroundColor: '#DC2626',
                            borderRadius: '0.5rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(220,38,38,0.35)',
                            cursor: 'pointer',
                            flexShrink: 0,
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                    </div>
                    <div>
                        <p style={{ fontWeight: 800, color: '#DC2626', fontSize: '0.975rem', lineHeight: 1 }}>La Brasa Pizzaria</p>
                        <p style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1, marginTop: '0.2rem' }}>
                            Acompanhe seu Pedido
                        </p>
                    </div>
                </div>
            </div>

            <div className="status-container">
                <button onClick={() => navigate('/')} className="status-back-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                    Voltar ao Cardápio
                </button>

                {/* Search card */}
                <div className="status-card">
                    <div className="status-card-header">
                        {nomeCliente ? (
                            <>
                                <p style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.75, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                                    Bem-vindo de volta
                                </p>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Olá, {nomeCliente}!</h2>
                            </>
                        ) : (
                            <>
                                <p style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.75, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                                    Rastreamento
                                </p>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Seus Pedidos</h2>
                            </>
                        )}
                    </div>

                    <div className="status-search-body">
                        <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1rem' }}>
                            Digite o número de telefone usado no pedido para ver o status.
                        </p>
                        <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <input
                                type="tel"
                                value={telefone}
                                onChange={(e) => setTelefone(e.target.value)}
                                placeholder="Ex: 38999998888"
                                required
                                style={{
                                    flex: '1 1 200px',
                                    padding: '0.65rem 0.875rem',
                                    fontSize: '0.9rem',
                                    border: '2px solid #FCA5A5',
                                    borderRadius: '0.5rem',
                                    fontFamily: 'inherit',
                                    color: '#1F2937',
                                    outline: 'none',
                                }}
                                onFocus={e => e.target.style.borderColor = '#DC2626'}
                                onBlur={e => e.target.style.borderColor = '#FCA5A5'}
                            />
                            <StyledButton type="submit" disabled={isLoading} style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem', flexShrink: 0 }}>
                                {isLoading ? 'Buscando...' : 'Buscar'}
                            </StyledButton>
                        </form>

                        {error && (
                            <div style={{
                                marginTop: '1rem',
                                backgroundColor: '#FEF2F2',
                                border: '1.5px solid #FECACA',
                                borderRadius: '0.5rem',
                                padding: '0.75rem 1rem',
                            }}>
                                <p style={{ color: '#DC2626', fontSize: '0.875rem', fontWeight: 500 }}>{error}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results */}
                {pedidos.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                        <p style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.75rem' }}>
                            {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} encontrado{pedidos.length !== 1 ? 's' : ''}
                        </p>

                        {pedidos.map(p => {
                            const subtotal = p.itens.reduce((total, itemPedido) => {
                                const precoDoItem = itemPedido.precoFinal ?? itemPedido.item?.preco ?? 0;
                                const precoBordaDoItem = itemPedido.precoBorda ?? 0;
                                return total + ((precoDoItem + precoBordaDoItem) * itemPedido.quantidade);
                            }, 0);

                            const valorTotal = subtotal + (p.taxaEntrega || 0);
                            const statusAtual = statusInfo[p.status] || { texto: 'Desconhecido', cor: '#9CA3AF', emoji: '❓' };

                            return (
                                <div key={p.id} className="pedido-card" style={{ borderLeft: `4px solid ${statusAtual.cor}` }}>
                                    <div className="pedido-card-header">
                                        <div>
                                            <p style={{ fontWeight: 800, fontSize: '1rem', color: '#1F2937', lineHeight: 1 }}>
                                                Pedido #{p.id}
                                            </p>
                                            <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                                                {formatarData(p.criadoEm)}
                                            </p>
                                        </div>
                                        <span className="status-tag" style={{ backgroundColor: statusAtual.cor }}>
                                            {statusAtual.emoji} {statusAtual.texto}
                                        </span>
                                    </div>

                                    <div className="pedido-card-body">
                                        <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: '0.5rem' }}>
                                            Itens do pedido
                                        </p>
                                        {p.itens.map(itemPedido => {
                                            const precoItem = itemPedido.precoFinal ?? itemPedido.item?.preco ?? 0;
                                            const precoBordaItem = itemPedido.precoBorda ?? 0;
                                            const precoTotalItem = precoItem + precoBordaItem;

                                            return (
                                                <div key={itemPedido.id} className="pedido-item-row">
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1F2937' }}>
                                                            <span style={{ color: '#DC2626', marginRight: '0.3rem', fontWeight: 800 }}>
                                                                {itemPedido.quantidade}x
                                                            </span>
                                                            {itemPedido.item?.nome || 'Item não encontrado'}
                                                            {itemPedido.tamanho && (
                                                                <span style={{ color: '#DC2626', fontWeight: 700, marginLeft: '0.3rem' }}>
                                                                    ({itemPedido.tamanho})
                                                                </span>
                                                            )}
                                                        </p>
                                                        {itemPedido.tipoMassa && (
                                                            <p style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600, marginTop: '0.15rem' }}>
                                                                Massa: {itemPedido.tipoMassa.nome}
                                                            </p>
                                                        )}
                                                        {itemPedido.borda && (
                                                            <p style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600, marginTop: '0.1rem' }}>
                                                                Borda: {itemPedido.borda.nome}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1F2937', flexShrink: 0, marginLeft: '1rem' }}>
                                                        R$ {(precoTotalItem * itemPedido.quantidade).toFixed(2).replace('.', ',')}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="pedido-card-footer">
                                        {(p.taxaEntrega || 0) > 0 && (
                                            <>
                                                <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.2rem' }}>
                                                    Subtotal: R$ {subtotal.toFixed(2).replace('.', ',')}
                                                </p>
                                                <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.35rem' }}>
                                                    Taxa de Entrega: R$ {(p.taxaEntrega || 0).toFixed(2).replace('.', ',')}
                                                </p>
                                            </>
                                        )}
                                        <p style={{ fontSize: '1rem', fontWeight: 800, color: '#DC2626' }}>
                                            Total: R$ {valorTotal.toFixed(2).replace('.', ',')}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PedidosStatus;
