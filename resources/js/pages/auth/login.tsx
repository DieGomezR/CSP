import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Welcome Back" description="Sign in to manage your family calendar">
            <Head title="Log in" />

            <form className="flex flex-col gap-7" onSubmit={submit}>
                <div className="grid gap-7">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="justify-center text-center text-[1.3rem] font-black text-slate-900">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="your@email.com"
                            className="h-14 rounded-[1rem] border-[#d9e7f0] bg-white px-4 text-[1.05rem] shadow-none"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="justify-center text-center text-[1.3rem] font-black text-slate-900">
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Your password"
                                className="h-14 rounded-[1rem] border-[#d9e7f0] bg-white px-4 pr-14 text-[1.05rem] shadow-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((value) => !value)}
                                className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                            >
                                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    {canResetPassword && (
                        <div className="text-center">
                            <Link
                                href={route('password.request')}
                                className="text-[1.05rem] font-medium text-[#67d2c3] transition hover:text-[#4abfae]"
                                tabIndex={5}
                            >
                                Forgot password?
                            </Link>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="mt-1 h-14 w-full rounded-[1rem] bg-[linear-gradient(90deg,#67d2c3_0%,#68c8bd_100%)] text-[1.15rem] font-black text-slate-900 shadow-none"
                        tabIndex={4}
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Sign In
                    </Button>
                </div>

                <div className="text-center text-[1.05rem] text-slate-500">
                    Don&apos;t have an account?{' '}
                    <Link href={route('register')} tabIndex={5} className="font-semibold text-[#67d2c3] transition hover:text-[#4abfae]">
                        Create one
                    </Link>
                </div>
            </form>

            {status && <div className="mt-6 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
