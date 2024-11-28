import { useState } from 'react';
import { Trash2, Edit, Loader2, Share2, Globe, Lock, Users, Plus } from 'lucide-react';
import { useConfigurations } from '../hooks/useConfigurations';
import { useAuth } from '../contexts/AuthContext';
import { ShareConfigModal } from './ShareConfigModal';
import type { PlantConfig, ConfigurationMeta } from '../types';

interface ConfigurationsListProps {
  onLoad: (config: PlantConfig, configId: string, name: string) => void;
  onEdit: (id: string, name: string) => void;
  onNew: () => void;
  currentConfigId?: string | null;
}

export function ConfigurationsList({
  onLoad,
  onEdit,
  onNew,
  currentConfigId
}: ConfigurationsListProps) {
  const { user } = useAuth();
  const { configurations, deleteConfiguration, loading, error } = useConfigurations();
  const [shareModalConfig, setShareModalConfig] = useState<ConfigurationMeta | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 text-gray-500">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        Loading configurations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <div className="text-red-500 mb-2">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh page
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-gray-500 py-4">
        Sign in to view saved configurations
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    try {
      setDeleteError(null);
      await deleteConfiguration(id);
    } catch (err) {
      console.error('Failed to delete configuration:', err);
      setDeleteError('Failed to delete configuration. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onNew}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Plus className="w-4 h-4 mr-2" />
        Start New Configuration
      </button>

      {deleteError && (
        <div className="text-sm text-red-600 mb-4">
          {deleteError}
        </div>
      )}

      {configurations.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          No saved configurations
        </div>
      ) : (
        <div className="space-y-2">
          {configurations.map((config) => {
            const isOwner = config.userId === user?.uid;
            const userRole = config.sharedWith?.find(s => s.uid === user?.uid)?.role;

            return (
              <div
                key={config.id}
                className={`flex items-center justify-between p-3 bg-white rounded-lg border transition-all ${
                  currentConfigId === config.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <button
                  onClick={() => onLoad(config.config, config.id, config.name)}
                  className={`flex-1 text-left ${
                    currentConfigId === config.id
                      ? 'text-blue-700 font-medium'
                      : 'text-gray-900 hover:text-blue-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{config.name}</span>
                    {config.isPublic && (
                      <Globe className="w-4 h-4 text-gray-400" />
                    )}
                    {!config.isPublic && config.sharedWith?.length > 0 && (
                      <Users className="w-4 h-4 text-gray-400" />
                    )}
                    {!config.isPublic && !config.sharedWith?.length && (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  {!isOwner && (
                    <div className="text-xs text-gray-500 mt-1">
                      Shared with you ({userRole})
                    </div>
                  )}
                </button>
                <div className="flex space-x-2">
                  {isOwner && (
                    <button
                      onClick={() => setShareModalConfig(config)}
                      className={`p-1 ${
                        currentConfigId === config.id
                          ? 'text-blue-600 hover:text-blue-800'
                          : 'text-gray-400 hover:text-blue-600'
                      }`}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}
                  {(isOwner || userRole === 'editor') && (
                    <button
                      onClick={() => onEdit(config.id, config.name)}
                      className={`p-1 ${
                        currentConfigId === config.id
                          ? 'text-blue-600 hover:text-blue-800'
                          : 'text-gray-400 hover:text-blue-600'
                      }`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(config.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {shareModalConfig && (
        <ShareConfigModal
          config={shareModalConfig}
          onClose={() => setShareModalConfig(null)}
        />
      )}
    </div>
  );
}