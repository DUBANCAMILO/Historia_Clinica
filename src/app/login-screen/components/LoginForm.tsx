'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Copy, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import LoginSplash from './LoginSplash';

interface LoginFields {
  email: string;
  password: string;
  remember: boolean;
}

const DEMO_CREDENTIALS = {
  email: 'herrgoncor123@gmail.com',
  password: 'NefroHC2026!',
};

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFields>({
    defaultValues: { email: '', password: '', remember: false },
  });

  const copyField = (field: 'email' | 'password') => {
    const val = DEMO_CREDENTIALS[field];
    navigator.clipboard.writeText(val).catch(() => {});
    setValue(field, val);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const autofill = () => {
    setValue('email', DEMO_CREDENTIALS.email);
    setValue('password', DEMO_CREDENTIALS.password);
  };

  const onSubmit = async (data: LoginFields) => {
    setLoginError('');
    setLoading(true);
    // BACKEND INTEGRATION: POST /api/auth/login with { email, password }
    await new Promise((r) => setTimeout(r, 1200));
    if (
      data.email === DEMO_CREDENTIALS.email &&
      data.password === DEMO_CREDENTIALS.password
    ) {
      setShowSplash(true);
    } else {
      setLoading(false);
      setLoginError(
        'Credenciales inválidas — use las cuentas demo abajo para ingresar.'
      );
    }
  };

  return (
    <>
      {showSplash && <LoginSplash onDone={() => router.push('/')} />}

      <div className="w-full max-w-md animate-slide-up">
        {/* Mobile Logo */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <img
            src="/assets/images/WhatsApp_Image_2026-09-04_at_10.38.24-1788743376541.jpeg"
            alt="NefroHC logo"
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div>
            <h1 className="text-primary text-xl font-bold">NefroHC</h1>
            <p className="text-muted-foreground text-xs">Historia Clínica Nefrológica</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Iniciar sesión</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Acceso exclusivo para el consultorio del Dr. González
          </p>
        </div>

        {loginError && (
          <div className="flex items-start gap-2 bg-danger-bg border border-danger/20 text-danger rounded-lg px-4 py-3 mb-5 text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              className={`w-full px-4 py-3 border rounded-lg text-sm bg-card focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all ${
                errors.email ? 'border-danger' : 'border-input'
              }`}
              {...register('email', {
                required: 'El correo es requerido',
                pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' },
              })}
            />
            {errors.email && (
              <p className="text-danger text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full px-4 py-3 border rounded-lg text-sm bg-card pr-12 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all ${
                  errors.password ? 'border-danger' : 'border-input'
                }`}
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-danger text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 accent-accent"
              {...register('remember')}
            />
            <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
              Recordar sesión
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold text-sm hover:bg-accent transition-all duration-150 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Verificando...
              </>
            ) : (
              'Ingresar al sistema'
            )}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-8 bg-muted border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Credenciales de demostración
            </p>
            <button
              onClick={autofill}
              className="text-xs text-accent font-semibold hover:underline"
            >
              Autocompletar
            </button>
          </div>
          <div className="space-y-2">
            {(['email', 'password'] as const).map((field) => (
              <div
                key={`cred-${field}`}
                className="flex items-center justify-between bg-card rounded-lg px-3 py-2 border border-border"
              >
                <div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {field === 'email' ? 'Correo' : 'Contraseña'}:
                  </span>
                  <span className="text-xs font-medium text-foreground ml-2 font-tabular">
                    {field === 'password' ?'••••••••••••'
                      : DEMO_CREDENTIALS[field]}
                  </span>
                </div>
                <button
                  onClick={() => copyField(field)}
                  className="text-muted-foreground hover:text-accent transition-colors ml-2"
                  aria-label={`Copiar ${field}`}
                >
                  {copiedField === field ? (
                    <CheckCircle size={14} className="text-success" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          NefroHC v2.0 · Bucaramanga, Colombia
        </p>
      </div>
    </>
  );
}