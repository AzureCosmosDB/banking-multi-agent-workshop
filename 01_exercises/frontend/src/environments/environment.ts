// environment.ts
const codespaceName = (process.env.CODESPACE_NAME || '').trim();

export const environment = {
  production: false,
  apiUrl: codespaceName
    ? `https://${codespaceName}-8000.app.github.dev/`
    : 'http://localhost:8000/',
};
