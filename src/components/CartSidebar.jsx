import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useSchedule } from '../contexts/ScheduleContext';
import styles from '../styles';
import { XIcon, ShoppingCartIcon, PlusIcon, MinusIcon } from './Icons';
import StyledButton from './StyledButton';

const CartSidebar = () => {
    const navigate = useNavigate();
    const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, cartTotal, clearCart } = useCart();
    const { isOpen } = useSchedule();

    if (!isCartOpen) return null;

    const handleCheckout = () => {
        console.log('Checkout clicked!', { cartItems, total: cartTotal });
        setIsCartOpen(false);
        navigate('/checkout', { state: { cartItems, total: cartTotal } });
    };

    return (
        <>
            <div style={{...styles.modalOverlay, zIndex: 50}} onClick={() => setIsCartOpen(false)}></div>
            <div style={{ color: 'black', position: 'fixed', top: 0, right: 0, height: '100%', width: '100%', maxWidth: '384px', backgroundColor: 'white', zIndex: 51, display: 'flex', flexDirection: 'column', boxShadow: '-2px 0 8px rgba(0,0,0,0.1)' }} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Seu Carrinho</h2>
                    <StyledButton onClick={() => setIsCartOpen(false)} style={{padding: '0.25rem'}}><XIcon /></StyledButton>
                </div>
                {cartItems.length === 0 ? (
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                        <ShoppingCartIcon style={{ width: '4rem', height: '4rem', marginBottom: '1rem' }} />
                        <p>Seu carrinho está vazio.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem' }}>
                            {cartItems.map(item => {
                                const itemTotal = item.preco + (item.precoBorda || 0);
                                return (
                                    <div key={item.cartId} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ flexGrow: 1 }}>
                                            <p style={{ fontWeight: 600 }}>{item.nome}</p>
                                            {item.isCustomPizza && (
                                                <>
                                                    <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                                        ({item.tamanho}, {item.sabores.map(s => s.nome).join(' / ')})
                                                    </p>
                                                    {item.tipoMassa && (
                                                        <p style={{ fontSize: '0.7rem', color: '#DC2626', fontWeight: 600 }}>
                                                            Massa: {item.tipoMassa.nome}
                                                        </p>
                                                    )}
                                                    {item.borda && (
                                                        <p style={{ fontSize: '0.7rem', color: '#DC2626', fontWeight: 600 }}>
                                                            Borda: {item.borda.nome} {item.precoBorda && `(+R$ ${item.precoBorda.toFixed(2)})`}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                            <p style={{ fontSize: '0.875rem', color: '#4B5563' }}>
                                                R$ {item.preco.toFixed(2)}
                                                {item.precoBorda && item.precoBorda > 0 && (
                                                    <span style={{ color: '#DC2626', fontWeight: 600 }}> + R$ {item.precoBorda.toFixed(2)}</span>
                                                )}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D1D5DB', borderRadius: '0.375rem' }}>
                                            <StyledButton onClick={() => updateQuantity(item.cartId, item.quantidade - 1)} style={{ padding: '0.5rem' }}><MinusIcon style={{width: '1rem', height: '1rem'}}/></StyledButton>
                                            <span style={{ width: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>{item.quantidade}</span>
                                            <StyledButton onClick={() => updateQuantity(item.cartId, item.quantidade + 1)} style={{ padding: '0.5rem' }}><PlusIcon style={{width: '1rem', height: '1rem'}}/></StyledButton>
                                        </div>
                                        <span style={{ fontWeight: 600, width: '5rem', textAlign: 'right' }}>R$ {(itemTotal * item.quantidade).toFixed(2)}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ padding: '1rem', borderTop: '1px solid #E5E7EB' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '1rem' }}>
                                <span>Total:</span>
                                <span>R$ {cartTotal.toFixed(2)}</span>
                            </div>
                            <StyledButton onClick={handleCheckout} disabled={!isOpen} title={!isOpen ? 'Loja fechada' : ''} style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}>Finalizar Pedido</StyledButton>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default CartSidebar;
