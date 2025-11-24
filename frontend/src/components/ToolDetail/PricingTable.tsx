import React from 'react';
import { CheckIcon } from '@heroicons/react/20/solid';

interface PricingPlan {
    plan: string;
    price: string;
    features: string[];
}

interface PricingTableProps {
    pricing: PricingPlan[];
    pricingString?: string;
}

const PricingTable: React.FC<PricingTableProps> = ({ pricing, pricingString }) => {
    // If no structured pricing but we have a pricing string, display it
    if (pricing.length === 0 && pricingString) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900">Pricing</h2>
                <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                    <p className="text-2xl font-semibold text-gray-900">{pricingString}</p>
                </div>
            </div>
        );
    }

    // If no pricing data at all, don't render
    if (pricing.length === 0) {
        return null;
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">Pricing</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pricing.map((tier, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-lg"
                    >
                        <h3 className="text-lg font-semibold leading-8 text-gray-900">{tier.plan}</h3>
                        <p className="mt-4 flex items-baseline gap-x-2">
                            <span className="text-4xl font-bold tracking-tight text-gray-900">{tier.price}</span>
                        </p>
                        <ul role="list" className="mt-6 space-y-3 border-t border-gray-200 pt-6">
                            {tier.features.map((feature, featureIdx) => (
                                <li key={featureIdx} className="flex gap-x-3">
                                    <CheckIcon className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                                    <span className="text-sm leading-6 text-gray-600">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <a
                            href="#"
                            className="mt-8 block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                            Get started
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PricingTable;
