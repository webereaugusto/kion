import React, { useState } from 'react';
import { ContractClause } from '../../types';

interface Props {
  clauses: ContractClause[];
  onChange: (clauses: ContractClause[]) => void;
  isLoading?: boolean;
  onGenerateWithAI?: () => void;
}

const ClauseEditor: React.FC<Props> = ({ clauses, onChange, isLoading, onGenerateWithAI }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditContent(clauses[index].content);
  };

  const handleSave = () => {
    if (editingIndex !== null) {
      const updated = [...clauses];
      updated[editingIndex] = { ...updated[editingIndex], content: editContent };
      onChange(updated);
      setEditingIndex(null);
      setEditContent('');
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditContent('');
  };

  const handleDelete = (index: number) => {
    const updated = clauses.filter((_, i) => i !== index);
    // Reordenar números
    updated.forEach((c, i) => c.number = i + 1);
    onChange(updated);
  };

  const handleAdd = () => {
    const newClause: ContractClause = {
      number: clauses.length + 1,
      title: 'Nova Cláusula',
      content: 'Conteúdo da cláusula...'
    };
    onChange([...clauses, newClause]);
    setEditingIndex(clauses.length);
    setEditContent(newClause.content);
  };

  const handleTitleChange = (index: number, title: string) => {
    const updated = [...clauses];
    updated[index] = { ...updated[index], title };
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...clauses];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    updated.forEach((c, i) => c.number = i + 1);
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === clauses.length - 1) return;
    const updated = [...clauses];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    updated.forEach((c, i) => c.number = i + 1);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header com botões */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">
          <i className="fas fa-list-ol mr-2 text-blue-600"></i>
          Cláusulas do Contrato
        </h3>
        <div className="flex gap-2">
          {onGenerateWithAI && (
            <button
              type="button"
              onClick={onGenerateWithAI}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-bold disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Gerando...
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-2"></i>
                  Gerar com IA
                </>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-bold"
          >
            <i className="fas fa-plus mr-2"></i>
            Adicionar
          </button>
        </div>
      </div>

      {/* Lista de cláusulas */}
      {clauses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <i className="fas fa-file-alt text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 font-bold">Nenhuma cláusula adicionada</p>
          <p className="text-gray-400 text-sm mt-1">
            Clique em "Gerar com IA" ou "Adicionar" para começar
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {clauses.map((clause, index) => (
            <div
              key={`clause-${index}`}
              className={`p-4 rounded-xl border transition-all ${
                clause.isAISuggested 
                  ? 'border-purple-200 bg-purple-50/50' 
                  : 'border-gray-200 bg-white'
              } ${editingIndex === index ? 'ring-2 ring-blue-500' : ''}`}
            >
              {/* Header da cláusula */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {clause.number}
                  </span>
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={clause.title}
                      onChange={(e) => handleTitleChange(index, e.target.value)}
                      className="font-bold text-slate-800 border-b-2 border-blue-500 focus:outline-none bg-transparent"
                    />
                  ) : (
                    <span className="font-bold text-slate-800">{clause.title}</span>
                  )}
                  {clause.isAISuggested && (
                    <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-[10px] font-bold rounded-full uppercase">
                      <i className="fas fa-robot mr-1"></i>
                      IA
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Mover para cima"
                  >
                    <i className="fas fa-chevron-up"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === clauses.length - 1}
                    className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Mover para baixo"
                  >
                    <i className="fas fa-chevron-down"></i>
                  </button>
                  {editingIndex === index ? (
                    <>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="p-1.5 text-emerald-600 hover:text-emerald-700"
                        title="Salvar"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="p-1.5 text-gray-400 hover:text-gray-600"
                        title="Cancelar"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleEdit(index)}
                        className="p-1.5 text-blue-500 hover:text-blue-600"
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(index)}
                        className="p-1.5 text-red-400 hover:text-red-600"
                        title="Excluir"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Conteúdo da cláusula */}
              {editingIndex === index ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm min-h-[120px]"
                  placeholder="Digite o conteúdo da cláusula..."
                />
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {clause.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClauseEditor;
