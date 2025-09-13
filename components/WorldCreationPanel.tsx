import React from 'react';
import type { PlayerState } from '../types';
import { PERSONALITY_OPTIONS, TALENT_OPTIONS, TREASURE_OPTIONS } from '../constants';

interface WorldCreationPanelProps {
  playerState: PlayerState;
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>;
}

export const WorldCreationPanel = ({ playerState, setPlayerState }: WorldCreationPanelProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.currentTarget;
    setPlayerState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleTreasureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setPlayerState(prevState => ({ ...prevState, treasures: selectedOptions }));
  };

  return (
    <div className="panel">
      <h2 className="panel-title">KIẾN TẠO THẾ GIỚI</h2>
      
      <div className="form-group">
        <label htmlFor="name">Tên Nhân Vật:</label>
        <input type="text" id="name" name="name" value={playerState.name} onChange={handleChange} className="input" />
      </div>

      <div className="form-group">
        <label htmlFor="personality">Tính Cách:</label>
        <select id="personality" name="personality" value={playerState.personality} onChange={handleChange} className="select">
          {PERSONALITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="talent">Thiên Phú:</label>
        <select id="talent" name="talent" value={playerState.talent} onChange={handleChange} className="select">
          {TALENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>Giới Tính:</label>
        <div className="radio-group">
          <label><input type="radio" name="gender" value="Nam" checked={playerState.gender === 'Nam'} onChange={handleChange} /> Nam</label>
          <label><input type="radio" name="gender" value="Nữ" checked={playerState.gender === 'Nữ'} onChange={handleChange} /> Nữ</label>
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="treasures">Bảo Bối:</label>
        <select id="treasures" name="treasures" value={playerState.treasures} onChange={handleTreasureChange} className="select" multiple size={4}>
          {TREASURE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="difficulty">Độ Khó:</label>
        <select id="difficulty" name="difficulty" value={playerState.difficulty} onChange={handleChange} className="select">
          <option value="Dễ">Dễ</option>
          <option value="Thường">Thường</option>
          <option value="Khó">Khó</option>
          <option value="Ác Mộng">Ác Mộng</option>
          <option value="Địa Ngục">Địa Ngục</option>
        </select>
      </div>

      <div className="form-group">
        <label>Nội dung 18+:</label>
        <div className="radio-group">
          <label><input type="radio" name="nsfw" value="Có" checked={playerState.nsfw === 'Có'} onChange={handleChange} /> Có</label>
          <label><input type="radio" name="nsfw" value="Không" checked={playerState.nsfw === 'Không'} onChange={handleChange} /> Không</label>
        </div>
      </div>
    </div>
  );
};
