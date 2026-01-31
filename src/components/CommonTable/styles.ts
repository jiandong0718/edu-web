import type { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
  container: {
    background: '#111827',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  },

  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },

  toolbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },

  searchInput: {
    width: 280,
    background: '#1a2332',
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },

  button: {
    background: 'rgba(0, 212, 255, 0.1)',
    border: '1px solid rgba(0, 212, 255, 0.3)',
    color: '#00d4ff',
    transition: 'all 0.3s ease',
  },

  primaryButton: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: 'none',
    color: '#fff',
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
    transition: 'all 0.3s ease',
  },

  iconButton: {
    background: 'rgba(0, 212, 255, 0.1)',
    border: '1px solid rgba(0, 212, 255, 0.3)',
    color: '#00d4ff',
    width: 32,
    height: 32,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  badge: {
    background: 'rgba(0, 212, 255, 0.2)',
    color: '#00d4ff',
    border: '1px solid rgba(0, 212, 255, 0.3)',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 500,
  },

  columnSettingModal: {
    background: '#111827',
  },

  columnSettingItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: 'rgba(0, 212, 255, 0.05)',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 6,
    marginBottom: 8,
    cursor: 'move',
    transition: 'all 0.2s ease',
  },

  columnSettingItemHover: {
    background: 'rgba(0, 212, 255, 0.1)',
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },

  emptyState: {
    padding: '60px 0',
    textAlign: 'center' as const,
    color: 'rgba(255, 255, 255, 0.45)',
  },

  emptyIcon: {
    fontSize: 64,
    color: 'rgba(0, 212, 255, 0.2)',
    marginBottom: 16,
  },

  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.45)',
  },
};
