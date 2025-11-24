import React from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';

interface FAQItem {
    q: string;
    a: string;
}

interface FAQSectionProps {
    faq: FAQItem[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ faq }) => {
    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <div className="mt-6 w-full max-w-3xl rounded-2xl bg-white p-2">
                {faq.map((item, idx) => (
                    <Disclosure key={idx} as="div" className="mt-2">
                        {({ open }) => (
                            <>
                                <Disclosure.Button className="flex w-full justify-between rounded-lg bg-blue-50 px-4 py-4 text-left text-sm font-medium text-blue-900 hover:bg-blue-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
                                    <span>{item.q}</span>
                                    <ChevronUpIcon
                                        className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-blue-500`}
                                    />
                                </Disclosure.Button>
                                <Disclosure.Panel className="px-4 pb-2 pt-4 text-sm text-gray-500">
                                    {item.a}
                                </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>
                ))}
            </div>
        </div>
    );
};

export default FAQSection;
