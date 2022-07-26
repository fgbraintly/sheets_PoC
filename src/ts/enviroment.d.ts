declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLIENT_ID: number;
      CLIENT_SECRET: string;
      GRANT_TYPE: string;
      PASSWORD: string;
      USERNAME: string;
    }
  }
}

export {};
