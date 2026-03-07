import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles';
import { API_BASE_URL } from '../config';
import StyledButton from './StyledButton';
import { PlusIcon, EditIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from './Icons';

const ItemManager = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [movingItemId, setMovingItemId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    // 1. ATUALIZADO PARA USAR A NOVA ROTA DE ADMIN E SER MAIS EFICIENTE
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Busca as categorias para passar ao modal
            const catResponse = await fetch(`${API_BASE_URL}/categorias`);
            if (!catResponse.ok) throw new Error('Falha ao buscar categorias.');
            setCategories(await catResponse.json());
            
            // Busca TODOS os itens (incluindo os indisponíveis) pela nova rota de admin
            const itemsResponse = await fetch(`${API_BASE_URL}/admin/items`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!itemsResponse.ok) throw new Error('Falha ao buscar os itens.');
            setItems(await itemsResponse.json());

            setError('');
        } catch (err) { 
            setError(err.message); 
        } finally { 
            setIsLoading(false); 
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenForm = (item = null) => {
        navigate('/admin/item-form', { state: { item, categories } });
    };

    const handleDelete = async (itemId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/item/${itemId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao excluir o item.');
            setConfirmDeleteId(null);
            fetchData();
        } catch (err) { setError(err.message); }
    };

    // 2. NOVA FUNÇÃO PARA ALTERNAR A DISPONIBILIDADE DO ITEM
    const handleToggleAvailability = async (item) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/item/${item.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...item, disponivel: !item.disponivel })
            });
            if (!response.ok) throw new Error('Falha ao atualizar o status.');
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleTogglePromo = async (item) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/item/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...item, promocaoAtiva: !item.promocaoAtiva }),
            });
            if (!response.ok) throw new Error('Falha ao atualizar promoção.');
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    // 3. NOVA FUNÇÃO PARA MOVER ITENS (UP/DOWN)
    const handleMoveItem = async (itemId, direction) => {
        setMovingItemId(itemId);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/item/${itemId}/move`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ direction })
            });

            if (!response.ok) {
                throw new Error(`Falha ao reordenar o item. Status: ${response.status}`);
            }

            await fetchData();
        } catch (err) {
            setError(err.message);
        } finally {
            setMovingItemId(null);
        }
    };

    // 4. AGRUPA ITENS POR CATEGORIA
    const groupedItems = items.reduce((acc, item) => {
        // Tenta ambos os formatos: categoria_id (snake_case) ou categoriaId (camelCase)
        const categoryId = item.categoria_id || item.categoriaId;
        if (!acc[categoryId]) {
            acc[categoryId] = [];
        }
        acc[categoryId].push(item);
        return acc;
    }, {});

    return (
        <div style={styles.card}>
            <div style={{...styles.input, padding: '1.5rem', border: 'none', height: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3 style={{fontSize: '1.125rem', fontWeight: 500, color: 'black'}}>Itens do Cardápio</h3>
                <StyledButton onClick={() => handleOpenForm()}><PlusIcon style={{width:'1rem', height:'1rem', marginRight: '0.5rem'}}/>Adicionar Item</StyledButton>
            </div>
            <div style={{borderTop: '1px solid #E5E7EB', overflowX: 'auto'}}>
                {isLoading ? <p style={{padding: '1.5rem'}}>Carregando...</p> : error ? <p style={{padding: '1.5rem', color: 'red'}}>{error}</p> : (
                    <div>
                        {Object.entries(groupedItems).map(([categoryId, categoryItems]) => {
                            const category = categories.find(c => c.id === parseInt(categoryId));
                            return (
                                <div key={categoryId} style={{marginBottom: '2rem'}}>
                                    <div style={{
                                        backgroundColor: '#F9FAFB',
                                        padding: '0.75rem 1.5rem',
                                        borderBottom: '2px solid #E5E7EB',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        color: '#374151',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {category?.nome || 'Sem categoria'}
                                    </div>
                                    <table style={styles.table}>
                                        <thead style={styles.tableHead}>
                                            <tr>
                                                <th style={{...styles.tableHeadCell, width: '80px'}}>Ordem</th>
                                                <th style={styles.tableHeadCell}>Nome</th>
                                                <th style={styles.tableHeadCell}>Preço</th>
                                                <th style={styles.tableHeadCell}>Status</th>
                                                <th style={styles.tableHeadCell}>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categoryItems.map((item, index) => (
                                                <tr key={item.id} style={styles.tableBodyRow}>
                                                    <td style={styles.tableBodyCell}>
                                                        <div style={{display: 'flex', gap: '0.25rem', alignItems: 'center'}}>
                                                            <StyledButton
                                                                variant="ghost"
                                                                onClick={() => handleMoveItem(item.id, 'up')}
                                                                disabled={index === 0 || movingItemId === item.id}
                                                                title="Mover para cima"
                                                                style={{
                                                                    padding: '0.25rem',
                                                                    opacity: index === 0 || movingItemId === item.id ? 0.3 : 1,
                                                                    cursor: index === 0 || movingItemId === item.id ? 'not-allowed' : 'pointer'
                                                                }}
                                                            >
                                                                <ChevronUpIcon style={{width: '1.25rem', height: '1.25rem', color: '#4B5563'}}/>
                                                            </StyledButton>
                                                            <StyledButton
                                                                variant="ghost"
                                                                onClick={() => handleMoveItem(item.id, 'down')}
                                                                disabled={index === categoryItems.length - 1 || movingItemId === item.id}
                                                                title="Mover para baixo"
                                                                style={{
                                                                    padding: '0.25rem',
                                                                    opacity: index === categoryItems.length - 1 || movingItemId === item.id ? 0.3 : 1,
                                                                    cursor: index === categoryItems.length - 1 || movingItemId === item.id ? 'not-allowed' : 'pointer'
                                                                }}
                                                            >
                                                                <ChevronDownIcon style={{width: '1.25rem', height: '1.25rem', color: '#4B5563'}}/>
                                                            </StyledButton>
                                                        </div>
                                                    </td>
                                                    <td style={{...styles.tableBodyCell, fontWeight: 500, color: '#111827'}}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                            {item.nome}
                                                            {item.promocaoAtiva && item.descontoPercent && (
                                                                <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '0.65rem', fontWeight: 800, padding: '0.1rem 0.45rem', borderRadius: '9999px', letterSpacing: '0.04em' }}>
                                                                    -{item.descontoPercent}%
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={styles.tableBodyCell}>
                                                        {item.promocaoAtiva && item.descontoPercent ? (
                                                            <div>
                                                                <span style={{ textDecoration: 'line-through', color: '#9CA3AF', fontSize: '0.75rem' }}>R$ {item.preco.toFixed(2)}</span>
                                                                <span style={{ display: 'block', fontWeight: 700, color: '#16A34A' }}>R$ {(item.preco * (1 - item.descontoPercent / 100)).toFixed(2)}</span>
                                                            </div>
                                                        ) : (
                                                            `R$ ${item.preco.toFixed(2)}`
                                                        )}
                                                    </td>
                                                    <td style={styles.tableBodyCell}>
                                                        <span style={{
                                                            backgroundColor: item.disponivel ? '#D1FAE5' : '#FEE2E2',
                                                            color: item.disponivel ? '#065F46' : '#991B1B',
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '9999px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 500,
                                                        }}>
                                                            {item.disponivel ? 'Disponível' : 'Indisponível'}
                                                        </span>
                                                    </td>
                                                    <td style={styles.tableBodyCell}>
                                                        {confirmDeleteId === item.id ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                <span style={{ fontSize: '0.78rem', color: '#DC2626', fontWeight: 600 }}>Excluir?</span>
                                                                <button onClick={() => handleDelete(item.id)} style={{ padding: '0.3rem 0.6rem', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '0.35rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Sim</button>
                                                                <button onClick={() => setConfirmDeleteId(null)} style={{ padding: '0.3rem 0.6rem', backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '0.35rem', cursor: 'pointer', fontSize: '0.78rem' }}>Não</button>
                                                            </div>
                                                        ) : (
                                                            <div style={{display: 'flex', gap: '0.25rem', flexWrap: 'wrap'}}>
                                                                <StyledButton
                                                                    variant="secondary"
                                                                    onClick={() => handleToggleAvailability(item)}
                                                                    title={item.disponivel ? 'Pausar item' : 'Ativar item'}
                                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                                                                >
                                                                    {item.disponivel ? 'Pausar' : 'Ativar'}
                                                                </StyledButton>
                                                                {item.descontoPercent && (
                                                                    <StyledButton
                                                                        variant="secondary"
                                                                        onClick={() => handleTogglePromo(item)}
                                                                        title={item.promocaoAtiva ? 'Desativar promoção' : 'Ativar promoção'}
                                                                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', backgroundColor: item.promocaoAtiva ? '#DCFCE7' : undefined, color: item.promocaoAtiva ? '#16A34A' : undefined }}
                                                                    >
                                                                        {item.promocaoAtiva ? 'Promo ON' : 'Promo OFF'}
                                                                    </StyledButton>
                                                                )}
                                                                <StyledButton variant="ghost" onClick={() => handleOpenForm(item)} title="Editar item"><EditIcon style={{color: '#777777ff', width: '1.25rem', height: '1.25rem'}}/></StyledButton>
                                                                <StyledButton variant="ghost" onClick={() => setConfirmDeleteId(item.id)} title="Excluir item" style={{color: '#DC2626'}}><TrashIcon style={{width: '1.25rem', height: '1.25rem'}}/></StyledButton>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItemManager;