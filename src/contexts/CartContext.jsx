import React, { useState, createContext, useContext, useMemo } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const addToCart = (item) => {
        setCartItems(prev => {
            // Se for uma pizza customizada, ela recebe um ID único e é sempre adicionada como um novo item.
            if (item.isCustomPizza) {
                return [...prev, { ...item, cartId: `custom-${Date.now()}` }];
            }
            // Itens normais (bebidas, etc.) são agrupados se já existirem.
            const existing = prev.find(i => i.id === item.id && !i.isCustomPizza);
            if (existing) { return prev.map(i => i.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i); }
            return [...prev, { ...item, quantidade: 1, cartId: item.id }];
        });
        setIsCartOpen(true);
    };

    const updateQuantity = (cartId, newQuantity) => {
        setCartItems(prev => {
            if (newQuantity <= 0) { return prev.filter(i => i.cartId !== cartId); }
            return prev.map(i => i.cartId === cartId ? { ...i, quantidade: newQuantity } : i);
        });
    };

    const clearCart = () => {
        setCartItems([]);
        setIsCartOpen(false);
    };

    const cartTotal = useMemo(() => cartItems.reduce((total, item) => {
        const itemPrice = item.preco + (item.precoBorda || 0);
        return total + itemPrice * item.quantidade;
    }, 0), [cartItems]);
    const cartItemCount = useMemo(() => cartItems.reduce((count, item) => count + item.quantidade, 0), [cartItems]);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, isCartOpen, setIsCartOpen, cartTotal, cartItemCount, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};