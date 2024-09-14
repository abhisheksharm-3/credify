// File: src/lib/errors.ts

export class BaseError extends Error {
    constructor(message: string) {
      super(message);
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class ContentDownloadError extends BaseError {
    constructor(message: string) {
      super(message);
    }
  }
  
  export class ContentHashError extends BaseError {
    constructor(message: string) {
      super(message);
    }
  }
  
  export class DatabaseError extends BaseError {
    constructor(message: string) {
      super(message);
    }
  }
  
  export class ValidationError extends BaseError {
    constructor(message: string) {
      super(message);
    }
  }
  
  export class AuthenticationError extends BaseError {
    constructor(message: string) {
      super(message);
    }
  }
  
  export class AuthorizationError extends BaseError {
    constructor(message: string) {
      super(message);
    }
  }
  
  export class RateLimitError extends BaseError {
    constructor(message: string) {
      super(message);
    }
  }
  
  export class ExternalServiceError extends BaseError {
    constructor(message: string) {
      super(message);
    }
  }