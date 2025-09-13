import React, { useState } from 'react';

interface ApiKeyScreenProps {
  onApiKeySubmit: (apiKey: string) => void;
}

export const ApiKeyScreen = ({ onApiKeySubmit }: ApiKeyScreenProps) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <main className="api-key-screen">
      <h1>Nhập API Key Gemini</h1>
      <p>Để bắt đầu cuộc phiêu lưu, vui lòng nhập API Key Google Gemini của bạn. API key sẽ chỉ được lưu trong phiên truy cập này.</p>
      <form onSubmit={handleSubmit} className="api-key-form">
        <input
          type="password"
          className="input"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Nhập API Key của bạn tại đây"
          aria-label="Gemini API Key"
          required
        />
        <button type="submit" className="btn btn-primary" disabled={!apiKey.trim()}>
          Bắt Đầu Cuộc Phiêu Lưu
        </button>
      </form>
    </main>
  );
};
