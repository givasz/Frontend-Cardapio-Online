import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useSchedule } from '../contexts/ScheduleContext';
import styles from '../styles';
import { API_BASE_URL } from '../config';
import StyledButton from './StyledButton';

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

    const getPrecoComDesconto = (item) =>
        item.promocaoAtiva && item.descontoPercent
            ? item.preco * (1 - item.descontoPercent / 100)
            : item.preco;

    const handleItemClick = (item) => {
        const pizzaCategory = categories.find(c => c.nome.toLowerCase() === 'pizzas');
        if (item.categoryId === pizzaCategory?.id) {
            navigate('/customize-pizza', { state: { basePizza: item, allFlavors: pizzaItems } });
        } else {
            addToCart({ ...item, preco: getPrecoComDesconto(item) });
        }
    };

    const isPizza = (item) => {
        const pizzaCategory = categories.find(c => c.nome.toLowerCase() === 'pizzas');
        return item.categoryId === pizzaCategory?.id;
    };

    return (
        <>
            {/* Hero section */}
            <div className="menu-hero">
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1F2937', letterSpacing: '-0.04em', marginBottom: '0.4rem' }}>
                    Nosso Cardápio
                </h2>
                <p style={{ color: '#9CA3AF', fontSize: '0.975rem', fontWeight: 400 }}>
                    As melhores pizzas de São João do Paraíso!
                </p>
            </div>

            {/* Loading / Error */}
            {(loading || error) && (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    {loading && (
                        <div>
                            <div className="animate-pulse" style={{ width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: '#FEE2E2', margin: '0 auto 1rem' }} />
                            <p style={{ color: '#9CA3AF', fontWeight: 500 }}>Carregando cardápio...</p>
                        </div>
                    )}
                    {error && (
                        <div style={{ backgroundColor: '#FEF2F2', border: '2px solid #FECACA', borderRadius: '0.75rem', padding: '1.25rem', display: 'inline-block' }}>
                            <p style={{ color: '#DC2626', fontWeight: 600 }}>{error}</p>
                        </div>
                    )}
                </div>
            )}

            {!loading && !error && (
                <>
                    {/* Category tabs */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginBottom: '2rem', flexWrap: 'wrap', padding: '0 1rem' }}>
                        {categories.map(cat => (
                            <StyledButton
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                variant={selectedCategory === cat.id ? 'primary' : 'secondary'}
                                style={{ borderRadius: '9999px', padding: '0.45rem 1.1rem', fontSize: '0.875rem' }}
                            >
                                {cat.nome}
                            </StyledButton>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="menu-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: '1.25rem',
                        paddingBottom: '3rem',
                    }}>
                        {filteredItems.map(item => (
                            <div
                                key={item.id}
                                className={`menu-card${!isOpen ? ' closed' : ''}`}
                                style={{
                                    ...styles.card,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                }}
                                onClick={() => isOpen && handleItemClick(item)}
                            >
                                {/* Image */}
                                <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1/1', backgroundColor: '#F3F4F6' }}>
                                    <img
                                        src={item.imagemUrl || PLACEHOLDER_IMAGE}
                                        alt={item.nome}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            objectPosition: 'center',
                                            display: 'block',
                                        }}
                                    />
                                    {isPizza(item) && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '0.6rem',
                                            left: '0.6rem',
                                            backgroundColor: '#DC2626',
                                            color: 'white',
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            letterSpacing: '0.06em',
                                            textTransform: 'uppercase',
                                            padding: '0.25rem 0.55rem',
                                            borderRadius: '9999px',
                                        }}>
                                            Pizza
                                        </span>
                                    )}
                                                    {item.promocaoAtiva && (() => {
                                        const pizzaDiscount = item.descontoPPercent || item.descontoMPercent || item.descontoGPercent || item.descontoGGPercent;
                                        const discount = isPizza(item) ? pizzaDiscount : item.descontoPercent;
                                        if (!discount) return null;
                                        return (
                                            <span style={{
                                                position: 'absolute',
                                                top: '0.6rem',
                                                right: '0.6rem',
                                                backgroundColor: '#16A34A',
                                                color: 'white',
                                                fontSize: '0.7rem',
                                                fontWeight: 800,
                                                letterSpacing: '0.04em',
                                                padding: '0.25rem 0.55rem',
                                                borderRadius: '9999px',
                                            }}>
                                                {isPizza(item) ? 'PROMO' : `-${discount}%`}
                                            </span>
                                        );
                                    })()}
                                    {!isOpen && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            backgroundColor: 'rgba(0,0,0,0.25)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <span style={{
                                                backgroundColor: 'rgba(0,0,0,0.7)',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                padding: '0.35rem 0.8rem',
                                                borderRadius: '9999px',
                                                letterSpacing: '0.05em',
                                            }}>
                                                Loja Fechada
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Body */}
                                <div style={{ flexGrow: 1, padding: '1.1rem 1.25rem 0.75rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.35rem', lineHeight: 1.3 }}>
                                        {item.nome}
                                    </h3>
                                    <p style={{ color: '#6B7280', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                        {item.descricao}
                                    </p>
                                </div>

                                {/* Footer */}
                                <div className="menu-card-footer" style={{
                                    padding: '0.75rem 1.25rem 1.1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderTop: '1.5px solid #FEF2F2',
                                    marginTop: '0.75rem',
                                }}>
                                    <div>
                                        {isPizza(item) && !(item.promocaoAtiva && (item.descontoPPercent || item.descontoMPercent || item.descontoGPercent || item.descontoGGPercent)) && (
                                            <p style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>
                                                A partir de
                                            </p>
                                        )}
                                        {(() => {
                                            const pizzaDiscount = item.descontoPPercent || item.descontoMPercent || item.descontoGPercent || item.descontoGGPercent;
                                            const activeDiscount = isPizza(item)
                                                ? (item.promocaoAtiva ? pizzaDiscount : null)
                                                : (item.promocaoAtiva ? item.descontoPercent : null);
                                            if (activeDiscount) {
                                                return (
                                                    <div>
                                                        <p style={{ fontSize: '0.8rem', color: '#9CA3AF', textDecoration: 'line-through', lineHeight: 1, marginBottom: '0.15rem' }}>
                                                            R$ {item.preco.toFixed(2)}
                                                        </p>
                                                        <p style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16A34A', lineHeight: 1 }}>
                                                            R$ {(item.preco * (1 - activeDiscount / 100)).toFixed(2)}
                                                        </p>
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <p style={{ fontSize: '1.35rem', fontWeight: 800, color: '#DC2626', lineHeight: 1 }}>
                                                        R$ {item.preco.toFixed(2)}
                                                    </p>
                                                );
                                            }
                                        })()}
                                    </div>
                                    <StyledButton
                                        disabled={!isOpen}
                                        title={!isOpen ? 'Loja fechada' : ''}
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '9999px' }}
                                    >
                                        {isPizza(item) ? 'Montar' : 'Adicionar'}
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
