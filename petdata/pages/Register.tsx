// Register.tsx
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Input from '../components/Input'
import Button from '../components/Button'

interface FormInputs {
  account: string
  password: string
  confirmPassword: string
}

const Register: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormInputs>({ mode: 'onChange' })
  const navigate = useNavigate()

  const onSubmit = async (data: FormInputs) => {
    try {
      // TODO: 在此处处理注册逻辑
      console.log('注册成功', data)
      // 注册成功后，您可以导航到登录页或其他页面
      navigate('/login')
    } catch (error) {
      console.error('注册失败', error)
      alert('注册失败，请重试')
    }
  }

  // 获取密码字段的值，以用于确认密码的验证
  const passwordValue = watch('password')

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">寵資業務後台</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="帳號"
              type="text"
              className="mb-4"
              error={errors.account?.message}
              {...register('account', {
                required: '電子郵件不能為空',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: '請輸入有效的電子郵件地址',
                },
              })}
            />
            <Input
              label="密碼"
              type="password"
              className="mb-4"
              error={errors.password?.message}
              {...register('password', {
                required: '密碼不能為空',
                minLength: {
                  value: 6,
                  message: '密碼至少需要 6 個字元',
                },
              })}
            />
            <Input
              label="確認密碼"
              type="password"
              className="mb-6"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: '請再次輸入密碼',
                validate: value => value === passwordValue || '兩次輸入的密碼不一致',
              })}
            />
            <Button className="w-full" variant="primary" size="lg">
              註冊會員
            </Button>
          </form>
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot" className="font-medium text-primary-400 hover:text-primary-500">
                忘記帳號密碼?
              </Link>
            </div>
            <div className="text-sm">
              <Link to="/login" className="font-medium text-primary-400 hover:text-primary-500">
                已有帳號? 按此登入
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
