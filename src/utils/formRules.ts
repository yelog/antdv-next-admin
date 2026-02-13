/**
 * Common form validation rules
 */
import { $t } from '@/locales'

export const commonRules = {
  /**
   * Required field
   */
  required: (message = $t('validation.required')) => ({
    required: true,
    message
  }),

  /**
   * Email validation
   */
  email: (message = $t('validation.email')) => ({
    validator: (_: any, value: any) => {
      if (!value) return Promise.resolve()
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(value)) {
        return Promise.resolve()
      }
      return Promise.reject(new Error(message))
    }
  }),

  /**
   * Phone number validation (Chinese)
   */
  phone: (message = $t('validation.phone')) => ({
    validator: (_: any, value: any) => {
      if (!value) return Promise.resolve()
      if (/^1[3-9]\d{9}$/.test(value)) {
        return Promise.resolve()
      }
      return Promise.reject(new Error(message))
    }
  }),

  /**
   * ID card validation (Chinese)
   */
  idCard: (message = $t('validation.idCard')) => ({
    pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
    message
  }),

  /**
   * URL validation
   */
  url: (message = $t('validation.url')) => ({
    type: 'url' as const,
    message
  }),

  /**
   * Length range validation
   */
  length: (min: number, max: number, message?: string) => ({
    min,
    max,
    message: message || $t('validation.lengthRange', { min, max })
  }),

  /**
   * Number range validation
   */
  range: (min: number, max: number, message?: string) => ({
    type: 'number' as const,
    min,
    max,
    message: message || $t('validation.numberRange', { min, max })
  }),

  /**
   * Pattern validation
   */
  pattern: (pattern: RegExp, message: string) => ({
    pattern,
    message
  }),

  /**
   * Custom validator
   */
  validator: (validatorFn: (rule: any, value: any) => Promise<void>) => ({
    validator: validatorFn
  }),

  /**
   * Username validation
   */
  username: (message = $t('validation.usernamePattern')) => ({
    validator: (_: any, value: any) => {
      if (!value) return Promise.resolve()
      if (/^[a-zA-Z0-9_]+$/.test(value)) {
        return Promise.resolve()
      }
      return Promise.reject(new Error(message))
    }
  }),

  /**
   * Password strength validation
   */
  password: (message = $t('validation.passwordPattern')) => ({
    validator: (_: any, value: any) => {
      if (!value) return Promise.resolve()
      if (/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value)) {
        return Promise.resolve()
      }
      return Promise.reject(new Error(message))
    }
  }),

  /**
   * Confirm password validation
   */
  confirmPassword: (getFieldValue: (field: string) => any, message = $t('validation.confirmPassword')) => ({
    validator: (_: any, value: any) => {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve()
      }
      return Promise.reject(new Error(message))
    }
  })
}

/**
 * Create custom validation rule
 */
export function createRule(
  validator: (value: any, formValues: any) => boolean | Promise<boolean>,
  message: string
) {
  return {
    validator: async (_: any, value: any, formValues: any) => {
      const result = await validator(value, formValues)
      if (result) {
        return Promise.resolve()
      }
      return Promise.reject(new Error(message))
    }
  }
}
