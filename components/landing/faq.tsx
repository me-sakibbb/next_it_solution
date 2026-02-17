'use client'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
    {
        question: "Is there a free trial available?",
        answer: "Yes, we offer a 14-day free trial with full access to all features. No credit card is required to sign up."
    },
    {
        question: "Can I manage multiple shop locations?",
        answer: "Absolutely! Our Pro and Enterprise plans support multiple shop locations, allowing you to manage inventory, staff, and sales from a single dashboard."
    },
    {
        question: "Do you offer customer support?",
        answer: "Yes, we provide email support for all plans. Pro and Enterprise users also get priority support for faster response times."
    },
    {
        question: "Is my data secure?",
        answer: "Security is our top priority. We use industry-standard encryption to protect your data and perform regular backups to ensure it's never lost."
    },
    {
        question: "Can I upgrade or downgrade my plan?",
        answer: "Yes, you can change your plan at any time. If you upgrade, the changes take effect immediately. If you downgrade, the new rate starts at your next billing cycle."
    }
]

export function FAQ() {
    return (
        <section id="faq" className="py-24 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
                    <p className="text-lg text-muted-foreground">
                        Have questions? We're here to help.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                                <AccordionContent>
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    )
}
