import { useState, useEffect } from 'react';
import { 
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  FirebaseError,
  or,
  and,
  getDocs
} from 'firebase/firestore';
import { db, configurationsRef } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { PlantConfig, ConfigurationMeta, SharedUser } from '../types';

const LAST_CONFIG_KEY = 'lastConfigurationId';

export function useConfigurations() {
  const { user } = useAuth();
  const [configurations, setConfigurations] = useState<ConfigurationMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastConfigId, setLastConfigId] = useState<string | null>(
    localStorage.getItem(LAST_CONFIG_KEY)
  );

  useEffect(() => {
    if (!user) {
      setConfigurations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Query for owned or shared configurations
      const q = query(
        configurationsRef,
        or(
          where('userId', '==', user.uid),
          where('sharedWith', 'array-contains', { uid: user.uid })
        )
      );
      
      const unsubscribe = onSnapshot(
        q, 
        (snapshot) => {
          const configs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as ConfigurationMeta[];
          setConfigurations(configs);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error listening to configurations:', err);
          setError('Failed to load configurations. Please try again.');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up configurations listener:', err);
      setError('Failed to initialize configurations. Please refresh the page.');
      setLoading(false);
    }
  }, [user]);

  const saveConfiguration = async (name: string, config: PlantConfig) => {
    if (!user) {
      throw new Error('You must be signed in to save configurations');
    }

    try {
      setError(null);
      const docRef = await addDoc(configurationsRef, {
        name,
        config,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        sharedWith: [],
        isPublic: false
      });
      localStorage.setItem(LAST_CONFIG_KEY, docRef.id);
      setLastConfigId(docRef.id);
      return docRef.id;
    } catch (err) {
      const fbError = err as FirebaseError;
      console.error('Error saving configuration:', fbError);
      throw new Error(`Failed to save configuration: ${fbError.message}`);
    }
  };

  const updateConfiguration = async (
    id: string, 
    name: string, 
    config: PlantConfig,
    sharedWith?: SharedUser[],
    isPublic?: boolean
  ) => {
    if (!user) {
      throw new Error('You must be signed in to update configurations');
    }

    const configDoc = configurations.find(c => c.id === id);
    if (!configDoc) {
      throw new Error('Configuration not found');
    }

    // Check if user has permission to update
    if (configDoc.userId !== user.uid && 
        !configDoc.sharedWith?.some(s => s.uid === user.uid && s.role === 'editor')) {
      throw new Error('You do not have permission to update this configuration');
    }

    try {
      setError(null);
      const docRef = doc(db, 'configurations', id);
      const updateData: any = {
        name,
        config,
        updatedAt: serverTimestamp()
      };

      if (configDoc.userId === user.uid) {
        // Only owner can update sharing settings
        if (sharedWith !== undefined) updateData.sharedWith = sharedWith;
        if (isPublic !== undefined) updateData.isPublic = isPublic;
      }

      await updateDoc(docRef, updateData);
      return true;
    } catch (err) {
      const fbError = err as FirebaseError;
      console.error('Error updating configuration:', fbError);
      throw new Error(`Failed to update configuration: ${fbError.message}`);
    }
  };

  const deleteConfiguration = async (id: string) => {
    if (!user) {
      throw new Error('You must be signed in to delete configurations');
    }

    const configDoc = configurations.find(c => c.id === id);
    if (!configDoc) {
      throw new Error('Configuration not found');
    }

    if (configDoc.userId !== user.uid) {
      throw new Error('You do not have permission to delete this configuration');
    }

    try {
      setError(null);
      await deleteDoc(doc(db, 'configurations', id));
      return true;
    } catch (err) {
      const fbError = err as FirebaseError;
      console.error('Error deleting configuration:', fbError);
      throw new Error(`Failed to delete configuration: ${fbError.message}`);
    }
  };

  const updateSharingSettings = async (
    id: string,
    settings: { sharedWith?: SharedUser[], isPublic?: boolean }
  ) => {
    if (!user) {
      throw new Error('You must be signed in to update sharing settings');
    }

    const configDoc = configurations.find(c => c.id === id);
    if (!configDoc) {
      throw new Error('Configuration not found');
    }

    if (configDoc.userId !== user.uid) {
      throw new Error('Only the owner can update sharing settings');
    }

    try {
      const docRef = doc(db, 'configurations', id);
      await updateDoc(docRef, {
        ...(settings.sharedWith !== undefined && { sharedWith: settings.sharedWith }),
        ...(settings.isPublic !== undefined && { isPublic: settings.isPublic }),
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (err) {
      const fbError = err as FirebaseError;
      console.error('Error updating sharing settings:', fbError);
      throw new Error(`Failed to update sharing settings: ${fbError.message}`);
    }
  };

  return {
    configurations,
    loading,
    error,
    saveConfiguration,
    updateConfiguration,
    deleteConfiguration,
    updateSharingSettings,
    lastConfigId
  };
}