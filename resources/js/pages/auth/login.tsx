import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface LoginForm {
    [key: string]: string | boolean;
    email: string;
    password: string;
    remember: boolean;
    invite_token: string;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    invitation?: {
        token: string;
        email: string;
        family_name: string | null;
    } | null;
}

export default function Login({ status, canResetPassword, invitation }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: invitation?.email ?? '',
        password: '',
        remember: false,
        invite_token: invitation?.token ?? '',
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

            <form className="flex w-full flex-col gap-4 px-4 sm:gap-6 md:gap-7" onSubmit={submit}>
                <div className="grid w-full gap-5 sm:gap-6 md:gap-7">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="justify-center text-center text-lg font-black text-slate-900 sm:text-xl md:text-[1.3rem]">
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
                            className="h-12 w-full rounded-[1rem] border-[#d9e7f0] bg-white px-4 text-base shadow-none sm:h-14 sm:text-[1.05rem] md:text-[1.05rem]"
                            disabled={processing || Boolean(invitation)}
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="justify-center text-center text-lg font-black text-slate-900 sm:text-xl md:text-[1.3rem]">
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
                                className="h-12 w-full rounded-[1rem] border-[#d9e7f0] bg-white px-4 pr-14 text-base shadow-none sm:h-14 sm:text-[1.05rem] md:text-[1.05rem]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((value) => !value)}
                                className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    {invitation && (
                        <div className="rounded-[1rem] border border-[#d9e7f0] bg-[#eef8ff] px-4 py-3 text-center text-xs leading-5 text-slate-600 sm:rounded-[1.2rem] sm:px-5 sm:py-4 sm:text-sm sm:leading-6">
                            Sign in with <span className="font-black text-slate-900">{invitation.email}</span> to join{' '}
                            <span className="font-black text-slate-900">{invitation.family_name}</span>.
                        </div>
                    )}

                    {canResetPassword && (
                        <div className="text-center">
                            <Link
                                href={route('password.request')}
                                className="text-base font-medium text-[#67d2c3] transition hover:text-[#4abfae] sm:text-[1.05rem]"
                                tabIndex={5}
                            >
                                Forgot password?
                            </Link>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="min-h-11 h-12 w-full rounded-[1rem] bg-[linear-gradient(90deg,#67d2c3_0%,#68c8bd_100%)] text-base font-black text-slate-900 shadow-none sm:h-14 sm:text-[1.15rem] md:text-[1.15rem]"
                        tabIndex={4}
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Sign In
                    </Button>
                </div>

                <div className="text-center text-base text-slate-500 sm:text-[1.05rem]">
                    Don&apos;t have an account?{' '}
                    <Link
                        href={invitation ? route('register', { invite: invitation.token }) : route('register')}
                        tabIndex={5}
                        className="font-semibold text-[#67d2c3] transition hover:text-[#4abfae]"
                    >
                        Create one
                    </Link>
                </div>
            </form>

            {status && <div className="mt-4 text-center text-sm font-medium text-green-600 sm:mt-6">{status}</div>}
        </AuthLayout>
    );
}
