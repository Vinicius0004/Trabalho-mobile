import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Wrapper - Funciona em Web, Android e iOS
 * Usa localStorage para web e AsyncStorage para mobile
 */

const isWeb = Platform.OS === 'web';

class StorageManager {
  /**
   * Salva dados no storage
   */
  async setItem(key, value) {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (isWeb) {
        // Web: usar localStorage
        localStorage.setItem(key, stringValue);
        console.log(`💾 [WEB] Salvou "${key}":`, stringValue.substring(0, 100));
      } else {
        // Mobile: usar AsyncStorage
        await AsyncStorage.setItem(key, stringValue);
        console.log(`💾 [MOBILE] Salvou "${key}":`, stringValue.substring(0, 100));
      }
      return true;
    } catch (error) {
      console.error(`❌ Erro ao salvar "${key}":`, error);
      return false;
    }
  }

  /**
   * Recupera dados do storage
   */
  async getItem(key) {
    try {
      let value;
      
      if (isWeb) {
        // Web: usar localStorage
        value = localStorage.getItem(key);
        console.log(`📦 [WEB] Recuperou "${key}":`, value ? value.substring(0, 100) : 'null');
      } else {
        // Mobile: usar AsyncStorage
        value = await AsyncStorage.getItem(key);
        console.log(`📦 [MOBILE] Recuperou "${key}":`, value ? value.substring(0, 100) : 'null');
      }
      
      return value;
    } catch (error) {
      console.error(`❌ Erro ao recuperar "${key}":`, error);
      return null;
    }
  }

  /**
   * Remove um item do storage
   */
  async removeItem(key) {
    try {
      if (isWeb) {
        // Web: usar localStorage
        localStorage.removeItem(key);
        console.log(`🗑️ [WEB] Removeu "${key}"`);
      } else {
        // Mobile: usar AsyncStorage
        await AsyncStorage.removeItem(key);
        console.log(`🗑️ [MOBILE] Removeu "${key}"`);
      }
      return true;
    } catch (error) {
      console.error(`❌ Erro ao remover "${key}":`, error);
      return false;
    }
  }

  /**
   * Limpa todo o storage
   */
  async clear() {
    try {
      if (isWeb) {
        // Web: limpar apenas as chaves do app
        const keys = ['contacts', 'notes', 'tasks', 'reminders', 'events'];
        keys.forEach(key => localStorage.removeItem(key));
        console.log('🗑️ [WEB] Storage limpo');
      } else {
        // Mobile: limpar AsyncStorage
        await AsyncStorage.clear();
        console.log('🗑️ [MOBILE] Storage limpo');
      }
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar storage:', error);
      return false;
    }
  }

  /**
   * Lista todas as chaves
   */
  async getAllKeys() {
    try {
      if (isWeb) {
        // Web: listar chaves do localStorage
        const keys = Object.keys(localStorage);
        console.log('🔑 [WEB] Chaves:', keys);
        return keys;
      } else {
        // Mobile: listar chaves do AsyncStorage
        const keys = await AsyncStorage.getAllKeys();
        console.log('🔑 [MOBILE] Chaves:', keys);
        return keys;
      }
    } catch (error) {
      console.error('❌ Erro ao listar chaves:', error);
      return [];
    }
  }

  /**
   * Obtém múltiplos itens
   */
  async multiGet(keys) {
    try {
      if (isWeb) {
        // Web: pegar múltiplos itens do localStorage
        const items = keys.map(key => [key, localStorage.getItem(key)]);
        return items;
      } else {
        // Mobile: usar multiGet do AsyncStorage
        return await AsyncStorage.multiGet(keys);
      }
    } catch (error) {
      console.error('❌ Erro ao obter múltiplos itens:', error);
      return [];
    }
  }

  /**
   * Retorna informações sobre a plataforma
   */
  getPlatformInfo() {
    return {
      platform: Platform.OS,
      isWeb: isWeb,
      storageType: isWeb ? 'localStorage' : 'AsyncStorage'
    };
  }
}

// Exporta uma instância única
const storage = new StorageManager();
export default storage;

