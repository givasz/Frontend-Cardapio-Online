// Arquivo: Frontend-Cardapio-Online/src/components/PedidoHistorico.jsx

import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';
import styles from '../styles';
import { ChevronDownIcon, ChevronUpIcon } from './Icons'; // Supondo que você tenha ícones de seta

const PAGE_SIZE = 15;

const PedidoHistorico = () => {
    const { token } = useAuth();
    const [pedidos, setPedidos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [confirmLimpar, setConfirmLimpar] = useState(false);
    const [isLimpando, setIsLimpando] = useState(false);

    const fetchHistorico = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/pedidos/historico`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao buscar o histórico.');
            const data = await response.json();
            setPedidos(data);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchHistorico();
    }, [fetchHistorico]);

    const handleLimparHistorico = async () => {
        setIsLimpando(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/pedidos/historico`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao limpar o histórico.');
            setPedidos([]);
            setConfirmLimpar(false);
            setCurrentPage(1);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLimpando(false);
        }
    };

    const formatarData = (dataString) => {
        return new Date(dataString).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const handleToggleRow = (pedidoId) => {
        setExpandedRowId(currentId => (currentId === pedidoId ? null : pedidoId));
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
        setExpandedRowId(null);
    };

    const filteredPedidos = searchQuery.trim()
        ? pedidos.filter(p => p.telefone && p.telefone.replace(/\D/g, '').includes(searchQuery.trim().replace(/\D/g, '')))
        : pedidos;

    const totalPages = Math.ceil(filteredPedidos.length / PAGE_SIZE);
    const paginatedPedidos = filteredPedidos.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <div style={styles.card}>
            {/* Header */}
            <div style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 500, margin: 0 }}>
                    Histórico de Pedidos Finalizados
                    {pedidos.length > 0 && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#6B7280', fontWeight: 400 }}>
                            ({filteredPedidos.length}{searchQuery ? ` de ${pedidos.length}` : ''} pedidos)
                        </span>
                    )}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Busca por número */}
                    <input
                        type="tel"
                        placeholder="Buscar por telefone"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        style={{
                            ...styles.input,
                            height: 'auto',
                            padding: '0.4rem 0.75rem',
                            width: '200px',
                            fontSize: '0.875rem',
                        }}
                    />
                    {/* Limpar histórico */}
                    {confirmLimpar ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.78rem', color: '#DC2626', fontWeight: 600 }}>Limpar tudo?</span>
                            <button
                                onClick={handleLimparHistorico}
                                disabled={isLimpando}
                                style={{ padding: '0.3rem 0.6rem', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '0.35rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                            >
                                {isLimpando ? 'Limpando...' : 'Sim'}
                            </button>
                            <button
                                onClick={() => setConfirmLimpar(false)}
                                style={{ padding: '0.3rem 0.6rem', backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '0.35rem', cursor: 'pointer', fontSize: '0.78rem' }}
                            >
                                Não
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmLimpar(true)}
                            disabled={pedidos.length === 0}
                            style={{
                                padding: '0.4rem 0.85rem',
                                backgroundColor: pedidos.length === 0 ? '#F3F4F6' : '#FEE2E2',
                                color: pedidos.length === 0 ? '#9CA3AF' : '#DC2626',
                                border: '1px solid',
                                borderColor: pedidos.length === 0 ? '#E5E7EB' : '#FECACA',
                                borderRadius: '0.375rem',
                                cursor: pedidos.length === 0 ? 'not-allowed' : 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                            }}
                        >
                            Limpar histórico
                        </button>
                    )}
                </div>
            </div>

            <div style={{ borderTop: '1px solid #E5E7EB', overflowX: 'auto' }}>
                {isLoading && <p style={{ padding: '1.5rem' }}>Carregando histórico...</p>}
                {error && <p style={{ padding: '1.5rem', color: 'red' }}>{error}</p>}
                {!isLoading && !error && (
                    <>
                        {filteredPedidos.length === 0 ? (
                            <p style={{ padding: '1.5rem', color: '#6B7280' }}>
                                {searchQuery ? `Nenhum pedido encontrado para o telefone "${searchQuery}".` : 'Nenhum pedido finalizado encontrado.'}
                            </p>
                        ) : (
                            <table style={styles.table}>
                                <thead style={styles.tableHead}>
                                    <tr>
                                        <th style={{...styles.tableHeadCell, width: '1%'}}></th>
                                        <th style={{...styles.tableHeadCell, width: '5%'}}>#</th>
                                        <th style={styles.tableHeadCell}>Data</th>
                                        <th style={styles.tableHeadCell}>Cliente</th>
                                        <th style={styles.tableHeadCell}>Telefone</th>
                                        <th style={styles.tableHeadCell}>Endereço</th>
                                        <th style={styles.tableHeadCell}>Valor Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedPedidos.map(pedido => {
                                        const subtotal = pedido.itens.reduce((acc, itemPedido) => {
                                            const precoItem = itemPedido.precoFinal ?? itemPedido.item?.preco ?? 0;
                                            return acc + (precoItem * itemPedido.quantidade);
                                        }, 0);
                                        const total = subtotal + (pedido.taxaEntrega || 0);
                                        const isExpanded = expandedRowId === pedido.id;

                                        return (
                                            <Fragment key={pedido.id}>
                                                <tr style={{...styles.tableBodyRow, cursor: 'pointer'}} onClick={() => handleToggleRow(pedido.id)}>
                                                    <td style={styles.tableBodyCell}>
                                                        {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                                    </td>
                                                    <td style={{...styles.tableBodyCell, color: '#6B7280', fontSize: '0.8rem'}}>#{pedido.id}</td>
                                                    <td style={styles.tableBodyCell}>{formatarData(pedido.criadoEm)}</td>
                                                    <td style={{...styles.tableBodyCell, fontWeight: 500}}>{pedido.nomeCliente}</td>
                                                    <td style={styles.tableBodyCell}>{pedido.telefone}</td>
                                                    <td style={styles.tableBodyCell}>{pedido.endereco}</td>
                                                    <td style={styles.tableBodyCell}>R$ {total.toFixed(2).replace('.', ',')}</td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr style={{backgroundColor: '#F9FAFB'}}>
                                                        <td colSpan="7" style={{padding: '1rem 1.5rem'}}>
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                                                <div>
                                                                    <strong style={{display: 'block', marginBottom: '0.5rem'}}>Itens do Pedido:</strong>
                                                                    <ul style={{margin: 0, paddingLeft: '1rem'}}>
                                                                        {pedido.itens.map(itemPedido => (
                                                                            <li key={itemPedido.id}>
                                                                                {itemPedido.quantidade}x {itemPedido.item?.nome || 'Item não encontrado'}
                                                                                {itemPedido.tamanho && ` (${itemPedido.tamanho})`}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                                <div>
                                                                    <strong style={{display: 'block', marginBottom: '0.5rem'}}>Detalhes Financeiros:</strong>
                                                                    <p style={{margin: 0}}>Subtotal: R$ {subtotal.toFixed(2).replace('.', ',')}</p>
                                                                    {pedido.taxaEntrega > 0 && <p style={{margin: 0}}>Taxa de Entrega: R$ {pedido.taxaEntrega.toFixed(2).replace('.', ',')}</p>}
                                                                    <p style={{margin: 0, fontWeight: 'bold'}}>Total: R$ {total.toFixed(2).replace('.', ',')}</p>
                                                                </div>
                                                                {pedido.observacoes && (
                                                                    <div>
                                                                        <strong style={{display: 'block', marginBottom: '0.5rem'}}>Observações:</strong>
                                                                        <p style={{margin: 0, fontStyle: 'italic'}}>{pedido.observacoes}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}

                        {/* Paginação */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem 1.5rem', borderTop: '1px solid #E5E7EB' }}>
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    style={{ padding: '0.35rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', backgroundColor: currentPage === 1 ? '#F9FAFB' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#9CA3AF' : '#374151', fontSize: '0.875rem' }}
                                >
                                    ← Anterior
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                                    .reduce((acc, p, idx, arr) => {
                                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((p, idx) =>
                                        p === '...' ? (
                                            <span key={`ellipsis-${idx}`} style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>…</span>
                                        ) : (
                                            <button
                                                key={p}
                                                onClick={() => setCurrentPage(p)}
                                                style={{ padding: '0.35rem 0.65rem', border: '1px solid', borderColor: currentPage === p ? '#DC2626' : '#D1D5DB', borderRadius: '0.375rem', backgroundColor: currentPage === p ? '#DC2626' : 'white', color: currentPage === p ? 'white' : '#374151', cursor: 'pointer', fontWeight: currentPage === p ? 700 : 400, fontSize: '0.875rem' }}
                                            >
                                                {p}
                                            </button>
                                        )
                                    )
                                }
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{ padding: '0.35rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', backgroundColor: currentPage === totalPages ? '#F9FAFB' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#9CA3AF' : '#374151', fontSize: '0.875rem' }}
                                >
                                    Próxima →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PedidoHistorico;