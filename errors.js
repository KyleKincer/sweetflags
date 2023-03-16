class FlagNotFoundError extends Error {
    constructor(message) {
      super(message);
      this.name = 'FlagNotFoundError';
      this.statusCode = 404;
    }
  }
  
  class AppNotFoundError extends Error {
    constructor(message) {
      super(message);
      this.name = 'AppNotFoundError';
      this.statusCode = 404;
    }
  }

  class EnvironmentNotFoundError extends Error {
    constructor(message) {
      super(message);
      this.name = 'AppNotFoundError';
      this.statusCode = 404;
    }
  }
  
  module.exports = { FlagNotFoundError, AppNotFoundError, EnvironmentNotFoundError };  