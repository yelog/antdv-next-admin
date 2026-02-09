/**
 * Common form validation rules
 */

export const commonRules = {
  /**
   * Required field
   */
  required: (message = '此项为必填项') => ({
    required: true,
    message
  }),

  /**
   * Email validation
   */
  email: (message = '请输入有效的邮箱地址') => ({
    type: 'email' as const,
    message
  }),

  /**
   * Phone number validation (Chinese)
   */
  phone: (message = '请输入有效的手机号') => ({
    pattern: /^1[3-9]\d{9}$/,
    message
  }),

  /**
   * ID card validation (Chinese)
   */
  idCard: (message = '请输入有效的身份证号') => ({
    pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
    message
  }),

  /**
   * URL validation
   */
  url: (message = '请输入有效的URL') => ({
    type: 'url' as const,
    message
  }),

  /**
   * Length range validation
   */
  length: (min: number, max: number, message?: string) => ({
    min,
    max,
    message: message || `长度必须在${min}-${max}之间`
  }),

  /**
   * Number range validation
   */
  range: (min: number, max: number, message?: string) => ({
    type: 'number' as const,
    min,
    max,
    message: message || `数值必须在${min}-${max}之间`
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
  username: (message = '用户名只能包含字母、数字和下划线') => ({
    pattern: /^[a-zA-Z0-9_]+$/,
    message
  }),

  /**
   * Password strength validation
   */
  password: (message = '密码至少8位，包含字母和数字') => ({
    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
    message
  }),

  /**
   * Confirm password validation
   */
  confirmPassword: (getFieldValue: (field: string) => any, message = '两次输入的密码不一致') => ({
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
