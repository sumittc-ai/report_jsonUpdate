import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  type ApiEnvironment,
  API_ENVIRONMENTS,
  getStoredEnvironment,
  setStoredEnvironment,
  getApiBaseUrl,
} from '../config/apiConfig';

interface EnvironmentContextValue {
  environment: ApiEnvironment;
  setEnvironment: (env: ApiEnvironment) => void;
  baseUrl: string;
  envInfo: typeof API_ENVIRONMENTS[ApiEnvironment];
  environments: typeof API_ENVIRONMENTS;
}

const EnvironmentContext = createContext<EnvironmentContextValue | null>(null);

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [environment, setEnvState] = useState<ApiEnvironment>(getStoredEnvironment);

  useEffect(() => {
    const handleEnvChanged = (e: Event) => {
      const customEvent = e as CustomEvent<ApiEnvironment>;
      if (customEvent.detail && (customEvent.detail === 'QA' || customEvent.detail === 'PROD')) {
        setEnvState(customEvent.detail);
      }
    };

    window.addEventListener('api-environment-changed', handleEnvChanged);
    return () => window.removeEventListener('api-environment-changed', handleEnvChanged);
  }, []);

  const handleSetEnvironment = (env: ApiEnvironment) => {
    setStoredEnvironment(env);
    setEnvState(env);
  };

  const baseUrl = API_ENVIRONMENTS[environment].url;
  const envInfo = API_ENVIRONMENTS[environment];

  return (
    <EnvironmentContext.Provider
      value={{
        environment,
        setEnvironment: handleSetEnvironment,
        baseUrl,
        envInfo,
        environments: API_ENVIRONMENTS,
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const ctx = useContext(EnvironmentContext);
  if (!ctx) {
    // Fallback if rendered outside EnvironmentProvider
    const env = getStoredEnvironment();
    return {
      environment: env,
      setEnvironment: setStoredEnvironment,
      baseUrl: getApiBaseUrl(),
      envInfo: API_ENVIRONMENTS[env],
      environments: API_ENVIRONMENTS,
    };
  }
  return ctx;
}
