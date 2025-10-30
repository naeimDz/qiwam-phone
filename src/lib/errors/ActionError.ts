// ============================================
// 📁 lib/errors/ActionError.ts
// ============================================
export class ActionError extends Error {
  constructor(
    readonly code: string,
    readonly message: string,
    readonly statusCode: number = 400
  ) {
    super(message)
    this.name = 'ActionError'
  }
}

export class AuthError extends ActionError {
  constructor() {
    super('UNAUTHORIZED', 'لا يوجد متجر مرتبط بحسابك', 401)
  }
}

export class ValidationError extends ActionError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 422)
  }
}

export class NotFoundError extends ActionError {
  constructor(resource: string = 'المورد') {
    super('NOT_FOUND', `${resource} غير موجود`, 404)
  }
}