import React from 'react';
import styles from './styles';

// Importa os componentes da página do cliente
import Header from './components/Header';
import StoreStatusBanner from './components/StoreStatusBanner';
import Menu from './components/Menu';
import CartSidebar from './components/CartSidebar';

function App() {
    return (
        <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            <Header />
            <StoreStatusBanner />
            <main style={styles.container}>
                <Menu />
            </main>
            <CartSidebar />
        </div>
    );
}

export default App;
