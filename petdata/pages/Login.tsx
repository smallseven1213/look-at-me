import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useUserStore } from "../hooks/useUserStore";
import { loginService } from "../services/authService";
import Input from "../components/Input";
import Button from "../components/Button";
import { User } from "../types";

interface FormInputs {
  account: string;
  password: string;
}

const Login: React.FC = () => {
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
  } = useForm<FormInputs>({ mode: "onChange" });
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (data: FormInputs) => {
    try {
      const token = await loginService({
        email: data.account,
        password: data.password,
      });
      if (token && token !== "") {
        setUser({ token });
        navigate("/app/dashboard");
      }
    } catch (error) {
      console.error("登入失敗", error);
      setError("登入失敗，請檢查帳號密碼");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          寵資業務後台
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleFormSubmit(onSubmit)}>
            <Input
              label="帳號"
              type="text"
              className="mb-4"
              error={errors.account?.message}
              {...register("account", {
                required: "電子郵件不能為空",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "請輸入有效的電子郵件地址",
                },
              })}
            />
            <Input
              label="密碼"
              type="password"
              className="mb-6"
              error={errors.password?.message}
              {...register("password", {
                required: "密碼不能為空",
                minLength: {
                  value: 6,
                  message: "密碼至少需要 6 個字元",
                },
              })}
            />
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="flex">
              <Button className="w-full" variant="secondary" size="lg">
                登入
              </Button>
              {/* <div className="w-4" />
              <Button
                className="w-full"
                variant="primary"
                outline
                size="lg"
                onClick={() => {
                  // 用react-router-dom進"/app/card"
                  navigate("/app/card");
                }}
              >
                登入(Demo)
              </Button> */}
            </div>
          </form>
          {/* <div className="mt-6 flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot"
                className="font-medium text-primary-400 hover:text-primary-500"
              >
                忘記帳號密碼?
              </Link>
            </div>
            <div className="text-sm">
              <Link
                to="/register"
                className="font-medium text-primary-400 hover:text-primary-500"
              >
                沒有帳號? 按此註冊
              </Link>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
