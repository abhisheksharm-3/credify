  export class ContentDownloadError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ContentDownloadError';
    }
  }
  
  export class ContentHashError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ContentHashError';
    }
  }
  
  export class ValidationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ValidationError';
    }
  }
  
  export class AuthenticationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AuthenticationError';
    }
  }
  
  export class AuthorizationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AuthorizationError';
    }
  }
  
  export class RateLimitError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'RateLimitError';
    }
  }
  
  export class ExternalServiceError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ExternalServiceError';
    }
  }
  
  export function getErrorStatus(error: unknown): number {
    if (error instanceof ValidationError) return 400;
    if (error instanceof AuthenticationError) return 401;
    if (error instanceof AuthorizationError) return 403;
    if (error instanceof RateLimitError) return 429;
    if (error instanceof ExternalServiceError) return 502;
    return 500;
  }