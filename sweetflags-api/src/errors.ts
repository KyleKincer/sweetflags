class FlagNotFoundError extends Error {
  statusCode: number;

  constructor(message: string) {
      super(message);
      this.name = 'FlagNotFoundError';
      this.statusCode = 404;
  }
}

class AppNotFoundError extends Error {
  statusCode: number;

  constructor(message: string) {
      super(message);
      this.name = 'AppNotFoundError';
      this.statusCode = 404;
  }
}

class EnvironmentNotFoundError extends Error {
  statusCode: number;

  constructor(message: string) {
      super(message);
      this.name = 'EnvironmentNotFoundError';
      this.statusCode = 404;
  }
}

export { FlagNotFoundError, AppNotFoundError, EnvironmentNotFoundError };