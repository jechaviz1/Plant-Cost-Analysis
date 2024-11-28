import { useState } from 'react';
import { X, Plus, Loader2, Trash2 } from 'lucide-react';
import { useConfigurations } from '../hooks/useConfigurations';
import type { ConfigurationMeta, SharedUser } from '../types';

interface ShareConfigModalProps {
  config: ConfigurationMeta;
  onClose: () => void;
}

export function ShareConfigModal({ config, onClose }: ShareConfigModalProps) {
  const { updateSharingSettings } = useConfigurations();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const [isPublic, setIsPublic] = useState(config.isPublic || false);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>(config.sharedWith || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddUser = () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    if (sharedUsers.some(user => user.email === email)) {
      setError('This user has already been added');
      return;
    }

    setSharedUsers([...sharedUsers, { uid: email, email, role }]);
    setEmail('');
    setRole('viewer');
    setError(null);
  };

  const handleRemoveUser = (email: string) => {
    setSharedUsers(sharedUsers.filter(user => user.email !== email));
  };

  const handleUpdateRole = (email: string, newRole: 'viewer' | 'editor') => {
    setSharedUsers(sharedUsers.map(user =>
      user.email === email ? { ...user, role: newRole } : user
    ));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await updateSharingSettings(config.id, {
        sharedWith: sharedUsers,
        isPublic
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update sharing settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Share Configuration
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Make this configuration public</span>
            </label>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Share with specific people</h4>

            <div className="flex space-x-2 mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'viewer' | 'editor')}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
              <button
                onClick={handleAddUser}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="text-sm text-red-600 mb-4">
                {error}
              </div>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sharedUsers.map((user) => (
                <div
                  key={user.email}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{user.email}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.email, e.target.value as 'viewer' | 'editor')}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                    <button
                      onClick={() => handleRemoveUser(user.email)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}