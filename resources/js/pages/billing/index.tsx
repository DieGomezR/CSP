import FamilyLayout from '@/components/family-layout';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Check, CreditCard, LoaderCircle, ShieldCheck } from 'lucide-react';
import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type BillingMode = 'parent' | 'family';
type PlanKey = 'essential' | 'plus' | 'complete';

interface BillingModeOption {
    key: BillingMode;
    label: string;
}

interface BillingPlan {
    key: PlanKey;
    label: string;
    subtitle: string;
    featured: boolean;
    badge?: string | null;
    features: string[];
    prices: Record<BillingMode, { amount: number; display: string; configured: boolean }>;
}

interface BillingPageProps {
    trialDays: number;
    billingModes: BillingModeOption[];
    plans: BillingPlan[];
    selectedMode: BillingMode;
    selectedPlan: PlanKey;
    planActions: Record<BillingMode, Record<PlanKey, { kind: 'new' | 'current' | 'upgrade' | 'downgrade' }>>;
    subscription: {
        exists: boolean;
        active: boolean;
        onTrial: boolean;
        trialEndsAt: string | null;
        status: string | null;
        currentPlan: {
            plan: string;
            billing_mode: BillingMode;
            label: string;
            billing_mode_label: string;
            price_display: string;
        } | null;
        stripeId: string | null;
    };
    stripe: {
        configured: boolean;
        publishableConfigured: boolean;
        webhookConfigured: boolean;
        missingConfiguration: string[];
        webhookPath: string;
        portalAvailable: boolean;
    };
}

function SubscriptionSummary({ subscription }: { subscription: BillingPageProps['subscription'] }) {
    if (!subscription.exists) {
        return (
            <div className="rounded-[1.6rem] border border-[#dceceb] bg-white p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[#eef8f7] p-2.5 text-[#67d2c3]">
                        <ShieldCheck className="size-5" />
                    </div>
                    <h2 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl md:text-[1.7rem]">No active subscription yet</h2>
                </div>
                <p className="mt-3 text-base leading-7 text-slate-500 sm:mt-4 sm:text-lg sm:leading-8">
                    Start your 60-day trial below.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-[1.6rem] border border-[#dceceb] bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#eef8f7] p-2.5 text-[#67d2c3]">
                    <CreditCard className="size-5" />
                </div>
                <h2 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl md:text-[1.7rem]">Current subscription</h2>
            </div>

            <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2 md:grid-cols-3 sm:gap-4">
                <div className="rounded-[1.2rem] bg-[#f7fbfb] px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400 sm:text-sm">Plan</p>
                    <p className="mt-2 text-base font-black text-slate-900 sm:text-[1.25rem]">
                        {subscription.currentPlan
                            ? `${subscription.currentPlan.label} (${subscription.currentPlan.billing_mode_label})`
                            : 'Unknown'}
                    </p>
                </div>

                <div className="rounded-[1.2rem] bg-[#f7fbfb] px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400 sm:text-sm">Status</p>
                    <p className="mt-2 text-base font-black text-slate-900 sm:text-[1.25rem]">{subscription.status ?? 'pending'}</p>
                </div>

                <div className="rounded-[1.2rem] bg-[#f7fbfb] px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400 sm:text-sm">Trial</p>
                    <p className="mt-2 text-base font-black text-slate-900 sm:text-[1.25rem]">
                        {subscription.onTrial && subscription.trialEndsAt
                            ? `Until ${new Date(subscription.trialEndsAt).toLocaleDateString()}`
                            : 'Not active'}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function BillingIndex({
    trialDays,
    billingModes,
    plans,
    selectedMode,
    selectedPlan,
    planActions,
    subscription,
    stripe,
}: BillingPageProps) {
    const { flash, security } = usePage<SharedData>().props;
    const [billingMode, setBillingMode] = useState<BillingMode>(selectedMode);
    const [activePlan, setActivePlan] = useState<PlanKey>(selectedPlan);
    const [portalLoading, setPortalLoading] = useState(false);
    const [portalError, setPortalError] = useState<string | null>(null);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [localNotice, setLocalNotice] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const currentModeLabel = useMemo(
        () => billingModes.find((mode) => mode.key === billingMode)?.label ?? 'Per Parent',
        [billingMode, billingModes],
    );
    const hasActiveSubscription = subscription.active;
    const csrfToken =
        security?.csrf_token ??
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ??
        '';

    const startCheckout = async (mode: BillingMode, planKey: PlanKey) => {
        if (processing) {
            return;
        }

        setBillingMode(mode);
        setActivePlan(planKey);
        setCheckoutError(null);
        setLocalNotice(null);
        setProcessing(true);

        try {
            const response = await fetch(route('billing.checkout'), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    plan: planKey,
                    billing_mode: mode,
                }),
            });

            const payload = (await response.json()) as {
                url?: string;
                message?: string;
                internal?: boolean;
                errors?: Record<string, string[]>;
            };

            if (!response.ok || !payload.url) {
                const validationMessage = payload.errors ? Object.values(payload.errors).flat()[0] : null;

                throw new Error(validationMessage ?? payload.message ?? 'Unable to start Stripe Checkout.');
            }

            if (payload.message) {
                setLocalNotice(payload.message);
            }

            window.location.href = payload.url;
        } catch (error) {
            setCheckoutError(error instanceof Error ? error.message : 'Unable to start Stripe Checkout.');
            setProcessing(false);
        }
    };

    const openPortal = async () => {
        if (!stripe.portalAvailable || portalLoading) {
            return;
        }

        setPortalError(null);
        setPortalLoading(true);

        try {
            const response = await fetch(route('billing.portal'), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            const payload = (await response.json()) as { url?: string; message?: string };

            if (!response.ok || !payload.url) {
                throw new Error(payload.message ?? 'Unable to open the Stripe billing portal.');
            }

            window.location.href = payload.url;
        } catch (error) {
            setPortalError(error instanceof Error ? error.message : 'Unable to open the Stripe billing portal.');
            setPortalLoading(false);
        }
    };

    return (
        <>
            <Head title="Billing" />

            <FamilyLayout activeTab="billing">
                <section className="flex flex-col gap-4 border-b border-[#dceceb] px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-[2.8rem]">Billing</h1>
                        <p className="mt-2 text-base text-slate-400 sm:text-lg">
                            New subscriptions and upgrades happen here.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            type="button"
                            disabled={!stripe.portalAvailable || portalLoading}
                            onClick={openPortal}
                            className="inline-flex min-h-[44px] items-center rounded-[1.25rem] border border-[#d5e8e3] bg-white px-5 py-3 text-sm font-black text-slate-600 shadow-sm hover:bg-slate-50 sm:px-6 sm:text-[1.05rem]"
                        >
                            {portalLoading && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                            Manage Billing
                        </Button>

                        {hasActiveSubscription ? (
                            <Link
                                href={route('calendar')}
                                className="inline-flex min-h-[44px] items-center rounded-[1.25rem] bg-[#67d2c3] px-5 py-3 text-sm font-black text-white shadow-sm sm:px-6 sm:text-[1.05rem]"
                            >
                                Back to Calendar
                            </Link>
                        ) : (
                            <span className="inline-flex min-h-[44px] items-center rounded-[1.25rem] border border-dashed border-[#d7d8ef] bg-[#f7f9fc] px-5 py-3 text-sm font-black text-slate-400 sm:px-6 sm:text-[1.05rem]">
                                Complete billing to continue
                            </span>
                        )}
                    </div>
                </section>

                {flash.status && (
                    <div className="mx-4 mt-4 rounded-[1.35rem] border border-[#caece6] bg-white px-4 py-4 text-sm font-semibold text-[#3da999] shadow-sm sm:mx-6 sm:text-[1.05rem]">
                        {flash.status}
                    </div>
                )}

                {checkoutError && (
                    <div className="mx-4 mt-4 rounded-[1.35rem] border border-[#f4d6d6] bg-white px-4 py-4 text-sm font-semibold text-[#c35b5b] shadow-sm sm:mx-6 sm:text-[1.05rem]">
                        {checkoutError}
                    </div>
                )}

                {localNotice && (
                    <div className="mx-4 mt-4 rounded-[1.35rem] border border-[#caece6] bg-white px-4 py-4 text-sm font-semibold text-[#3da999] shadow-sm sm:mx-6 sm:text-[1.05rem]">
                        {localNotice}
                    </div>
                )}

                {portalError && (
                    <div className="mx-4 mt-4 rounded-[1.35rem] border border-[#f4d6d6] bg-white px-4 py-4 text-sm font-semibold text-[#c35b5b] shadow-sm sm:mx-6 sm:text-[1.05rem]">
                        {portalError}
                    </div>
                )}

                {!stripe.configured && (
                    <div className="mx-4 mt-4 rounded-[1.35rem] border border-[#f8d9b8] bg-[#fff8ef] px-4 py-4 text-sm font-semibold text-[#a7641b] shadow-sm sm:mx-6 sm:text-[1.02rem]">
                        Stripe Checkout is not configured yet. Add{' '}
                        <span className="font-black">{stripe.missingConfiguration.join(', ')}</span> in your `.env` and reload the page.
                    </div>
                )}

                <div className="mt-4 grid gap-4 px-4 sm:mt-6 sm:gap-6 sm:px-6">
                    <SubscriptionSummary subscription={subscription} />

                    <section className="rounded-[1.8rem] border border-[#edf3f2] bg-white px-4 py-6 shadow-[0_26px_60px_-52px_rgba(15,23,42,0.38)] sm:px-6 sm:py-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-4xl">Simple, affordable plans</h2>
                            <p className="mt-3 text-base text-slate-500 sm:mt-4 sm:text-lg md:text-xl">Start free for {trialDays} days. Cancel anytime.</p>
                        </div>

                        <div className="mt-6 flex justify-center sm:mt-8">
                            <div className="inline-flex rounded-2xl bg-slate-100 p-1.5">
                                {billingModes.map((mode) => (
                                    <button
                                        key={mode.key}
                                        type="button"
                                        onClick={() => setBillingMode(mode.key)}
                                        className={`min-h-[44px] rounded-xl px-4 py-2 text-xs font-black transition sm:px-6 sm:text-sm md:py-3 ${
                                            billingMode === mode.key ? 'bg-[#67d2c3] text-white shadow-sm' : 'text-slate-500'
                                        }`}
                                    >
                                        {mode.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-3 text-center text-xs font-semibold text-slate-400 sm:mt-4 sm:text-sm">
                            Currently viewing {currentModeLabel} pricing
                        </div>

                        <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 sm:gap-6">
                            {plans.map((plan) => {
                                const price = plan.prices[billingMode];
                                const isSelected = activePlan === plan.key;
                                const planAction = planActions[billingMode][plan.key];
                                const isCurrentPlan = planAction.kind === 'current';
                                const opensPortal = planAction.kind === 'downgrade';
                                const canStartAction = stripe.configured && price.configured && !processing && (!opensPortal || stripe.portalAvailable);
                                const buttonLabel = subscription.active
                                    ? isCurrentPlan
                                        ? 'Current plan'
                                        : planAction.kind === 'upgrade'
                                          ? 'Upgrade now'
                                          : 'Change at renewal'
                                    : `Start ${trialDays}-Day Trial`;
                                const helperText = subscription.active
                                    ? isCurrentPlan
                                        ? 'This is your active selection.'
                                        : planAction.kind === 'upgrade'
                                          ? 'Applies immediately. You will be charged a prorated amount for the remainder of the billing cycle.'
                                          : 'Lower-cost or reduced-coverage changes are managed. They will be scheduled to apply at the end of your current billing period to avoid any disruption.'
                                    : null;

                                return (
                                    <article
                                        key={plan.key}
                                        onClick={() => setActivePlan(plan.key)}
                                        className={`relative rounded-[1.8rem] border p-6 text-left shadow-[0_28px_65px_-52px_rgba(15,23,42,0.45)] transition sm:p-8 ${
                                            plan.featured ? 'bg-[#63cfc0] text-white' : 'bg-white text-slate-900'
                                        } ${
                                            isSelected
                                                ? plan.featured
                                                    ? 'border-white/70 ring-4 ring-white/15'
                                                    : 'border-[#67d2c3] ring-4 ring-[#67d2c3]/15'
                                                : plan.featured
                                                  ? 'border-transparent'
                                                  : 'border-slate-200'
                                        }`}
                                    >
                                        {plan.badge && (
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffb21a] px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.12em] text-white sm:px-4 sm:py-2 sm:text-xs">
                                                {plan.badge}
                                            </div>
                                        )}

                                        <h3 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">{plan.label}</h3>
                                        <p className={`mt-2 text-base sm:text-lg ${plan.featured ? 'text-white/85' : 'text-slate-500'}`}>{plan.subtitle}</p>
                                        <div className="mt-6 flex items-end gap-2 sm:mt-8">
                                            <span className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">{price.display}</span>
                                            <span className={`pb-1 text-base sm:pb-2 sm:text-xl ${plan.featured ? 'text-white/85' : 'text-slate-500'}`}>/month</span>
                                        </div>

                                        <ul className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-3 text-sm leading-7 sm:text-base sm:leading-8">
                                                    <Check className={`mt-1 size-5 shrink-0 ${plan.featured ? 'text-white' : 'text-slate-400'}`} />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <Button
                                            type="button"
                                            disabled={!canStartAction || isCurrentPlan}
                                            onClick={(event) => {
                                                event.stopPropagation();

                                                if (isCurrentPlan) {
                                                    return;
                                                }

                                                if (opensPortal) {
                                                    void openPortal();
                                                    return;
                                                }

                                                void startCheckout(billingMode, plan.key);
                                            }}
                                            className={`mt-8 inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl px-4 text-sm font-black sm:mt-10 sm:h-14 sm:px-6 sm:text-base ${
                                                plan.featured ? 'bg-white text-[#55bfae] hover:bg-slate-50' : 'bg-[#67d2c3] text-white hover:bg-[#59c8b7]'
                                            }`}
                                        >
                                            {activePlan === plan.key && processing
                                                ? planAction.kind === 'upgrade'
                                                    ? 'Applying...'
                                                    : 'Redirecting...'
                                                : buttonLabel}
                                        </Button>

                                        {!price.configured && (
                                            <p className={`mt-3 text-xs font-semibold sm:mt-4 sm:text-sm ${plan.featured ? 'text-white/85' : 'text-[#c35b5b]'}`}>
                                                Stripe price ID missing for the {currentModeLabel} variant of this plan.
                                            </p>
                                        )}

                                        {isSelected && (
                                            <p className={`mt-3 text-xs font-black sm:mt-4 sm:text-sm ${plan.featured ? 'text-white/90' : 'text-[#3da999]'}`}>Selected plan</p>
                                        )}

                                        {helperText && (
                                            <p className={`mt-3 text-xs font-semibold leading-6 sm:mt-4 sm:text-sm ${plan.featured ? 'text-white/90' : 'text-slate-500'}`}>
                                                {helperText}
                                            </p>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </FamilyLayout>
        </>
    );
}
