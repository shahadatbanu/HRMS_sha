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
  
  var process: {
    env: NodeJS.ProcessEnv;
  };
}

// Declare module for Bootstrap JS to fix TypeScript error
declare module 'bootstrap/dist/js/bootstrap.bundle.min.js' {
  const bootstrap: any;
  export default bootstrap;
}

// Alternative declaration for relative path
declare module '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js' {
  const bootstrap: any;
  export default bootstrap;
}

export {}; 