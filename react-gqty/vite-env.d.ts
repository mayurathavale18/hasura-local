declare global {
  var process: {
    env: {
      PROXY_ENDPOINT?: string;
      HASURA_ENDPOINT?: string;
      NODE_ENV?: string;
      HASURA_ADMIN_SECRET?: string;
    };
  };
}

export {};
