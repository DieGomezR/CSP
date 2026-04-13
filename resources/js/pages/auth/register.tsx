import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface RegisterProps {
    timezones: Array<{
        value: string;
        label: string;
    }>;
    invitation?: {
        token: string;
        email: string;
        family_name: string;
    } | null;
}

interface RegisterForm {
    [key: string]: string | boolean;
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone_number: string;
    sms_opt_in: boolean;
    family_name: string;
    timezone: string;
    coparent_email: string;
    invite_token: string;
}

export default function Register({ timezones, invitation }: RegisterProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: invitation?.email ?? '',
        password: '',
        password_confirmation: '',
        phone_number: '',
        sms_opt_in: false,
        family_name: invitation?.family_name ?? '',
        timezone: 'America/New_York',
        coparent_email: '',
        invite_token: invitation?.token ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title={invitation ? `Join ${invitation.family_name}` : 'Start Your Family Calendar'}
            description={invitation ? 'Create your account to join this shared family calendar.' : '60-day free trial. No credit card required.'}
        >
            <Head title="Sign up" />

            <form className="flex w-full flex-col gap-5 sm:gap-7" onSubmit={submit}>
                <div className="grid w-full gap-5 sm:gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-center text-base font-black text-slate-900 sm:text-[1.2rem]">
                            Your Name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Jane Smith"
                            className="min-h-[44px] h-12 rounded-[1rem] border-[#d9e7f0] bg-white px-3 text-sm shadow-none sm:h-14 sm:px-4 sm:text-[1.05rem]"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-center text-base font-black text-slate-900 sm:text-[1.2rem]">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing || Boolean(invitation)}
                            placeholder="jane@email.com"
                            className="min-h-[44px] h-12 rounded-[1rem] border-[#d9e7f0] bg-white px-3 text-sm shadow-none sm:h-14 sm:px-4 sm:text-[1.05rem]"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="text-center text-base font-black text-slate-900 sm:text-[1.2rem]">
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) => {
                                    setData('password', e.target.value);
                                    setData('password_confirmation', e.target.value);
                                }}
                                disabled={processing}
                                placeholder="At least 8 characters"
                                className="min-h-[44px] h-12 rounded-[1rem] border-[#d9e7f0] bg-white px-3 pr-12 text-sm shadow-none sm:h-14 sm:px-4 sm:pr-14 sm:text-[1.05rem]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((value) => !value)}
                                className="absolute top-1/2 right-2 -translate-y-1/2 p-2 text-slate-400 transition hover:text-slate-700 sm:right-4"
                            >
                                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone_number" className="text-center text-base font-black text-slate-900 sm:text-[1.2rem]">
                            Phone Number
                        </Label>
                        <Input
                            id="phone_number"
                            type="text"
                            required
                            autoComplete="tel"
                            value={data.phone_number}
                            onChange={(e) => setData('phone_number', e.target.value)}
                            disabled={processing}
                            placeholder="+1 (555) 123-4567"
                            className="min-h-[44px] h-12 rounded-[1rem] border-[#d9e7f0] bg-white px-3 text-sm shadow-none sm:h-14 sm:px-4 sm:text-[1.05rem]"
                        />
                        <p className="text-center text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
                            Required for app functionality. We&apos;ll only send transactional messages.
                        </p>
                        <InputError message={errors.phone_number} />
                    </div>

                    <label className="flex items-start gap-3 rounded-[1rem] px-1 text-center text-sm leading-6 text-slate-500 sm:text-[1rem] sm:leading-7">
                        <input
                            type="checkbox"
                            checked={data.sms_opt_in}
                            onChange={(e) => setData('sms_opt_in', e.target.checked)}
                            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300"
                        />
                        <span>Yes, I&apos;d like to receive tips, updates, and occasional promotions via SMS</span>
                    </label>

                    {!invitation && (
                        <div className="w-full space-y-5 rounded-[1.2rem] border border-slate-100 bg-slate-50/65 px-4 py-4 sm:rounded-[1.4rem] sm:space-y-6 sm:px-5 sm:py-5">
                            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.16em] text-slate-900 sm:text-sm">
                                <div className="h-px flex-1 bg-slate-200" />
                                Family Setup
                                <div className="h-px flex-1 bg-slate-200" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="family_name" className="text-center text-base font-black text-slate-900 sm:text-[1.2rem]">
                                    Family Name
                                </Label>
                                <Input
                                    id="family_name"
                                    type="text"
                                    required
                                    value={data.family_name}
                                    onChange={(e) => setData('family_name', e.target.value)}
                                    disabled={processing}
                                    placeholder="Smith Family"
                                    className="min-h-[44px] h-12 rounded-[1rem] border-[#d9e7f0] bg-white px-3 text-sm shadow-none sm:h-14 sm:px-4 sm:text-[1.05rem]"
                                />
                                <InputError message={errors.family_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="timezone" className="text-center text-base font-black text-slate-900 sm:text-[1.2rem]">
                                    Timezone
                                </Label>
                                <select
                                    id="timezone"
                                    value={data.timezone}
                                    onChange={(e) => setData('timezone', e.target.value)}
                                    className="min-h-[44px] h-12 w-full rounded-[1rem] border border-[#d9e7f0] bg-white px-3 text-sm text-slate-900 outline-none sm:h-14 sm:px-4 sm:text-[1.05rem]"
                                >
                                    {timezones.map((timezone) => (
                                        <option key={timezone.value} value={timezone.value}>
                                            {timezone.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.timezone} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="coparent_email" className="text-center text-base font-black text-slate-900 sm:text-[1.2rem]">
                                    Invite Co-Parent (optional)
                                </Label>
                                <Input
                                    id="coparent_email"
                                    type="email"
                                    value={data.coparent_email}
                                    onChange={(e) => setData('coparent_email', e.target.value)}
                                    disabled={processing}
                                    placeholder="coparent@email.com"
                                    className="min-h-[44px] h-12 rounded-[1rem] border-[#d9e7f0] bg-white px-3 text-sm shadow-none sm:h-14 sm:px-4 sm:text-[1.05rem]"
                                />
                                <p className="text-center text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">They&apos;ll get an email to join your family calendar.</p>
                                <InputError message={errors.coparent_email} />
                            </div>
                        </div>
                    )}

                    {invitation && (
                        <div className="w-full rounded-[1rem] border border-[#d9e7f0] bg-[#eef8ff] px-4 py-3 text-center text-xs leading-5 text-slate-600 sm:rounded-[1.2rem] sm:px-5 sm:py-4 sm:text-sm sm:leading-6">
                            You&apos;re joining <span className="font-black text-slate-900">{invitation.family_name}</span>. Use the invited email to finish signup.
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="min-h-[44px] mt-1 h-12 w-full rounded-[1rem] bg-[linear-gradient(90deg,#67d2c3_0%,#68c8bd_100%)] px-4 text-base font-black text-slate-900 shadow-none sm:h-14 sm:text-[1.15rem]"
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {invitation ? 'Join Family Calendar' : 'Create My Account'}
                    </Button>
                </div>

                <div className="text-center text-sm leading-6 text-slate-500 sm:text-[0.98rem] sm:leading-7">
                    By signing up, you agree to our{' '}
                    <a href="#" className="font-semibold text-slate-700 underline">
                        Terms
                    </a>{' '}
                    and{' '}
                    <a href="#" className="font-semibold text-slate-700 underline">
                        Privacy Policy
                    </a>
                    .
                </div>

                <div className="text-center text-sm text-slate-500 sm:text-[1.05rem]">
                    Already have an account?{' '}
                    <Link
                        href={invitation ? route('login', { invite: invitation.token }) : route('login')}
                        className="font-semibold text-[#67d2c3] transition hover:text-[#4abfae]"
                    >
                        Sign in
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
