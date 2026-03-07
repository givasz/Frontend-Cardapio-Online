import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import styles from '../styles';
import { API_BASE_URL } from '../config';
import StyledButton from '../components/StyledButton';
import { XIcon } from '../components/Icons';

// --- CONFIGURAÇÕES DA PIZZARIA ---
const PIX_KEY = '(38)999478040';
const PIX_NAME = 'AMBROZIO SILVA DA ROCHA';
const WHATSAPP_NUMBER = '5538999478040';
// --- FIM DAS CONFIGURAÇÕES ---

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useCart();
    const { cartItems, total } = location.state || {};

    // --- ESTADOS DO COMPONENTE ---
    const [formData, setFormData] = useState({ nomeCliente: '', telefone: '', endereco: '', observacoes: '' });
    const [deliveryOption, setDeliveryOption] = useState('delivery');
    const [tableNumber, setTableNumber] = useState('');
    const [taxaEntrega, setTaxaEntrega] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
    const [trocoPara, setTrocoPara] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');
    const [numeroDeMesas, setNumeroDeMesas] = useState(0);

    // --- FUNÇÕES AUXILIARES ---
    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value });

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número

        // Limita a 11 dígitos
        if (value.length > 11) value = value.slice(0, 11);

        // Aplica a máscara
        let formatted = value;
        if (value.length > 0) {
            if (value.length <= 2) {
                formatted = `(${value}`;
            } else if (value.length <= 7) {
                formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
            } else {
                formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
            }
        }

        setFormData({...formData, telefone: formatted});
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(PIX_KEY).then(() => {
            setCopySuccess('Copiado!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Falha ao copiar');
        });
    };

    // --- EFEITOS (LIFECYCLE) ---
    useEffect(() => {
        if (!cartItems || !total) {
            navigate('/');
            return;
        }

        const fetchTaxaEntrega = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/entrega`);
                if (response.ok) {
                    const data = await response.json();
                    setTaxaEntrega(data.taxaEntrega);
                } else { setTaxaEntrega(0); }
            } catch (error) {
                console.error("Falha ao buscar taxa de entrega:", error);
                setTaxaEntrega(0);
                alert(`⚠️ Não foi possível carregar a taxa de entrega\n\nUsando taxa padrão: R$ 0,00`);
            }
        };
        fetchTaxaEntrega();

        const fetchConfiguracao = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/configuracao`);
                if (response.ok) {
                    const data = await response.json();
                    setNumeroDeMesas(data.numeroDeMesas || 0);
                }
            } catch (error) {
                console.error("Falha ao buscar configuração:", error);
            }
        };
        fetchConfiguracao();

        const savedData = localStorage.getItem('customerData');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            const option = parsed.savedDeliveryOption || 'delivery';
            // Ignora endereco que seja só números (número de mesa salvo por engano)
            const enderecoVal = (parsed.endereco || '').trim();
            const enderecoLimpo = /^\d+$/.test(enderecoVal) ? '' : enderecoVal;
            setDeliveryOption(option);
            setFormData({
                nomeCliente: parsed.nomeCliente || '',
                telefone: parsed.telefone || '',
                endereco: option === 'delivery' ? enderecoLimpo : '',
                observacoes: ''
            });
        }
    }, [cartItems, total, clearCart, navigate]);

    useEffect(() => {
        if (success) window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [success]);

    // --- LÓGICA DE ENVIO ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        let finalAddress = '', validationError = '';

        if (deliveryOption === 'delivery') {
            if (!formData.endereco.trim()) validationError = 'Por favor, preencha o endereço de entrega.';
            finalAddress = formData.endereco;
        } else if (deliveryOption === 'table') {
            const mesaNum = parseInt(tableNumber, 10);
            if (!tableNumber.trim() || isNaN(mesaNum) || mesaNum < 1) {
                validationError = 'Por favor, informe o número da mesa.';
            } else if (numeroDeMesas > 0 && mesaNum > numeroDeMesas) {
                validationError = `Mesa inválida. O estabelecimento tem apenas ${numeroDeMesas} mesa${numeroDeMesas > 1 ? 's' : ''} (1 a ${numeroDeMesas}).`;
            }
            finalAddress = `Mesa: ${tableNumber}`;
        } else if (deliveryOption === 'pickup') {
            finalAddress = 'Retirar no estabelecimento';
        }

        if (!formData.nomeCliente.trim() || !formData.telefone.trim()) {
            validationError = 'Por favor, preencha nome e telefone.';
        }

        // Validação do troco
        if (paymentMethod === 'Dinheiro' && trocoPara) {
            const valorTroco = parseFloat(trocoPara);
            if (valorTroco <= finalTotal) {
                validationError = `O valor do troco (R$ ${valorTroco.toFixed(2)}) deve ser maior que o total do pedido (R$ ${finalTotal.toFixed(2)}).`;
            }
        }

        if (validationError) {
            setError(validationError);
            return;
        }

        const itemsParaBackend = cartItems.map(item => ({
            itemId: item.isCustomPizza ? item.baseItemId : item.id,
            quantidade: item.quantidade,
            tamanho: item.isCustomPizza ? item.tamanho : null,
            precoFinal: item.preco,
            bordaId: item.bordaId || null,
            precoBorda: item.precoBorda || null,
            tipoMassaId: item.tipoMassaId || null
        }));

        setError('');
        setIsLoading(true);

        const pedido = {
            ...formData,
            endereco: finalAddress,
            observacoes: formData.observacoes.trim(),
            itens: itemsParaBackend,
            metodoPagamento: deliveryOption === 'table' ? 'Pagar no Local' : paymentMethod,
            trocoPara: paymentMethod === 'Dinheiro' && trocoPara ? parseFloat(trocoPara) : null,
            taxaEntrega: deliveryOption === 'delivery' ? taxaEntrega : 0,
        };

        try {
            const r = await fetch(`${API_BASE_URL}/pedido`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pedido) });
            if (!r.ok) throw new Error('Falha ao enviar o pedido.');
            const res = await r.json();
            const computedTotal = deliveryOption === 'delivery' ? total + taxaEntrega : total;
            setSuccess({ message: `Pedido #${res.pedidoId} realizado com sucesso!`, pedidoId: res.pedidoId, paymentMethod, total: computedTotal });

            localStorage.setItem('customerData', JSON.stringify({
                nomeCliente: formData.nomeCliente,
                telefone: formData.telefone,
                endereco: deliveryOption === 'delivery' ? formData.endereco : '',
                savedDeliveryOption: deliveryOption,
            }));

            if (paymentMethod !== 'Pix') {
                clearCart();
            }
        } catch (err) { setError(err.message || 'Ocorreu um erro.'); } finally { setIsLoading(false); }
    };

    const handleClose = () => {
        if (success && success.paymentMethod === 'Pix') {
            clearCart();
        }
        navigate('/');
    };

    if (!cartItems || !total) return null;

    const finalTotal = deliveryOption === 'delivery' ? total + taxaEntrega : total;
    const whatsappMessage = success ? encodeURIComponent(`Olá! Vou mandar o comprovante do PIX referente ao pedido #${success.pedidoId}.`) : '';
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

    return (
        <div style={{ backgroundColor: '#FEF2F2', minHeight: '100vh', backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(220, 38, 38, 0.05) 0%, transparent 50%)' }}>
            <div style={{
                ...styles.container,
                maxWidth: '900px',
                paddingTop: '2rem',
                paddingBottom: '2rem'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '1.5rem',
                    boxShadow: '0 20px 25px -5px rgba(220, 38, 38, 0.15), 0 10px 10px -5px rgba(220, 38, 38, 0.1)',
                    overflow: 'hidden',
                    border: '3px solid #FEE2E2'
                }}>
                    <div style={{
                        background: success ? 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)' : 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                        color: 'white',
                        padding: '2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{fontSize: '2rem', fontWeight: 700, margin: 0}}>
                                {success ? 'Pedido Enviado!' : 'Finalizar Pedido'}
                            </h3>
                            {success && (
                                <p style={{fontSize: '1rem', margin: '0.5rem 0 0 0', opacity: 0.9}}>
                                    Seu pedido foi recebido com sucesso
                                </p>
                            )}
                        </div>
                        <StyledButton
                            onClick={handleClose}
                            style={{padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '50%'}}
                        >
                            <XIcon style={{ width: '1.5rem', height: '1.5rem' }} />
                        </StyledButton>
                    </div>

                    <div style={{ padding: '1.5rem' }}>
                        {success ? (
                            success.paymentMethod === 'Pix' ? (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        backgroundColor: '#FEF9C3',
                                        padding: '1.25rem',
                                        borderRadius: '0.75rem',
                                        border: '2px solid #FBBF24',
                                        marginBottom: '1.25rem'
                                    }}>
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            backgroundColor: '#F59E0B',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 1rem auto'
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"/>
                                                <line x1="12" y1="8" x2="12" y2="12"/>
                                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                                            </svg>
                                        </div>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#B45309', marginBottom: '0.5rem', margin: 0 }}>
                                            ATENÇÃO! Pagamento Necessário
                                        </h3>
                                        <p style={{ fontSize: '1rem', color: '#92400E', fontWeight: 600, margin: '0.5rem 0 0 0' }}>
                                            {success.message}
                                        </p>
                                    </div>

                                    <div style={{
                                        backgroundColor: '#FEF2F2',
                                        padding: '1.25rem',
                                        borderRadius: '0.75rem',
                                        border: '2px solid #DC2626',
                                        marginBottom: '1.25rem'
                                    }}>
                                        <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#DC2626', marginBottom: '0.75rem', margin: 0 }}>
                                            ⚠️ Pedido confirmado após pagamento!
                                        </h4>
                                        <div style={{
                                            backgroundColor: 'white',
                                            padding: '1rem',
                                            borderRadius: '0.5rem',
                                            marginTop: '0.75rem',
                                            border: '2px solid #FEE2E2'
                                        }}>
                                            <p style={{ fontSize: '0.95rem', color: '#7F1D1D', marginBottom: '0.75rem', fontWeight: 600, lineHeight: 1.5 }}>
                                                <strong style={{ color: '#DC2626', fontSize: '1rem' }}>IMPORTANTE:</strong><br/>
                                                1️⃣ Pague via PIX com a chave abaixo<br/>
                                                2️⃣ Envie comprovante no WhatsApp<br/>
                                                3️⃣ Aguarde confirmação da pizzaria
                                            </p>
                                            <p style={{ fontSize: '0.85rem', color: '#991B1B', fontWeight: 600, backgroundColor: '#FEE2E2', padding: '0.75rem', borderRadius: '0.375rem', marginTop: '0.5rem', margin: 0 }}>
                                                ⏰ Pedido inicia após recebermos o comprovante!
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{
                                        backgroundColor: '#FEF2F2',
                                        padding: '1rem',
                                        borderRadius: '0.75rem',
                                        marginBottom: '1.25rem',
                                        border: '2px solid #DC2626',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{ fontSize: '0.8rem', color: '#991B1B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                                            Total a pagar
                                        </p>
                                        <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#DC2626', lineHeight: 1 }}>
                                            R$ {success.total?.toFixed(2)}
                                        </p>
                                    </div>

                                    <div style={{
                                        backgroundColor: '#FEF2F2',
                                        padding: '1.25rem',
                                        borderRadius: '0.75rem',
                                        marginBottom: '1rem',
                                        border: '2px dashed #FCA5A5'
                                    }}>
                                        <p style={{fontSize: '0.875rem', color: '#991B1B', marginBottom: '0.5rem', fontWeight: 600}}>
                                            Chave Pix (Telefone)
                                        </p>
                                        <p style={{fontWeight: 700, fontSize: '1.75rem', margin: '0.35rem 0', color: '#DC2626'}}>
                                            {PIX_KEY}
                                        </p>
                                        <p style={{fontSize: '1rem', color: '#7F1D1D', marginBottom: '1rem', fontWeight: 600}}>
                                            {PIX_NAME}
                                        </p>
                                        <StyledButton
                                            onClick={handleCopyToClipboard}
                                            style={{
                                                width: '100%',
                                                padding: '0.875rem',
                                                fontSize: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}
                                            variant="secondary"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                            </svg>
                                            {copySuccess || 'Copiar Chave Pix'}
                                        </StyledButton>
                                    </div>

                                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}>
                                        <StyledButton
                                            style={{
                                                width: '100%',
                                                padding: '0.875rem',
                                                fontSize: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                backgroundColor: '#25D366',
                                                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)'
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                            </svg>
                                            Enviar Comprovante no WhatsApp
                                        </StyledButton>
                                    </a>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        backgroundColor: '#F0FDF4',
                                        padding: '1.25rem',
                                        borderRadius: '0.75rem',
                                        border: '2px solid #BBF7D0',
                                        marginBottom: '1.25rem'
                                    }}>
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            backgroundColor: '#16A34A',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 1rem auto'
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 6L9 17l-5-5"/>
                                            </svg>
                                        </div>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16A34A', marginBottom: '0.5rem', margin: 0 }}>
                                            Pedido Feito!
                                        </h3>
                                        <p style={{ fontSize: '1rem', color: '#15803D', fontWeight: 600, margin: '0.5rem 0' }}>
                                            {success.message}
                                        </p>
                                        <p style={{ fontSize: '0.875rem', color: '#166534', marginTop: '0.5rem' }}>
                                            Seu pedido está na fila! Em breve você receberá atualizações.
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <a
                                            href="/pedidos"
                                            style={{ textDecoration: 'none' }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate('/pedidos');
                                            }}
                                        >
                                            <StyledButton
                                                variant="secondary"
                                                style={{
                                                    width: '100%',
                                                    padding: '0.875rem',
                                                    fontSize: '1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                                    <polyline points="11 3 11 11 14 8 17 11 17 3"/>
                                                </svg>
                                                Acompanhar Meus Pedidos
                                            </StyledButton>
                                        </a>

                                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}>
                                            <StyledButton
                                                style={{
                                                    width: '100%',
                                                    padding: '0.875rem',
                                                    fontSize: '1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    backgroundColor: '#25D366',
                                                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)'
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                </svg>
                                                Conversar no WhatsApp
                                            </StyledButton>
                                        </a>

                                        <StyledButton
                                            onClick={handleClose}
                                            variant="ghost"
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                fontSize: '0.875rem',
                                                color: '#6B7280'
                                            }}
                                        >
                                            Voltar ao Cardápio
                                        </StyledButton>
                                    </div>
                                </div>
                            )
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{...styles.label, display: 'block', marginBottom: '0.5rem'}} htmlFor="nomeCliente">
                                        Nome Completo
                                    </label>
                                    <input
                                        style={styles.input}
                                        type="text"
                                        id="nomeCliente"
                                        name="nomeCliente"
                                        value={formData.nomeCliente}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{...styles.label, display: 'block', marginBottom: '0.5rem'}} htmlFor="telefone">
                                        Telefone / WhatsApp
                                    </label>
                                    <input
                                        style={styles.input}
                                        type="tel"
                                        id="telefone"
                                        name="telefone"
                                        value={formData.telefone}
                                        onChange={handlePhoneChange}
                                        placeholder="(00) 00000-0000"
                                        maxLength="15"
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{...styles.label, display: 'block', marginBottom: '0.75rem'}}>
                                        Opção de Entrega
                                    </label>
                                    <div style={{display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem'}}>
                                        {[{id: 'delivery', name: 'Para Entrega'}, {id: 'table', name: 'Comer no Local'}, {id: 'pickup', name: 'Retirar no Balcão'}].map(option => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => setDeliveryOption(option.id)}
                                                style={{
                                                    padding: '0.5rem 1.1rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    border: deliveryOption === option.id ? 'none' : '2px solid #DC2626',
                                                    backgroundColor: deliveryOption === option.id ? '#DC2626' : '#FEE2E2',
                                                    color: deliveryOption === option.id ? 'white' : '#DC2626',
                                                    fontFamily: 'inherit',
                                                }}
                                            >
                                                {option.name}
                                            </button>
                                        ))}
                                    </div>

                                    {deliveryOption === 'delivery' && (
                                        <div>
                                            <label style={{...styles.label, display: 'block', marginBottom: '0.5rem'}} htmlFor="endereco">
                                                Endereço de Entrega
                                            </label>
                                            <input
                                                style={styles.input}
                                                type="text"
                                                id="endereco"
                                                name="endereco"
                                                value={formData.endereco}
                                                onChange={handleChange}
                                                placeholder="Rua, Número, Bairro"
                                                required
                                            />
                                        </div>
                                    )}
                                    {deliveryOption === 'table' && (
                                        <div>
                                            <label style={{...styles.label, display: 'block', marginBottom: '0.5rem'}} htmlFor="tableNumber">
                                                Número da Mesa{numeroDeMesas > 0 && <span style={{ fontWeight: 400, color: '#9CA3AF', fontSize: '0.8rem' }}> (1 a {numeroDeMesas})</span>}
                                            </label>
                                            <input
                                                style={styles.input}
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                id="tableNumber"
                                                name="tableNumber"
                                                value={tableNumber}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (numeroDeMesas > 0 && val !== '' && parseInt(val, 10) > numeroDeMesas) return;
                                                    setTableNumber(val);
                                                }}
                                                placeholder={numeroDeMesas > 0 ? `Mesa 1 a ${numeroDeMesas}` : 'Informe o nº da mesa'}
                                                required
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label style={{...styles.label, display: 'block', marginBottom: '0.25rem'}} htmlFor="observacoes">
                                        Observações
                                    </label>
                                    <p style={{ fontSize: '0.75rem', color: '#B45309', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '0.375rem', padding: '0.4rem 0.6rem', marginBottom: '0.5rem', marginTop: 0 }}>
                                        🍕 <strong>Pizza com mais de um sabor?</strong> Especifique em qual sabor a observação se aplica.<br/>
                                        Ex: <em>"Sem cebola <strong>na calabresa</strong>"</em> ou <em>"Sem azeitona <strong>nas duas"</strong></em>
                                    </p>
                                    <textarea
                                        style={{...styles.input, height: '100px', resize: 'vertical'}}
                                        id="observacoes"
                                        name="observacoes"
                                        value={formData.observacoes}
                                        onChange={handleChange}
                                        placeholder="Ex: Sem cebola na calabresa, sem azeitona na portuguesa, ponto da carne bem passado..."
                                    />
                                </div>

                                {deliveryOption !== 'table' && (
                                    <>
                                        <div style={{paddingTop: '1rem', borderTop: '2px solid #FEE2E2'}}>
                                            <label style={{...styles.label, display: 'block', marginBottom: '0.75rem'}}>
                                                Forma de Pagamento
                                            </label>
                                            <div style={{display: 'flex', gap: '0.6rem', flexWrap: 'wrap'}}>
                                                {['Dinheiro', 'Pix', 'Cartão de Crédito', 'Cartão de Débito'].map(method => (
                                                    <button
                                                        key={method}
                                                        type="button"
                                                        onClick={() => setPaymentMethod(method)}
                                                        style={{
                                                            padding: '0.5rem 1.1rem',
                                                            borderRadius: '9999px',
                                                            fontSize: '0.875rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            border: paymentMethod === method ? 'none' : '2px solid #DC2626',
                                                            backgroundColor: paymentMethod === method ? '#DC2626' : '#FEE2E2',
                                                            color: paymentMethod === method ? 'white' : '#DC2626',
                                                            fontFamily: 'inherit',
                                                        }}
                                                    >
                                                        {method}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {paymentMethod === 'Dinheiro' && (
                                            <div>
                                                <label style={{...styles.label, display: 'block', marginBottom: '0.5rem'}} htmlFor="trocoPara">
                                                    Precisa de troco para quanto? (Opcional)
                                                </label>
                                                <input
                                                    style={styles.input}
                                                    type="number"
                                                    id="trocoPara"
                                                    name="trocoPara"
                                                    value={trocoPara}
                                                    onChange={(e) => setTrocoPara(e.target.value)}
                                                    placeholder="Ex: 50"
                                                />
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* RESUMO DOS ITENS */}
                                <div style={{
                                    paddingTop: '1rem',
                                    borderTop: '2px solid #E5E7EB',
                                }}>
                                    <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#1F2937' }}>
                                        Resumo do Pedido
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                                        {cartItems.map(item => {
                                            const itemTotal = item.preco + (item.precoBorda || 0);
                                            return (
                                                <div key={item.cartId} style={{
                                                    padding: '0.75rem',
                                                    backgroundColor: '#FEF2F2',
                                                    borderRadius: '0.5rem',
                                                    border: '1.5px solid #FEE2E2'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                        <span style={{ fontWeight: 600, color: '#1F2937' }}>
                                                            {item.quantidade}x {item.nome}
                                                        </span>
                                                        <span style={{ fontWeight: 600, color: '#DC2626' }}>
                                                            R$ {(itemTotal * item.quantidade).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    {item.isCustomPizza && (
                                                        <>
                                                            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
                                                                Tamanho: {item.tamanho}
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                                                                Sabores: {item.sabores.map(s => s.nome).join(', ')}
                                                            </div>
                                                            {item.tipoMassa && (
                                                                <div style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 600 }}>
                                                                    Massa: {item.tipoMassa.nome}
                                                                </div>
                                                            )}
                                                            {item.borda && (
                                                                <div style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 600 }}>
                                                                    Borda: {item.borda.nome}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div style={{
                                    backgroundColor: '#FEF2F2',
                                    border: '2px solid #FEE2E2',
                                    padding: '1.5rem',
                                    borderRadius: '0.75rem',
                                    marginTop: '1rem'
                                }}>
                                    {deliveryOption === 'delivery' && taxaEntrega > 0 && (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', marginBottom: '0.5rem' }}>
                                                <span>Subtotal:</span><span>R$ {total.toFixed(2)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', marginBottom: '0.75rem' }}>
                                                <span>Taxa de Entrega:</span><span>R$ {taxaEntrega.toFixed(2)}</span>
                                            </div>
                                        </>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '1rem' }}>
                                        <span>Total:</span><span style={{color: '#DC2626'}}>R$ {finalTotal.toFixed(2)}</span>
                                    </div>
                                    {error && <p style={{ color: 'red', fontSize: '1rem', marginBottom: '1rem', backgroundColor: '#FEE2E2', padding: '0.75rem', borderRadius: '0.375rem' }}>{error}</p>}
                                    <StyledButton
                                        type="submit"
                                        disabled={isLoading}
                                        style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}
                                    >
                                        {isLoading ? 'Enviando...' : 'Confirmar Pedido'}
                                    </StyledButton>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
