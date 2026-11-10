// context/SettingsContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [textSize, setTextSize] = useState('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const savedTextSize = await AsyncStorage.getItem('@kb_text_size');
        const savedSound = await AsyncStorage.getItem('@kb_sound_enabled');
        
        if (savedTextSize) setTextSize(savedTextSize);
        if (savedSound !== null) setSoundEnabled(savedSound === 'true');
      } catch (e) {
        console.error("Failed to load settings", e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const updateTextSize = async (size) => {
    setTextSize(size);
    await AsyncStorage.setItem('@kb_text_size', size);
  };

  const updateSoundEnabled = async (enabled) => {
    setSoundEnabled(enabled);
    await AsyncStorage.setItem('@kb_sound_enabled', enabled.toString());
  };

  return (
    <SettingsContext.Provider value={{ textSize, updateTextSize, soundEnabled, updateSoundEnabled, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};