// Arquivo central para todos os estilos da aplicação.
// Esquema de cores: Vermelho e Branco
const styles = {
  container: { width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 1rem', boxSizing: 'border-box', color: '#1F2937'},
  button: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, padding: '0.5rem 1rem', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  buttonPrimary: { backgroundColor: '#DC2626', color: 'white' },
  buttonSecondary: { backgroundColor: '#FEE2E2', color: '#DC2626', border: '2px solid #DC2626' },
  buttonDestructive: { backgroundColor: '#7F1D1D', color: 'white' },
  buttonGhost: { backgroundColor: 'transparent', boxShadow: 'none' },
  card: { backgroundColor: 'white', borderRadius: '1rem', border: '2px solid #FEE2E2', boxShadow: '0 4px 6px rgba(220, 38, 38, 0.1)' },
  input: {display: 'flex', height: '2.5rem', width: '100%', borderRadius: '0.5rem', border: '2px solid #FCA5A5', backgroundColor: 'white', padding: '0.5rem 0.75rem', fontSize: '0.875rem', boxSizing: 'border-box', color: '#1F2937' },
  label: { fontSize: '0.875rem', fontWeight: 600, color: '#7F1D1D', display: 'block', marginBottom: '0.5rem' },
  modalOverlay: { color: '#1F2937', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 50, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'},
  modalContent: { backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 20px 25px -5px rgba(220, 38, 38, 0.2), 0 10px 10px -5px rgba(220, 38, 38, 0.1)', width: '100%', maxWidth: '500px', margin: 'auto', border: '3px solid #FEE2E2' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '2px solid #FEE2E2', backgroundColor: '#FEF2F2' },
  modalBody: { padding: '1.5rem'},
  table: { width: '100%', fontSize: '0.875rem', textAlign: 'left', color: '#4B5563', borderCollapse: 'collapse' },
  tableHead: { fontSize: '0.75rem', color: 'white', textTransform: 'uppercase', backgroundColor: '#DC2626' },
  tableHeadCell: { padding: '0.75rem 1.5rem' },
  tableBodyRow: { backgroundColor: 'white', borderBottom: '1px solid #FEE2E2' },
  tableBodyCell: { padding: '1rem 1.5rem' },
};

export default styles;