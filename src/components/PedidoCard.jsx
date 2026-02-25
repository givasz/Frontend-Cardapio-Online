import React from 'react';
import WhatsAppButton from './WhatsAppButton';

// Estilos para os botões e o card para não poluir o componente
const cardStyles = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1rem',
    color: 'black',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    flexShrink: 0,
    margin: "1rem"
};

const buttonStyles = {
    width: '100%',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#333',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.9rem'
};

const PedidoCard = ({ pedido, onStatusChange }) => {
    // Função para formatar a data para um formato mais legível
    const formatarData = (dataString) => {
        const data = new Date(dataString);
        return data.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    // Calcula o total do pedido usando o precoFinal, precoBorda e a taxa de entrega
    const subtotal = pedido.itens.reduce((acc, itemPedido) => {
        const precoItem = itemPedido.precoFinal ?? itemPedido.item?.preco ?? 0;
        const precoBordaItem = itemPedido.precoBorda ?? 0;
        return acc + ((precoItem + precoBordaItem) * itemPedido.quantidade);
    }, 0);
    const totalPedido = (subtotal + (pedido.taxaEntrega || 0)).toFixed(2);
    
    // ✅ 1. NOVA FUNÇÃO PARA CANCELAR COM CONFIRMAÇÃO
    const handleCancelClick = () => {
        if (window.confirm('Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.')) {
            // Usa o status 5 para "Cancelado"
            onStatusChange(pedido.id, 5);
        }
    };

    return (
        <div style={cardStyles}>
            <p><strong>Pedido #{pedido.id}</strong> - {formatarData(pedido.criadoEm)}</p>
            <p><strong>Cliente:</strong> {pedido.nomeCliente}</p>
            <p><strong>Endereço:</strong> {pedido.endereco}</p>
            
            <hr style={{margin: '0.5rem 0'}}/>

            <strong>Itens:</strong>
            <ul style={{ listStyle: 'none', paddingLeft: '0', fontSize: '0.9em' }}>
                {pedido.itens.map(itemPedido => {
                    const precoItem = itemPedido.precoFinal ?? itemPedido.item?.preco ?? 0;
                    const precoBordaItem = itemPedido.precoBorda ?? 0;
                    const precoTotalItem = precoItem + precoBordaItem;

                    return (
                        <li key={itemPedido.id} style={{ marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f0f0f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span>
                                    {itemPedido.quantidade}x {itemPedido.item?.nome || 'Item não encontrado'}
                                    {itemPedido.tamanho && <strong style={{ color: '#EA580C' }}> ({itemPedido.tamanho})</strong>}
                                </span>
                                <span style={{ fontWeight: 600 }}>
                                    R$ {precoTotalItem.toFixed(2)}
                                </span>
                            </div>
                            {itemPedido.tipoMassa && (
                                <div style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 600, marginTop: '0.25rem' }}>
                                    Massa: {itemPedido.tipoMassa.nome}
                                </div>
                            )}
                            {itemPedido.borda && (
                                <div style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 600 }}>
                                    Borda: {itemPedido.borda.nome}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>

            <hr style={{margin: '0.5rem 0'}}/>

            {pedido.taxaEntrega > 0 && (
                <p><strong>Taxa de Entrega:</strong> R$ {pedido.taxaEntrega.toFixed(2)}</p>
            )}
            <p><strong>Total:</strong> R$ {totalPedido}</p>
            {pedido.metodoPagamento && <p><strong>Pagamento:</strong> {pedido.metodoPagamento}</p>}
            {pedido.metodoPagamento === 'Dinheiro' && pedido.trocoPara > 0 && <p><strong>Troco para:</strong> R$ {pedido.trocoPara.toFixed(2)}</p>}
            {pedido.observacoes && <p><strong>Obs:</strong> {pedido.observacoes}</p>}

            {/* Renderização condicional dos botões de ação */}
            {pedido.status === 1 && (
                <>
                    <button style={{...buttonStyles, backgroundColor: '#e8a234', marginTop: '1rem'}} onClick={() => onStatusChange(pedido.id, 2)}>
                        Colocar na Fila
                    </button>
                    {/* ✅ 2. ADIÇÃO DO BOTÃO DE CANCELAR */}
                    <button style={{...buttonStyles, backgroundColor: '#DC2626', marginTop: '0.5rem'}} onClick={handleCancelClick}>
                        Cancelar Pedido
                    </button>
                    <WhatsAppButton pedido={pedido} statusAtual={1} />
                </>
            )}

            {pedido.status === 2 && (
                <>
                    <button style={{...buttonStyles, backgroundColor: '#5ab44f', marginTop: '1rem'}} onClick={() => onStatusChange(pedido.id, 3)}>
                        Pronto para Entrega
                    </button>
                    <WhatsAppButton pedido={pedido} statusAtual={2} />
                </>
            )}

            {pedido.status === 3 && (
                <>
                    <button style={{...buttonStyles, backgroundColor: '#4B5563', marginTop: '1rem'}} onClick={() => onStatusChange(pedido.id, 4)}>
                        Finalizar Pedido
                    </button>
                    <WhatsAppButton pedido={pedido} statusAtual={3} />
                </>
            )}
        </div>
    );
};

export default PedidoCard;