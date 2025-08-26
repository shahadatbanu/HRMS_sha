declare global {
  interface Window {
    __REACT_APP_API_URL__?: string;
    __REACT_APP_BACKEND_URL__?: string;
  }
  
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_BACKEND_URL?: string;
      REACT_APP_API_URL?: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {}; 