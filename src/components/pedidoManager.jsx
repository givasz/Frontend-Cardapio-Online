// frontend/PedidoManager.js

// ATUALIZAÇÃO 1: Importar useEffect
import React, { useState, useEffect } from 'react';
import styles from '../styles';
import { useAuth } from '../contexts/AuthContext';
// Visto que não tenho seu componente StyledButton, criarei um Card de Pedido separado
// import StyledButton from './StyledButton'; 
import PedidoCard from './PedidoCard'; // ATUALIZAÇÃO 2: Importar o novo componente de card
import { API_BASE_URL } from '../config';

const PedidoManager = () => {
    // ATUALIZAÇÃO 3: Criar um estado para armazenar os pedidos
    const [pedidos, setPedidos] = useState([]);

    // ATUALIZAÇÃO 4: Função para buscar os pedidos no backend
    // Envolvemos a lógica de busca em uma função para poder chamá-la no início e no intervalo
    const { token } = useAuth();
    const fetchPedidos = async () => {
        try {
            if (!token) {
                console.error("Token de admin não encontrado.");
                // Opcional: redirecionar para a página de login
                return;
            }

            const response = await fetch(`${API_BASE_URL}/admin/pedidos`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Falha ao buscar pedidos');
            }

            const data = await response.json();
            setPedidos(data);
        } catch (error) {
            console.error("Erro:", error);
            alert(`❌ Erro ao carregar pedidos\n\n${error.message}`);
        }
    };

    // ATUALIZAÇÃO 5: Usar useEffect para buscar os dados e definir o intervalo
    useEffect(() => {
        // Busca os pedidos assim que o componente é montado
        fetchPedidos();

        // Configura um intervalo para chamar a função fetchPedidos a cada 60 segundos (1 minuto)
        const intervalId = setInterval(fetchPedidos, 60000);

        // Função de limpeza: O React executa isso quando o componente é desmontado.
        // Isso é crucial para evitar que o intervalo continue rodando para sempre.
        return () => clearInterval(intervalId);
    }, []); // O array vazio [] significa que este efeito roda apenas uma vez, na montagem do componente.

    // ATUALIZAÇÃO 6: Função para lidar com a mudança de status, que será passada para o PedidoCard
    const handleStatusChange = async (pedidoId, novoStatus) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/pedidos/${pedidoId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status: Number(novoStatus) }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Falha ao atualizar status');
            }

            // Após atualizar o status com sucesso, busca a lista de pedidos novamente
            // para garantir que a tela esteja 100% sincronizada com o banco de dados.
            fetchPedidos();

        } catch (error) {
            console.error("Erro ao mudar status:", error);
            alert(`❌ Erro ao atualizar status do pedido\n\n${error.message}\n\nPor favor, tente novamente.`);
        }
    };

    return (
        <div style={styles.card}>
            <div style={{...styles.input, padding: '1.5rem', border: 'none', height: 'auto', flexDirection: 'column'}}>
                <h3 style={{fontSize: '1.125rem', fontWeight: 500, color: 'black'}}>Gerenciar status dos pedidos</h3>
            </div>
            <div style={{justifyContent: 'center', height: '100vh', borderTop: '1px solid #E5E7EB', padding: '1.5rem', display: 'flex', flexDirection: 'row', gap: '1.5rem'}}>

                {/* Coluna "Em análise" */}
                <div style={{backgroundColor: '#d4652f', height: '100%', width: '30%', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', }}>
                    <div style={{color: 'white', backgroundColor: '#0000003f', width: '100%', height: "10%", display: 'flex', justifyContent: "center", alignItems: "center", flexShrink: 0}}><h3>Em análise</h3></div>
                    {/* ATUALIZAÇÃO 7: Mapear e exibir os pedidos com status 1 */}
                    {pedidos.filter(p => p.status === 1).map(pedido => (
                        <PedidoCard key={pedido.id} pedido={pedido} onStatusChange={handleStatusChange} />
                    ))}
                </div>

                {/* Coluna "Na Fila" */}
                <div style={{backgroundColor: '#e8a234', height: '100%', width: '30%',  display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto'}}>
                    <div style={{color: 'white', backgroundColor: '#0000003f', width: '100%', height: "10%", display: 'flex', justifyContent: "center", alignItems: "center", flexShrink: 0}}><h3>Na Fila</h3></div>
                    {/* ATUALIZAÇÃO 8: Mapear e exibir os pedidos com status 2 */}
                    {pedidos.filter(p => p.status === 2).map(pedido => (
                        <PedidoCard key={pedido.id} pedido={pedido} onStatusChange={handleStatusChange} />
                    ))}
                </div>

                {/* Coluna "Pronto para entrega" */}
                <div style={{backgroundColor: '#5ab44f', height: '100%', width: '30%',  display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto'}}>
                    <div style={{color: 'white', backgroundColor: '#0000003f', width: '100%', height: "10%", display: 'flex', justifyContent: "center", alignItems: "center", flexShrink: 0}}><h3>Pronto para entrega</h3></div>
                    {/* ATUALIZAÇÃO 9: Mapear e exibir os pedidos com status 3 */}
                    {pedidos.filter(p => p.status === 3).map(pedido => (
                        <PedidoCard key={pedido.id} pedido={pedido} onStatusChange={handleStatusChange} />
                    ))}
                </div>

            </div>
        </div>
    );
};

export default PedidoManager;