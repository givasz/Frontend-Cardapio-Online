import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const statusInfo = {
    1: { texto: "Em Análise", cor: "#d4652f", emoji: "🧐" },
    2: { texto: "Na Fila", cor: "#e8a234", emoji: "🧑‍🍳" },
    3: { texto: "Pronto para Entrega", cor: "#5ab44f", emoji: "📦" },
    4: { texto: "Finalizado / Entregue", cor: "#4B5563", emoji: "✅" },
    5: { texto: "Cancelado", cor: "#DC2626", emoji: "❌" } 
};

const styles = {
    container: {
        maxWidth: '700px',
        margin: '2rem auto',
        padding: '2rem',
        fontFamily: 'sans-serif',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        color: 'black'
    },
    greeting: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #eee',
        paddingBottom: '1.5rem'
    },
    input: {
        width: '100%',
        padding: '12px',
        fontSize: '1rem',
        marginBottom: '1rem',
        border: '1px solid #ddd',
        borderRadius: '4px'
    },
    button: {
        width: '100%',
        padding: '12px',
        fontSize: '1rem',
        backgroundColor: '#d4652f',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    pedidoCard: {
        backgroundColor: 'white',
        borderLeft: '5px solid #ccc',
        borderRadius: '4px',
        padding: '1rem 1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    statusTag: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '0.9rem',
    }
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
            if (!response.ok) {
                throw new Error(data.message || 'Falha ao buscar pedidos.');
            }
            setPedidos(data);
            if (data.length > 0) {
                setNomeCliente(data[0].nomeCliente);
            }
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
            const intervalId = setInterval(() => {
                buscarPedidosPorTelefone(telefone);
            }, 60000);
            return () => clearInterval(intervalId);
        }
    }, [telefone, pedidos.length, buscarPedidosPorTelefone]);

    const formatarData = (dataString) => {
        const opcoes = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dataString).toLocaleDateString('pt-BR', opcoes);
    };

    return (
        <div style={styles.container}>
            <button
                onClick={() => navigate('/')}
                style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    backgroundColor: 'transparent',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginBottom: '1rem'
                }}
            >
                ← Voltar
            </button>

            <div style={{ position: 'relative' }}>
                {nomeCliente ? (
                    <h2 style={styles.greeting}>Olá, {nomeCliente}!</h2>
                ) : (
                    <h2>Acompanhe seu Pedido</h2>
                )}

                <p>Digite o número de telefone usado no pedido para ver o status.</p>

                <form onSubmit={handleFormSubmit}>
                    <input
                        type="tel"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        placeholder="Ex: 38999998888"
                        style={styles.input}
                        required
                    />
                    <button type="submit" style={styles.button} disabled={isLoading}>
                        {isLoading ? 'Buscando...' : 'Buscar Pedidos'}
                    </button>
                </form>

            {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>{error}</p>}

            {pedidos.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <h3>Seus pedidos recentes:</h3>
                    {pedidos.map(p => {
                        const subtotal = p.itens.reduce((total, itemPedido) => {
                            const precoDoItem = itemPedido.precoFinal ?? itemPedido.item?.preco ?? 0;
                            const precoBordaDoItem = itemPedido.precoBorda ?? 0;
                            return total + ((precoDoItem + precoBordaDoItem) * itemPedido.quantidade);
                        }, 0);

                        const valorTotal = subtotal + (p.taxaEntrega || 0);
                        const statusAtual = statusInfo[p.status] || { texto: 'Desconhecido', cor: '#ccc', emoji: '❓' };

                        return (
                            <div 
                                key={p.id}
                                style={{ ...styles.pedidoCard, borderLeftColor: statusAtual.cor }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div>
                                        <strong>Pedido #{p.id}</strong>
                                        <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.9rem' }}>{formatarData(p.criadoEm)}</p>
                                    </div>
                                    <div style={{...styles.statusTag, backgroundColor: statusAtual.cor}}>
                                        {statusAtual.emoji} {statusAtual.texto}
                                    </div>
                                </div>
                                
                                <div>
                                    <strong>Itens:</strong>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0', color: '#555' }}>
                                        {p.itens.map(itemPedido => {
                                            const precoItem = itemPedido.precoFinal ?? itemPedido.item?.preco ?? 0;
                                            const precoBordaItem = itemPedido.precoBorda ?? 0;
                                            const precoTotalItem = precoItem + precoBordaItem;

                                            return (
                                                <li key={itemPedido.id} style={{ marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #eee' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                        <span>
                                                            {itemPedido.quantidade}x {itemPedido.item?.nome || 'Item não encontrado'}
                                                            {itemPedido.tamanho && <strong style={{color: '#EA580C'}}> ({itemPedido.tamanho})</strong>}
                                                        </span>
                                                        <span style={{ fontWeight: 600 }}>
                                                            R$ {precoTotalItem.toFixed(2).replace('.', ',')}
                                                        </span>
                                                    </div>
                                                    {itemPedido.tipoMassa && (
                                                        <div style={{ fontSize: '0.85rem', color: '#DC2626', fontWeight: 600, marginTop: '0.25rem' }}>
                                                            Massa: {itemPedido.tipoMassa.nome}
                                                        </div>
                                                    )}
                                                    {itemPedido.borda && (
                                                        <div style={{ fontSize: '0.85rem', color: '#DC2626', fontWeight: 600 }}>
                                                            Borda: {itemPedido.borda.nome}
                                                        </div>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                <div style={{ borderTop: '1px solid #eee', marginTop: '1rem', paddingTop: '1rem', textAlign: 'right' }}>
                                    {/* Verifica se a taxa de entrega existe e é maior que zero */}
                                    {(p.taxaEntrega || 0) > 0 && (
                                        <>
                                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>
                                                Subtotal: R$ {subtotal.toFixed(2).replace('.', ',')}
                                            </p>
                                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                                                {/* ✅ CORREÇÃO AQUI: Adicionado '|| 0' para evitar o erro */}
                                                Taxa de Entrega: R$ {(p.taxaEntrega || 0).toFixed(2).replace('.', ',')}
                                            </p>
                                        </>
                                    )}
                                    <strong style={{fontSize: '1.1rem'}}>
                                        Valor Total: R$ {valorTotal.toFixed(2).replace('.', ',')}
                                    </strong>
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