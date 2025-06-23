declare namespace NodeJS {
  interface Timeout {}
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}
declare const process: { env: NodeJS.ProcessEnv };
export {};
