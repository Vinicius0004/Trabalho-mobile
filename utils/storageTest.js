import storage from './storage';

/**
 * Testa se o Storage está funcionando corretamente
 */
export const testAsyncStorage = async () => {
  try {
    const platform = storage.getPlatformInfo();
    console.log('🧪 Iniciando teste do Storage...');
    console.log('📱 Plataforma:', platform.platform);
    console.log('💾 Tipo de Storage:', platform.storageType);
    
    // Teste 1: Salvar dados
    const testData = { test: 'Hello Storage', timestamp: Date.now() };
    await storage.setItem('test_key', JSON.stringify(testData));
    console.log('✅ Teste 1: Dados salvos com sucesso');
    
    // Teste 2: Recuperar dados
    const retrievedData = await storage.getItem('test_key');
    console.log('✅ Teste 2: Dados recuperados:', retrievedData);
    
    // Teste 3: Verificar se os dados estão corretos
    const parsedData = JSON.parse(retrievedData);
    if (parsedData.test === 'Hello Storage') {
      console.log('✅ Teste 3: Dados estão corretos!');
    } else {
      console.log('❌ Teste 3: Dados incorretos!');
      return false;
    }
    
    // Teste 4: Limpar dados de teste
    await storage.removeItem('test_key');
    console.log('✅ Teste 4: Dados de teste removidos');
    
    console.log(`🎉 Todos os testes do ${platform.storageType} passaram!`);
    return true;
  } catch (error) {
    console.error('❌ Erro no teste do Storage:', error);
    return false;
  }
};

/**
 * Lista todas as chaves salvas no Storage
 */
export const listAllStorageKeys = async () => {
  try {
    const keys = await storage.getAllKeys();
    console.log('🔑 Chaves no Storage:', keys);
    
    // Filtrar apenas as chaves do app
    const appKeys = keys.filter(key => 
      ['contacts', 'notes', 'tasks', 'reminders', 'events'].includes(key)
    );
    
    console.log('📱 Chaves do App:', appKeys);
    
    for (const key of appKeys) {
      const value = await storage.getItem(key);
      if (value) {
        try {
          const parsed = JSON.parse(value);
          console.log(`📦 ${key}: ${parsed.length} itens`);
        } catch {
          console.log(`📦 ${key}:`, value.substring(0, 50));
        }
      }
    }
    
    return appKeys;
  } catch (error) {
    console.error('❌ Erro ao listar chaves:', error);
    return [];
  }
};

/**
 * Limpa todos os dados do Storage
 */
export const clearAllStorage = async () => {
  try {
    console.log('🗑️ Limpando todo o Storage...');
    const success = await storage.clear();
    if (success) {
      console.log('✅ Storage limpo com sucesso!');
    }
    return success;
  } catch (error) {
    console.error('❌ Erro ao limpar Storage:', error);
    return false;
  }
};

/**
 * Verifica o status de cada contexto
 */
export const checkAllContextData = async () => {
  try {
    console.log('🔍 Verificando dados de todos os contextos...');
    console.log('📱 Plataforma:', storage.getPlatformInfo().platform);
    
    const contexts = ['contacts', 'notes', 'tasks', 'reminders', 'events'];
    let totalItems = 0;
    
    for (const context of contexts) {
      const data = await storage.getItem(context);
      if (data && data !== 'null' && data !== '[]') {
        try {
          const parsed = JSON.parse(data);
          console.log(`✅ ${context}: ${parsed.length} itens salvos`);
          totalItems += parsed.length;
        } catch (error) {
          console.log(`⚠️ ${context}: Dados inválidos`);
        }
      } else {
        console.log(`ℹ️ ${context}: Nenhum dado salvo`);
      }
    }
    
    console.log(`📊 Total: ${totalItems} itens salvos`);
  } catch (error) {
    console.error('❌ Erro ao verificar dados dos contextos:', error);
  }
};

