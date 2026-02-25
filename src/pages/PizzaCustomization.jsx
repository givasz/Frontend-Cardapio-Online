import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { API_BASE_URL } from '../config';
import styles from '../styles';
import StyledButton from '../components/StyledButton';
import { XIcon } from '../components/Icons';

const SIZES = {
    P: { name: 'P', flavors: 2 },
    M: { name: 'M', flavors: 2 },
    G: { name: 'G', flavors: 3 },
    GG: { name: 'GG', flavors: 3 },
};

const priceFieldMap = {
    P: 'precoP',
    M: 'precoM',
    G: 'precoG',
    GG: 'precoGG',
};

const PizzaCustomization = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart } = useCart();
    const { basePizza, allFlavors } = location.state || {};

    const [selectedSize, setSelectedSize] = useState('M');
    const [selectedFlavors, setSelectedFlavors] = useState([]);
    const [bordas, setBordas] = useState([]);
    const [tiposMassa, setTiposMassa] = useState([]);
    const [selectedBordaId, setSelectedBordaId] = useState(null);
    const [selectedTipoMassaId, setSelectedTipoMassaId] = useState(null);

    useEffect(() => {
        if (!basePizza || !allFlavors) {
            navigate('/');
            return;
        }
        setSelectedSize('M');
        setSelectedFlavors([basePizza]);

        // Buscar bordas disponíveis
        fetch(`${API_BASE_URL}/bordas`)
            .then(res => res.json())
            .then(data => {
                // Filtrar apenas bordas disponíveis
                const bordasDisponiveis = data.filter(b => b.disponivel);
                setBordas(bordasDisponiveis);
            })
            .catch(err => console.error('Erro ao buscar bordas:', err));

        // Buscar tipos de massa disponíveis
        fetch(`${API_BASE_URL}/tipos-massa`)
            .then(res => res.json())
            .then(data => {
                // Filtrar apenas tipos de massa disponíveis e ordenar: Fina, Média, Grossa
                const tiposMassaDisponiveis = data
                    .filter(t => t.disponivel)
                    .sort((a, b) => {
                        const ordem = { 'fina': 1, 'média': 2, 'grossa': 3 };
                        const nomeA = a.nome.toLowerCase();
                        const nomeB = b.nome.toLowerCase();
                        return (ordem[nomeA] || 99) - (ordem[nomeB] || 99);
                    });
                setTiposMassa(tiposMassaDisponiveis);
            })
            .catch(err => console.error('Erro ao buscar tipos de massa:', err));
    }, [basePizza, allFlavors, navigate]);

    const maxFlavors = SIZES[selectedSize].flavors;

    const handleSizeChange = (newSize) => {
        setSelectedSize(newSize);
        // Reset border selection when changing size
        setSelectedBordaId(null);
    };

    const handleFlavorToggle = (flavor) => {
        setSelectedFlavors(prev => {
            const isSelected = prev.find(f => f.id === flavor.id);
            if (isSelected) {
                if (prev.length === 1) return prev;
                return prev.filter(f => f.id !== flavor.id);
            } else {
                if (prev.length < maxFlavors) {
                    return [...prev, flavor];
                }
                return prev;
            }
        });
    };

    // Calcular preço da borda (diferença entre preço com borda e sem borda da pizza)
    const precoBordaCalculado = useMemo(() => {
        if (!selectedBordaId || selectedFlavors.length === 0) return 0;

        const priceKey = priceFieldMap[selectedSize];
        const priceKeyComBorda = `${priceKey}ComBorda`; // Ex: precoG -> precoGComBorda

        // Pegar o sabor mais caro
        const mostExpensiveFlavor = selectedFlavors.reduce((max, flavor) => {
            const maxPriceComBorda = max[priceKeyComBorda] || max[priceKey] || max.preco;
            const currentPriceComBorda = flavor[priceKeyComBorda] || flavor[priceKey] || flavor.preco;
            return currentPriceComBorda > maxPriceComBorda ? flavor : max;
        }, selectedFlavors[0]);

        const precoSemBorda = mostExpensiveFlavor[priceKey] || mostExpensiveFlavor.preco || 0;
        const precoComBorda = mostExpensiveFlavor[priceKeyComBorda] || 0;

        // Se não tem preço com borda definido, retorna 0
        if (!precoComBorda) return 0;

        // Retorna a diferença
        return precoComBorda - precoSemBorda;
    }, [selectedBordaId, selectedFlavors, selectedSize]);

    const finalPrice = useMemo(() => {
        if (selectedFlavors.length === 0) return 0;

        const priceKey = priceFieldMap[selectedSize];
        const priceKeyComBorda = `${priceKey}ComBorda`;

        // Se tem borda selecionada E a pizza tem preço com borda, usa preço com borda
        if (selectedBordaId && selectedFlavors.some(f => f[priceKeyComBorda])) {
            const pricesForSize = selectedFlavors.map(flavor =>
                flavor[priceKeyComBorda] || flavor[priceKey] || flavor.preco
            );
            return Math.max(...pricesForSize);
        } else {
            // Sem borda ou pizza não tem opção de borda
            const pricesForSize = selectedFlavors.map(flavor => flavor[priceKey] || flavor.preco);
            return Math.max(...pricesForSize);
        }
    }, [selectedFlavors, selectedSize, selectedBordaId]);

    const handleAddToCart = () => {
        const pizzaName = selectedFlavors.length > 1
            ? `Pizza ${selectedFlavors.map(f => f.nome).join(' / ')}`
            : `Pizza ${selectedFlavors[0].nome}`;

        const priceKey = priceFieldMap[selectedSize];
        const mostExpensiveFlavor = selectedFlavors.reduce((max, flavor) => {
            const maxPrice = max[priceKey] || max.preco;
            const currentPrice = flavor[priceKey] || flavor.preco;
            return currentPrice > maxPrice ? flavor : max;
        }, selectedFlavors[0]);

        // Preço base da pizza (sem borda)
        const pizzaBasePrice = Math.max(...selectedFlavors.map(f => f[priceKey] || f.preco));

        const customPizza = {
            baseItemId: mostExpensiveFlavor.id,
            nome: pizzaName,
            preco: pizzaBasePrice,
            quantidade: 1,
            isCustomPizza: true,
            tamanho: SIZES[selectedSize].name,
            sabores: selectedFlavors,
            bordaId: selectedBordaId ? parseInt(selectedBordaId) : null,
            precoBorda: precoBordaCalculado > 0 ? precoBordaCalculado : null,
            tipoMassaId: selectedTipoMassaId ? parseInt(selectedTipoMassaId) : null,
            // Armazenar objetos completos para exibição
            borda: selectedBordaId ? bordas.find(b => b.id === parseInt(selectedBordaId)) : null,
            tipoMassa: selectedTipoMassaId ? tiposMassa.find(t => t.id === parseInt(selectedTipoMassaId)) : null,
        };
        addToCart(customPizza);
        navigate('/');
    };

    const remainingFlavors = maxFlavors - selectedFlavors.length;

    if (!basePizza || !allFlavors) return null;

    return (
        <div style={{ backgroundColor: '#FEF2F2', minHeight: '100vh', height: '100vh', display: 'flex', alignItems: 'center', backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(220, 38, 38, 0.05) 0%, transparent 50%)' }}>
            <div style={{
                ...styles.container,
                maxWidth: '900px',
                padding: '1rem'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '1.5rem',
                    boxShadow: '0 20px 25px -5px rgba(220, 38, 38, 0.15), 0 10px 10px -5px rgba(220, 38, 38, 0.1)',
                    overflow: 'hidden',
                    border: '3px solid #FEE2E2',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '95vh'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                        color: 'white',
                        padding: '1.25rem 1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexShrink: 0
                    }}>
                        <div>
                            <h3 style={{fontSize: '1.5rem', fontWeight: 700, margin: 0, marginBottom: '0.15rem'}}>Monte sua Pizza</h3>
                            <p style={{fontSize: '0.875rem', margin: 0, opacity: 0.9}}>Personalize do seu jeito</p>
                        </div>
                        <StyledButton
                            onClick={() => navigate('/')}
                            style={{padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '50%'}}
                        >
                            <XIcon style={{ width: '1.25rem', height: '1.25rem' }}/>
                        </StyledButton>
                    </div>

                    <div style={{padding: '1.5rem', flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                        {/* SELEÇÃO DE TAMANHO + SABORES ESCOLHIDOS */}
                        <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                            {/* TAMANHO */}
                            <div style={{ backgroundColor: '#FEF2F2', padding: '0.75rem', borderRadius: '0.75rem', border: '2px solid #FEE2E2', flex: '0 0 auto' }}>
                                <label style={{...styles.label, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem'}}>
                                    <span style={{ backgroundColor: '#DC2626', color: 'white', width: '1.25rem', height: '1.25rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem' }}>1</span>
                                    Tamanho
                                </label>
                                <div style={{display: 'flex', gap: '0.35rem'}}>
                                    {Object.values(SIZES).map(size => (
                                        <StyledButton
                                            key={size.name}
                                            variant={selectedSize === size.name ? 'primary' : 'secondary'}
                                            onClick={() => handleSizeChange(size.name)}
                                            style={{
                                                padding: '0.5rem 0.75rem',
                                                fontSize: '0.875rem',
                                                fontWeight: 700,
                                                flex: '1'
                                            }}
                                        >
                                            {size.name}
                                            <div style={{ fontSize: '0.625rem', fontWeight: 400, marginTop: '0.1rem' }}>
                                                {size.flavors} sabor{size.flavors > 1 ? 'es' : ''}
                                            </div>
                                        </StyledButton>
                                    ))}
                                </div>
                            </div>

                            {/* SABORES ESCOLHIDOS */}
                            <div style={{ backgroundColor: '#FEF2F2', padding: '0.75rem', borderRadius: '0.75rem', border: '2px dashed #FCA5A5', flexGrow: 1 }}>
                                {selectedFlavors.length > 0 && (
                                    <>
                                        <label style={{...styles.label, fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem'}}>
                                            {selectedFlavors.length === 1 ? "Sabor:" : "Sabores:"}
                                        </label>
                                        <p style={{ margin: '0.2rem 0', fontWeight: '700', fontSize: '0.875rem', color: '#DC2626', lineHeight: 1.3 }}>
                                            {selectedFlavors.map(f => f.nome).join(' / ')}
                                        </p>
                                    </>
                                )}
                                {remainingFlavors > 0 && (
                                    <p style={{ fontSize: '0.65rem', color: '#991B1B', marginTop: '0.2rem', fontWeight: 500 }}>
                                        Pode adicionar +{remainingFlavors} (opcional)
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* SELEÇÃO DE SABORES */}
                        <div style={{backgroundColor: '#FEF2F2', padding: '0.75rem', borderRadius: '0.75rem', border: '2px solid #FEE2E2', flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '250px'}}>
                            <label style={{...styles.label, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'space-between', flexShrink: 0}}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <span style={{ backgroundColor: '#DC2626', color: 'white', width: '1.25rem', height: '1.25rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem' }}>2</span>
                                    Escolha os Sabores
                                </div>
                                <span style={{ backgroundColor: '#DC2626', color: 'white', padding: '0.25rem 0.65rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                    {selectedFlavors.length}/{maxFlavors}
                                </span>
                            </label>
                            <div style={{
                                flexGrow: 1,
                                overflowY: 'auto',
                                border: '2px solid #FCA5A5',
                                borderRadius: '0.65rem',
                                padding: '0.4rem',
                                backgroundColor: 'white',
                                minHeight: '200px'
                            }}>
                                {allFlavors.map(flavor => {
                                    const isSelected = selectedFlavors.some(f => f.id === flavor.id);
                                    const isDisabled = !isSelected && selectedFlavors.length >= maxFlavors;
                                    const priceKey = priceFieldMap[selectedSize];
                                    const displayPrice = flavor[priceKey] || flavor.preco;

                                    return (
                                        <div
                                            key={flavor.id}
                                            style={{
                                                padding: '0.65rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.65rem',
                                                opacity: isDisabled ? 0.4 : 1,
                                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                backgroundColor: isSelected ? '#FEF2F2' : 'white',
                                                borderRadius: '0.5rem',
                                                marginBottom: '0.3rem',
                                                transition: 'all 0.3s ease',
                                                border: isSelected ? '2px solid #DC2626' : '2px solid transparent'
                                            }}
                                            onClick={() => !isDisabled && handleFlavorToggle(flavor)}
                                        >
                                            <input
                                                type="checkbox"
                                                id={`flavor-${flavor.id}`}
                                                checked={isSelected}
                                                disabled={isDisabled}
                                                onChange={() => handleFlavorToggle(flavor)}
                                                style={{
                                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                    width: '18px',
                                                    height: '18px',
                                                    accentColor: '#DC2626',
                                                    flexShrink: 0
                                                }}
                                            />
                                            <label
                                                htmlFor={`flavor-${flavor.id}`}
                                                style={{
                                                    flexGrow: 1,
                                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                    fontWeight: isSelected ? '700' : '500',
                                                    fontSize: '0.9rem',
                                                    color: isSelected ? '#DC2626' : '#1F2937'
                                                }}
                                            >
                                                {flavor.nome}
                                            </label>
                                            <span style={{
                                                fontWeight: '700',
                                                fontSize: '0.9rem',
                                                color: '#DC2626',
                                                backgroundColor: '#FEF2F2',
                                                padding: '0.35rem 0.65rem',
                                                borderRadius: '0.375rem',
                                                flexShrink: 0
                                            }}>
                                                R$ {displayPrice.toFixed(2)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* TIPO DE MASSA E BORDA LADO A LADO */}
                        {(tiposMassa.length > 0 || bordas.length > 0) && (
                            <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                                {/* TIPO DE MASSA */}
                                {tiposMassa.length > 0 && (
                                    <div style={{ backgroundColor: '#FEF2F2', padding: '0.75rem', borderRadius: '0.75rem', border: '2px solid #FEE2E2', flex: 1 }}>
                                        <label style={{...styles.label, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem'}}>
                                            <span style={{ backgroundColor: '#DC2626', color: 'white', width: '1.25rem', height: '1.25rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem' }}>3</span>
                                            Tipo de Massa (opcional)
                                        </label>
                                        <select
                                            value={selectedTipoMassaId || ''}
                                            onChange={(e) => setSelectedTipoMassaId(e.target.value || null)}
                                            style={{
                                                ...styles.input,
                                                padding: '0.65rem',
                                                fontSize: '0.9rem',
                                                borderRadius: '0.5rem',
                                                border: '2px solid #FCA5A5',
                                                backgroundColor: 'white',
                                                cursor: 'pointer',
                                                marginBottom: 0
                                            }}
                                        >
                                            <option value="">Escolha o tipo de massa</option>
                                            {tiposMassa.map(massa => (
                                                <option key={massa.id} value={massa.id}>
                                                    {massa.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* BORDA RECHEADA */}
                                {bordas.length > 0 && (
                                    <div style={{ backgroundColor: '#FEF2F2', padding: '0.75rem', borderRadius: '0.75rem', border: '2px solid #FEE2E2', flex: 1 }}>
                                        <label style={{...styles.label, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem'}}>
                                            <span style={{ backgroundColor: '#DC2626', color: 'white', width: '1.25rem', height: '1.25rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem' }}>4</span>
                                            Borda Recheada (opcional)
                                        </label>
                                        <select
                                            value={selectedBordaId || ''}
                                            onChange={(e) => setSelectedBordaId(e.target.value || null)}
                                            style={{
                                                ...styles.input,
                                                padding: '0.65rem',
                                                fontSize: '0.9rem',
                                                borderRadius: '0.5rem',
                                                border: '2px solid #FCA5A5',
                                                backgroundColor: 'white',
                                                cursor: 'pointer',
                                                marginBottom: 0
                                            }}
                                        >
                                            <option value="">Sem borda</option>
                                            {bordas.map(borda => (
                                                <option key={borda.id} value={borda.id}>
                                                    {borda.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* FOOTER FIXO */}
                    <div style={{
                        padding: '1.25rem 1.5rem',
                        borderTop: '3px solid #FEE2E2',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'linear-gradient(to right, #FEF2F2, white)',
                        gap: '1rem',
                        flexShrink: 0
                    }}>
                        <div>
                            <span style={{fontSize: '0.875rem', color: '#991B1B', display: 'block', fontWeight: 600, marginBottom: '0.15rem'}}>Total da Pizza</span>
                            <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#DC2626', margin: 0, lineHeight: 1}}>
                                R$ {finalPrice.toFixed(2)}
                            </p>
                        </div>
                        <StyledButton
                            onClick={handleAddToCart}
                            style={{
                                padding: '1rem 2rem',
                                fontSize: '1rem',
                                fontWeight: 700,
                                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)'
                            }}
                            disabled={selectedFlavors.length === 0}
                        >
                            Adicionar ao Carrinho
                        </StyledButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PizzaCustomization;
