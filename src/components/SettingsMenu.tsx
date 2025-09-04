import React from 'react';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '300px',
        height: '100%',
        backgroundColor: '#fff',
        boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
        padding: '24px',
      }}
    >
      <h2>Настройки</h2>
      <ul>
        <li>Профиль</li>
        <li>Тема</li>
        {/* Добавь свои пункты */}
      </ul>
      <button onClick={onClose}>Закрыть</button>
    </div>
  );
};

export default SettingsMenu;
