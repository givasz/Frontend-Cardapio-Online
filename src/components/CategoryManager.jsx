import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles';
import { API_BASE_URL } from '../config';
import StyledButton from './StyledButton';
// 1. Importar os ícones, assim como no ItemManager
import { EditIcon, TrashIcon } from './Icons';

const CategoryManager = () => {
    const { token } = useAuth();
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');

    // 2. Estados para controlar a edição
    const [editingCategoryId, setEditingCategoryId] = useState(null); // Guarda o ID da categoria em edição
    const [updatedCategoryName, setUpdatedCategoryName] = useState(''); // Guarda o novo nome da categoria

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/categorias`);
            if (!response.ok) throw new Error('Falha ao buscar categorias.');
            setCategories(await response.json());
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            const response = await fetch(`${API_BASE_URL}/admin/categoria`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ nome: newCategoryName })
            });
            if (!response.ok) throw new Error('Falha ao criar categoria.');
            setNewCategoryName('');
            fetchCategories();
        } catch (err) {
            alert(`❌ Erro ao criar categoria\n\n${err.message}\n\nPor favor, tente novamente.`);
        }
    };

    // 3. Função para DELETAR uma categoria (similar ao ItemManager)
    const handleDelete = async (categoryId) => {
        if (!window.confirm('Tem certeza que deseja excluir esta categoria? Isso pode afetar itens associados a ela.')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/admin/categoria/${categoryId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Falha ao excluir a categoria.');
            }
            fetchCategories(); // Atualiza a lista
        } catch (err) {
            alert(`❌ Erro ao excluir categoria\n\n${err.message}\n\nPor favor, tente novamente.`);
        }
    };

    // 4. Função para ATUALIZAR uma categoria
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!updatedCategoryName.trim() || !editingCategoryId) return;
        try {
            const response = await fetch(`${API_BASE_URL}/admin/categoria/${editingCategoryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ nome: updatedCategoryName })
            });
             if (!response.ok) throw new Error('Falha ao atualizar a categoria.');
             setEditingCategoryId(null); // Sai do modo de edição
             setUpdatedCategoryName('');
             fetchCategories(); // Atualiza a lista
        } catch (err) {
             alert(`❌ Erro ao atualizar categoria\n\n${err.message}\n\nPor favor, tente novamente.`);
        }
    };

    // 5. Funções auxiliares para entrar e sair do modo de edição
    const handleStartEdit = (category) => {
        setEditingCategoryId(category.id);
        setUpdatedCategoryName(category.nome);
    };

    const handleCancelEdit = () => {
        setEditingCategoryId(null);
        setUpdatedCategoryName('');
    };


    return (
        <div style={styles.card}>
            <div style={{ ...styles.input, padding: '1.5rem', border: 'none', height: 'auto', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 500 }}>Categorias</h3>
                <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Nome da nova categoria" style={{ ...styles.input, flexGrow: 1 }} />
                    <StyledButton type="submit">Adicionar</StyledButton>
                </form>
            </div>
            <div style={{ borderTop: '1px solid #E5E7EB' }}>
                {isLoading ? <p style={{ padding: '1.5rem' }}>Carregando...</p> : error ? <p style={{ padding: '1.5rem', color: 'red' }}>{error}</p> : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {categories.map((cat, index) => (
                            <li key={cat.id} style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: index < categories.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                                {/* 6. Lógica de renderização condicional: ou mostra o nome, ou mostra o formulário de edição */}
                                {editingCategoryId === cat.id ? (
                                    <form onSubmit={handleUpdate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                                        <input 
                                           value={updatedCategoryName} 
                                           onChange={(e) => setUpdatedCategoryName(e.target.value)} 
                                           style={{ ...styles.input, flexGrow: 1 }}
                                           autoFocus
                                        />
                                        <StyledButton type="submit">Salvar</StyledButton>
                                        <StyledButton variant="secondary" type="button" onClick={handleCancelEdit}>Cancelar</StyledButton>
                                    </form>
                                ) : (
                                    <>
                                        <span style={{ color: 'black' }}>{cat.nome}</span>
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            <StyledButton variant="ghost" onClick={() => handleStartEdit(cat)} title="Editar categoria">
                                                <EditIcon style={{ color: '#777777ff', width: '1.25rem', height: '1.25rem' }} />
                                            </StyledButton>
                                            <StyledButton variant="ghost" onClick={() => handleDelete(cat.id)} title="Excluir categoria" style={{ color: '#DC2626' }}>
                                                <TrashIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                                            </StyledButton>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default CategoryManager;