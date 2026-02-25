import React from 'react';

// Estilos do botão WhatsApp
const whatsappButtonStyles = {
    width: '100%',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#25D366',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.2s',
    marginTop: '0.5rem'
};

// Ícone SVG do WhatsApp (leve e vetorial)
const WhatsAppIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ flexShrink: 0 }}
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
);

// Templates de mensagens por status
const getMensagemPorStatus = (pedido, status) => {
    const nomeCliente = pedido.nomeCliente || 'Cliente';
    const numeroPedido = pedido.id;
    const isPix = pedido.metodoPagamento === 'Pix';

    // Formata os itens do pedido
    const itensTexto = pedido.itens.map(itemPedido => {
        const nome = itemPedido.item?.nome || 'Item';
        const quantidade = itemPedido.quantidade;
        const tamanho = itemPedido.tamanho ? ` (${itemPedido.tamanho})` : '';
        return `• ${quantidade}x ${nome}${tamanho}`;
    }).join('\n');

    const templates = {
        1: `Ola ${nomeCliente}!

Recebemos seu pedido #${numeroPedido} e ja estamos analisando.

*Itens do pedido:*
${itensTexto}

${isPix ? 'IMPORTANTE: Estamos aguardando o comprovante do PIX para iniciar o preparo.\n\nPor favor, envie o comprovante o quanto antes!' : 'Em breve entraremos em contato para confirmar!'}`,

        2: `Oi ${nomeCliente}!

Seu pedido #${numeroPedido} esta na fila!

*Itens:*
${itensTexto}

Logo estara pronto!`,

        3: `${nomeCliente}, boa noticia!

Seu pedido #${numeroPedido} esta prontinho!

*Itens:*
${itensTexto}

${pedido.taxaEntrega > 0 ? 'O entregador ja esta a caminho!' : 'Pode vir retirar!'}`,

        4: `${nomeCliente}, obrigado pela preferencia!

Seu pedido #${numeroPedido} foi entregue/retirado com sucesso!

Esperamos que aproveite bastante! Volte sempre!`,

        5: `${nomeCliente}, informamos que o pedido #${numeroPedido} foi cancelado.

Se precisar de mais informacoes, estamos a disposicao!

Aguardamos voce em breve!`
    };

    return templates[status] || `Atualizacao sobre seu pedido #${numeroPedido}`;
};

const WhatsAppButton = ({ pedido, statusAtual }) => {
    const handleWhatsAppClick = () => {
        // Remove caracteres não numéricos do telefone
        const telefone = pedido.telefone?.replace(/\D/g, '') || '';

        if (!telefone) {
            alert('❌ Número de telefone não encontrado para este pedido.');
            return;
        }

        // Gera a mensagem baseada no status atual
        const mensagem = getMensagemPorStatus(pedido, statusAtual);

        // Codifica a mensagem para URL
        const mensagemCodificada = encodeURIComponent(mensagem);

        // Monta a URL do WhatsApp
        // Formato internacional: 55 (código do Brasil) + DDD + número
        const whatsappURL = `https://wa.me/55${telefone}?text=${mensagemCodificada}`;

        // Abre em nova aba
        window.open(whatsappURL, '_blank');
    };

    return (
        <button
            style={whatsappButtonStyles}
            onClick={handleWhatsAppClick}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#20BA5A'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#25D366'}
        >
            <WhatsAppIcon />
            Atualizar Cliente
        </button>
    );
};

export default WhatsAppButton;
