import React, { useState, createContext, useContext, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';

const ScheduleContext = createContext();

export const useSchedule = () => useContext(ScheduleContext);

// Função para transformar o array da API no objeto que o frontend usa
const transformApiDataToScheduleObject = (apiData) => {
    return apiData.reduce((acc, day) => {
        acc[day.diaDaSemana] = {
            name: day.nome,
            open: day.aberto,
            start: day.inicio,
            end: day.fim,
        };
        return acc;
    }, {});
};

export const ScheduleProvider = ({ children }) => {
    const { token } = useAuth();
    const [schedule, setSchedule] = useState(null); // Inicia como nulo até carregar
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect para buscar os dados da API quando o componente montar
    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/horarios`);
                if (!response.ok) {
                    throw new Error('Falha ao buscar dados da API');
                }
                const apiData = await response.json();

                // Se a API retornar um array vazio (ex: primeiro uso), precisamos criar os dados
                if (apiData.length === 0) {
                     // Aqui você pode definir um estado inicial e talvez chamar saveSchedule para popular o DB
                     // Por enquanto, vamos assumir que o DB já foi semeado (seeded) com dados iniciais.
                    console.warn("Banco de dados de horários está vazio.");
                    // Poderia usar um defaultSchedule aqui.
                    setSchedule({}); // Define um objeto vazio para não quebrar a UI
                } else {
                    const scheduleObject = transformApiDataToScheduleObject(apiData);
                    setSchedule(scheduleObject);
                }

            } catch (err) {
                setError(err.message);
                console.error("Erro ao carregar horários:", err);
                alert(`❌ Erro ao carregar horários da loja\n\n${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, []); // O array vazio [] garante que isso só rode uma vez

    // Função de salvar adaptada para a API
    const saveSchedule = async (newScheduleObject) => {
        try {
            // Transforma o objeto do frontend de volta para um array que a API espera
            const scheduleAsArray = Object.keys(newScheduleObject).map(key => ({
                diaDaSemana: parseInt(key, 10),
                nome: newScheduleObject[key].name,
                aberto: newScheduleObject[key].open,
                inicio: newScheduleObject[key].start,
                fim: newScheduleObject[key].end
            }));

            const response = await fetch(`${API_BASE_URL}/admin/horarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(scheduleAsArray),
            });

            if (!response.ok) {
                throw new Error('Falha ao salvar os horários');
            }

            // Atualiza o estado local do contexto com os novos horários salvos
            setSchedule(newScheduleObject);

        } catch (err) {
            console.error("Erro ao salvar horários:", err);
            alert(`❌ Erro ao salvar horários\n\n${err.message}\n\nPor favor, tente novamente.`);
        }
    };

    // useMemo continua funcionando perfeitamente, mas agora depende do schedule carregado
    const { isOpen, message } = useMemo(() => {
        if (!schedule || loading) {
            // Mensagem enquanto os dados estão sendo carregados
            return { isOpen: false, message: 'Carregando status da loja...' };
        }
        
        // A lógica original daqui para baixo permanece a mesma...
        const now = new Date();
        const dayOfWeek = now.getDay();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const todaySchedule = schedule[dayOfWeek];

        if (!todaySchedule || !todaySchedule.open) {
            let nextDayInfo = null;
            for (let i = 1; i <= 7; i++) {
                const nextDay = (dayOfWeek + i) % 7;
                if (schedule[nextDay] && schedule[nextDay].open) {
                    nextDayInfo = schedule[nextDay];
                    break;
                }
            }
            const msg = nextDayInfo ? `Estamos fechados. Abriremos ${nextDayInfo.name} às ${nextDayInfo.start}.` : 'Estamos fechados no momento.';
            return { isOpen: false, message: msg };
        }

        if (currentTime >= todaySchedule.start && currentTime <= todaySchedule.end) {
            return { isOpen: true, message: `Aberto agora! Fechamos às ${todaySchedule.end}.` };
        } else if (currentTime < todaySchedule.start) {
            return { isOpen: false, message: `Estamos fechados. Abriremos hoje às ${todaySchedule.start}.` };
        } else {
            return { isOpen: false, message: 'Já fechamos por hoje. Volte amanhã!' };
        }
    }, [schedule, loading]);

    // O valor provido agora também pode incluir o estado de loading/error se necessário
    const value = { schedule, saveSchedule, isOpen, storeStatusMessage: message, loading, error };

    return (
        <ScheduleContext.Provider value={value}>
            {children}
        </ScheduleContext.Provider>
    );
};