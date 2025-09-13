import React, { useState } from 'react';
import type { ObjectState } from '../types';
import { PERSONALITY_OPTIONS, TALENT_OPTIONS } from '../constants';

interface ObjectItemProps {
  item: ObjectState;
  updateObject: (id: number, updatedItem: ObjectState) => void;
  removeObject: (id: number) => void;
}

const ObjectItem = ({ item, updateObject, removeObject }: ObjectItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.currentTarget;
    if (e.currentTarget.type === 'radio') {
      updateObject(item.id, { ...item, gender: value as 'Nam' | 'Nữ' | '' });
    } else {
      updateObject(item.id, { ...item, [name]: value });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the header click from firing
    removeObject(item.id);
  }
  
  return (
    <div className={`object-item ${isExpanded ? 'expanded' : ''}`}>
      <div className="object-item-header" onClick={() => setIsExpanded(!isExpanded)} role="button" tabIndex={0} aria-expanded={isExpanded}>
        <span className="object-item-title">
          Vật Thể {item.id}
          {item.name && <span className="object-item-name-preview">: {item.name}</span>}
        </span>
        <div className="object-item-controls">
           <span className="expand-indicator">{isExpanded ? 'Thu gọn ▲' : 'Chi tiết ▼'}</span>
           <button className="delete-btn" onClick={handleDelete} aria-label={`Xóa Vật Thể ${item.id}`}>X</button>
        </div>
      </div>
      <div className="object-item-details">
        <div className="form-group">
          <label htmlFor={`obj-name-${item.id}`}>Tên:</label>
          <input type="text" id={`obj-name-${item.id}`} name="name" value={item.name} onChange={handleChange} className="input" />
        </div>
        <div className="form-group">
          <label htmlFor={`obj-relationship-${item.id}`}>Mối quan hệ (Ví dụ: Cha, mẹ, kẻ thù):</label>
          <input type="text" id={`obj-relationship-${item.id}`} name="relationship" value={item.relationship} onChange={handleChange} className="input" />
        </div>
        <div className="form-group">
          <label htmlFor={`obj-personality-${item.id}`}>Tính Cách:</label>
          <select id={`obj-personality-${item.id}`} name="personality" value={item.personality} onChange={handleChange} className="select">
            {PERSONALITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor={`obj-talent-${item.id}`}>Thiên Phú:</label>
          <select id={`obj-talent-${item.id}`} name="talent" value={item.talent} onChange={handleChange} className="select">
            {TALENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Giới Tính:</label>
          <div className="radio-group">
            <label><input type="radio" name={`gender-${item.id}`} value="Nam" checked={item.gender === 'Nam'} onChange={handleChange} /> Nam</label>
            <label><input type="radio" name={`gender-${item.id}`} value="Nữ" checked={item.gender === 'Nữ'} onChange={handleChange} /> Nữ</label>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor={`obj-desc-${item.id}`}>Mô tả:</label>
          <textarea id={`obj-desc-${item.id}`} name="description" value={item.description} onChange={handleChange} className="input" rows={2}></textarea>
        </div>
      </div>
    </div>
  );
};

interface ObjectCreationPanelProps {
  objects: ObjectState[];
  setObjects: React.Dispatch<React.SetStateAction<ObjectState[]>>;
}

export const ObjectCreationPanel = ({ objects, setObjects }: ObjectCreationPanelProps) => {
  const addObject = () => {
    const newId = objects.length > 0 ? Math.max(...objects.map(o => o.id)) + 1 : 1;
    setObjects([...objects, {
      id: newId,
      name: '',
      relationship: '',
      personality: PERSONALITY_OPTIONS[0],
      talent: TALENT_OPTIONS[0],
      gender: '',
      description: '',
    }]);
  };
  
  const removeObject = (idToRemove: number) => {
    setObjects(objects.filter(item => item.id !== idToRemove));
  };

  const updateObject = (id: number, updatedItem: ObjectState) => {
    setObjects(objects.map(item => item.id === id ? updatedItem : item));
  };
  
  return (
    <div className="panel">
      <h2 className="panel-title">KIẾN TẠO VẬT THỂ</h2>
      <button className="btn btn-primary add-object-btn" onClick={addObject}>Thêm Vật Thể Mới +</button>
      <div className="object-list">
        {objects.map((item: ObjectState) => (
          <ObjectItem key={item.id} item={item} updateObject={updateObject} removeObject={removeObject} />
        ))}
      </div>
    </div>
  );
};