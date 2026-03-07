import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useSchedule } from '../contexts/ScheduleContext';
import { XIcon, ShoppingCartIcon, PlusIcon, MinusIcon } from './Icons';
import StyledButton from './StyledButton';

const CartSidebar = () => {
    const navigate = useNavigate();
    const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, cartTotal, clearCart } = useCart();
    const { isOpen } = useSchedule();

    if (!isCartOpen) return null;

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/checkout', { state: { cartItems, total: cartTotal } });
    };

    return (
        <>
            {/* Overlay */}
            <div
                style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)', zIndex: 50 }}
                onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    height: '100%',
                    width: '100%',
                    maxWidth: '400px',
                    backgroundColor: '#FFFBFB',
                    zIndex: 51,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '-4px 0 24px rgba(220, 38, 38, 0.12)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <ShoppingCartIcon style={{ width: '1.35rem', height: '1.35rem', color: 'white' }} />
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0 }}>
                            Seu Carrinho
                        </h2>
                        {cartItems.length > 0 && (
                            <span style={{
                                backgroundColor: 'rgba(255,255,255,0.25)',
                                color: 'white',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '9999px',
                            }}>
                                {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: '1.5px solid rgba(255,255,255,0.3)',
                            borderRadius: '50%',
                            width: '2rem',
                            height: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    >
                        <XIcon style={{ width: '1rem', height: '1rem', color: 'white' }} />
                    </button>
                </div>

                {/* Empty state */}
                {cartItems.length === 0 ? (
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '2rem' }}>
                        <div style={{
                            width: '5rem', height: '5rem',
                            backgroundColor: '#FEE2E2',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <ShoppingCartIcon style={{ width: '2.25rem', height: '2.25rem', color: '#FCA5A5' }} />
                        </div>
                        <p style={{ fontWeight: 700, color: '#1F2937', fontSize: '1rem' }}>Carrinho vazio</p>
                        <p style={{ color: '#9CA3AF', fontSize: '0.875rem', textAlign: 'center' }}>
                            Adicione itens do cardápio para começar seu pedido.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Items list */}
                        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem' }}>
                            {cartItems.map(item => {
                                const itemTotal = item.preco + (item.precoBorda || 0);
                                return (
                                    <div
                                        key={item.cartId}
                                        style={{
                                            backgroundColor: 'white',
                                            border: '1.5px solid #FEE2E2',
                                            borderRadius: '0.75rem',
                                            padding: '0.875rem',
                                            marginBottom: '0.6rem',
                                            display: 'flex',
                                            gap: '0.75rem',
                                            alignItems: 'flex-start',
                                        }}
                                    >
                                        <div style={{ flexGrow: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F2937', lineHeight: 1.3 }}>
                                                {item.nome}
                                            </p>
                                            {item.isCustomPizza && (
                                                <div style={{ marginTop: '0.3rem' }}>
                                                    <p style={{ fontSize: '0.73rem', color: '#6B7280', lineHeight: 1.4 }}>
                                                        {item.tamanho} · {item.sabores.map(s => s.nome).join(' / ')}
                                                    </p>
                                                    {item.tipoMassa && (
                                                        <p style={{ fontSize: '0.7rem', color: '#DC2626', fontWeight: 600, marginTop: '0.1rem' }}>
                                                            Massa: {item.tipoMassa.nome}
                                                        </p>
                                                    )}
                                                    {item.borda && (
                                                        <p style={{ fontSize: '0.7rem', color: '#DC2626', fontWeight: 600, marginTop: '0.1rem' }}>
                                                            Borda: {item.borda.nome}
                                                            {item.precoBorda > 0 && ` (+R$ ${item.precoBorda.toFixed(2)})`}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                            <p style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '0.3rem' }}>
                                                R$ {itemTotal.toFixed(2)} / un.
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                                            <p style={{ fontWeight: 800, fontSize: '0.95rem', color: '#DC2626' }}>
                                                R$ {(itemTotal * item.quantidade).toFixed(2)}
                                            </p>
                                            {/* Quantity controls */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                border: '1.5px solid #FEE2E2',
                                                borderRadius: '0.5rem',
                                                overflow: 'hidden',
                                                backgroundColor: '#FEF2F2',
                                            }}>
                                                <button
                                                    onClick={() => updateQuantity(item.cartId, item.quantidade - 1)}
                                                    style={{
                                                        width: '2rem', height: '2rem',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: '#DC2626',
                                                        transition: 'background 0.15s',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <MinusIcon style={{ width: '0.8rem', height: '0.8rem' }} />
                                                </button>
                                                <span style={{
                                                    width: '1.75rem',
                                                    textAlign: 'center',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 800,
                                                    color: '#1F2937',
                                                    borderLeft: '1px solid #FEE2E2',
                                                    borderRight: '1px solid #FEE2E2',
                                                    lineHeight: '2rem',
                                                }}>
                                                    {item.quantidade}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.cartId, item.quantidade + 1)}
                                                    style={{
                                                        width: '2rem', height: '2rem',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: '#DC2626',
                                                        transition: 'background 0.15s',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <PlusIcon style={{ width: '0.8rem', height: '0.8rem' }} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '1rem 1.25rem',
                            borderTop: '2px solid #FEE2E2',
                            backgroundColor: 'white',
                            flexShrink: 0,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                                <p style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 500 }}>
                                    Subtotal ({cartItems.reduce((s, i) => s + i.quantidade, 0)} itens)
                                </p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#DC2626', lineHeight: 1 }}>
                                    R$ {cartTotal.toFixed(2)}
                                </p>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.875rem' }}>
                                Taxa de entrega calculada na finalização
                            </p>
                            <StyledButton
                                onClick={handleCheckout}
                                disabled={!isOpen}
                                title={!isOpen ? 'Loja fechada' : ''}
                                style={{ width: '100%', padding: '0.875rem', fontSize: '0.95rem', fontWeight: 700 }}
                            >
                                {isOpen ? 'Finalizar Pedido' : 'Loja Fechada'}
                            </StyledButton>
                            <button
                                onClick={() => { setIsCartOpen(false); navigate('/'); }}
                                style={{
                                    width: '100%',
                                    marginTop: '0.5rem',
                                    padding: '0.6rem',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    color: '#DC2626',
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '3px',
                                }}
                            >
                                Continuar Comprando
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default CartSidebar;
