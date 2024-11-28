import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConfigurations } from '../hooks/useConfigurations';
import { useAuth } from '../contexts/AuthContext';
import type { ConfigurationMeta } from '../types';

// Mock Firebase functions
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockOnSnapshot = vi.fn();

vi.mock('../lib/firebase', () => ({
  db: {
    collection: vi.fn(),
    doc: vi.fn(() => ({
      update: mockUpdateDoc,
      delete: mockDeleteDoc,
    })),
  },
  configurationsRef: {
    where: vi.fn(() => ({
      onSnapshot: mockOnSnapshot,
    })),
  },
}));

// Mock Auth Context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockConfig: ConfigurationMeta = {
  id: 'config1',
  name: 'Test Config',
  userId: 'user1',
  config: {
    plants: [],
    total: { price: 0, totalCapacity: 0 }
  },
  createdAt: '2024-01-01',
  sharedWith: [],
  isPublic: false
};

describe('Configuration Sharing', () => {
  const mockUser = {
    uid: 'user1',
    email: 'user1@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser });
    mockOnSnapshot.mockImplementation((callback) => {
      callback({
        docs: [{
          id: 'config1',
          data: () => mockConfig,
        }],
      });
      return vi.fn(); // Cleanup function
    });
  });

  describe('Basic Configuration Loading', () => {
    test('loads configurations successfully', () => {
      const { result } = renderHook(() => useConfigurations());
      expect(result.current.configurations).toHaveLength(1);
      expect(result.current.configurations[0].id).toBe('config1');
    });

    test('handles unauthorized access', () => {
      (useAuth as any).mockReturnValue({ user: null });
      const { result } = renderHook(() => useConfigurations());
      expect(result.current.configurations).toHaveLength(0);
    });

    test('handles loading state', () => {
      const { result } = renderHook(() => useConfigurations());
      expect(result.current.loading).toBe(false);
    });

    test('handles error state', () => {
      const { result } = renderHook(() => useConfigurations());
      expect(result.current.error).toBe(null);
    });
  });

  describe('Sharing Settings', () => {
    test('updates sharing settings successfully', async () => {
      const { result } = renderHook(() => useConfigurations());
      
      await act(async () => {
        await result.current.updateSharingSettings('config1', {
          sharedWith: [{ uid: 'user2', email: 'user2@example.com', role: 'viewer' }],
          isPublic: true
        });
      });

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          sharedWith: [{ uid: 'user2', email: 'user2@example.com', role: 'viewer' }],
          isPublic: true
        })
      );
    });

    test('prevents non-owners from updating sharing settings', async () => {
      (useAuth as any).mockReturnValue({ user: { uid: 'user2', email: 'user2@example.com' } });
      const { result } = renderHook(() => useConfigurations());

      await expect(result.current.updateSharingSettings('config1', {
        isPublic: true
      })).rejects.toThrow('Only the owner can update sharing settings');
    });
  });

  describe('Access Control', () => {
    test('allows editor to update configuration content', async () => {
      const configWithEditor = {
        ...mockConfig,
        sharedWith: [{ uid: 'user2', email: 'user2@example.com', role: 'editor' }]
      };

      mockOnSnapshot.mockImplementation((callback) => {
        callback({
          docs: [{
            id: 'config1',
            data: () => configWithEditor,
          }],
        });
        return vi.fn();
      });

      (useAuth as any).mockReturnValue({ user: { uid: 'user2', email: 'user2@example.com' } });
      const { result } = renderHook(() => useConfigurations());

      await act(async () => {
        await result.current.updateConfiguration('config1', 'Updated Name', {
          plants: [],
          total: { price: 0, totalCapacity: 0 }
        });
      });

      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    test('prevents viewer from updating configuration', async () => {
      const configWithViewer = {
        ...mockConfig,
        sharedWith: [{ uid: 'user2', email: 'user2@example.com', role: 'viewer' }]
      };

      mockOnSnapshot.mockImplementation((callback) => {
        callback({
          docs: [{
            id: 'config1',
            data: () => configWithViewer,
          }],
        });
        return vi.fn();
      });

      (useAuth as any).mockReturnValue({ user: { uid: 'user2', email: 'user2@example.com' } });
      const { result } = renderHook(() => useConfigurations());

      await expect(result.current.updateConfiguration('config1', 'Updated Name', {
        plants: [],
        total: { price: 0, totalCapacity: 0 }
      })).rejects.toThrow('You do not have permission to update this configuration');
    });
  });

  describe('Configuration Deletion', () => {
    test('allows owner to delete configuration', async () => {
      const { result } = renderHook(() => useConfigurations());

      await act(async () => {
        await result.current.deleteConfiguration('config1');
      });

      expect(mockDeleteDoc).toHaveBeenCalled();
    });

    test('prevents non-owner from deleting configuration', async () => {
      (useAuth as any).mockReturnValue({ user: { uid: 'user2', email: 'user2@example.com' } });
      const { result } = renderHook(() => useConfigurations());

      await expect(result.current.deleteConfiguration('config1')).rejects.toThrow(
        'You do not have permission to delete this configuration'
      );
    });
  });

  describe('Error Handling', () => {
    test('handles Firebase errors when updating sharing settings', async () => {
      mockUpdateDoc.mockRejectedValueOnce(new Error('Firebase error'));
      const { result } = renderHook(() => useConfigurations());

      await expect(result.current.updateSharingSettings('config1', {
        isPublic: true
      })).rejects.toThrow('Failed to update sharing settings: Firebase error');
    });

    test('handles missing configuration errors', async () => {
      mockOnSnapshot.mockImplementation((callback) => {
        callback({ docs: [] });
        return vi.fn();
      });

      const { result } = renderHook(() => useConfigurations());

      await expect(result.current.updateSharingSettings('config1', {
        isPublic: true
      })).rejects.toThrow('Configuration not found');
    });
  });
});