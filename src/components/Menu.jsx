import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useSchedule } from '../contexts/ScheduleContext';
import styles from '../styles';
import { API_BASE_URL } from '../config';
import StyledButton from './StyledButton';

// ✅ IMAGEM PADRÃO DEFINIDA LOCALMENTE (COMO SUGERIDO PELO SEU AMIGO)
const PLACEHOLDER_IMAGE = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgMTUwIDEwMCI+CiAgICA8cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPgogICAgPHBhdGggZD0iTTMwIDgwIEw1MCA0MCBMNzAgNjAgTDEwMCAzMCBMMTMwIDcwIEwxNTAgNTAgTDE1MCAxMDAgTDAgMTAwIFoiIGZpbGw9IiNjY2MiLz4KICAgIDxjaXJjbGUgY3g9IjY1IiBjeT0iMzUiIHI9IjEwIiBmaWxsPSIjY2NjIi8+CiAgICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJjZW50cmFsIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZmlsbD0iI2FhYSI+Tk8gSU1BR0U8L3RleHQ+Cjwvc3ZnPg==";


const Menu = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isOpen } = useSchedule();
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const catResponse = await fetch(`${API_BASE_URL}/categorias`);
            if (!catResponse.ok) throw new Error('Falha ao conectar com o servidor. Verifique se o backend está rodando.');
            
            const catData = await catResponse.json();
            setCategories(catData);

            if (catData.length > 0) {
                const itemsPromises = catData.map(cat => fetch(`${API_BASE_URL}/categorias/${cat.id}/itens`).then(res => res.ok ? res.json() : []));
                const allItemsArrays = await Promise.all(itemsPromises);
                const allItemsWithCatId = allItemsArrays.reduce((acc, items, index) => {
                    const categoryId = catData[index].id;
                    return [...acc, ...items.map(item => ({...item, categoryId}))];
                }, []);
                
                setItems(allItemsWithCatId);
                setSelectedCategory(catData[0].id);
            }
        } catch (e) { 
            setError(e.message); 
        } finally { 
            setLoading(false); 
        }
    }, []);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    const filteredItems = useMemo(() => {
        if (!selectedCategory) return [];
        return items.filter(item => item.categoryId === selectedCategory);
    }, [selectedCategory, items]);

    const pizzaItems = useMemo(() => {
        const pizzaCategory = categories.find(c => c.nome.toLowerCase() === 'pizzas');
        if (!pizzaCategory) return [];
        return items.filter(item => item.categoryId === pizzaCategory.id);
    }, [categories, items]);

    const handleItemClick = (item) => {
        const pizzaCategory = categories.find(c => c.nome.toLowerCase() === 'pizzas');
        if (item.categoryId === pizzaCategory?.id) {
            navigate('/customize-pizza', { state: { basePizza: item, allFlavors: pizzaItems } });
        } else {
            addToCart(item);
        }
    };

    return (
        <>
            <div style={{ marginBottom: '2rem', textAlign: 'center', paddingTop: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Nosso Cardápio</h2>
                <p style={{ color: '#6B7280', marginTop: '0.5rem' }}>As melhores pizzas da região, feitas no brasa!</p>
            </div>

            {(loading || error) && (
                <div style={{textAlign: 'center', padding: '2rem'}}>
                    {loading && <p>Carregando cardápio...</p>}
                    {error && <p style={{color: 'red', fontWeight: 500}}>{error}</p>}
                </div>
            )}
            
            {!loading && !error && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                        {categories.map(cat => (
                            <StyledButton key={cat.id} onClick={() => setSelectedCategory(cat.id)} variant={selectedCategory === cat.id ? 'primary' : 'secondary'}>
                                {cat.nome}
                            </StyledButton>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', paddingBottom: '2rem' }}>
                        {filteredItems.map(item => (
                            <div key={item.id} style={{ ...styles.card, display: 'flex', flexDirection: 'column', cursor: isOpen ? 'pointer' : 'default' }} onClick={() => isOpen && handleItemClick(item)}>
                                <img 
                                    src={item.imagemUrl || PLACEHOLDER_IMAGE} // ✅ LÓGICA ATUALIZADA
                                    alt={item.nome}
                                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '0.75rem 0.75rem 0 0', background: '#eee' }}
                                />
                                <div style={{ flexGrow: 1, padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{item.nome}</h3>
                                    <p style={{ color: '#4B5563', marginBottom: '1rem', flexGrow: 1 }}>{item.descricao}</p>
                                </div>
                                <div style={{ padding: '1.5rem', paddingTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#EA580C' }}>
                                        {categories.find(c => c.id === item.categoryId)?.nome.toLowerCase() === 'pizzas' ? 'A partir de ' : ''}
                                        R$ {item.preco.toFixed(2)}
                                    </p>
                                    <StyledButton disabled={!isOpen} title={!isOpen ? 'Loja fechada' : ''}>
                                        {categories.find(c => c.id === item.categoryId)?.nome.toLowerCase() === 'pizzas' ? 'Montar' : 'Adicionar'}
                                    </StyledButton>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </>
    );
};

export default Menu;