import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export default function PrivacyPolicyPage() {
    const lastUpdated = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 bg-muted/30 pt-24 pb-16">
                <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                    <div className="bg-background rounded-2xl p-8 md:p-12 shadow-sm border">
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
                        <p className="text-muted-foreground mb-10">Last Updated: {lastUpdated}</p>

                        <div className="space-y-10 text-muted-foreground leading-relaxed">
                            <section className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl">
                                <h2 className="text-2xl font-semibold text-foreground mb-4">Google User Data and Limited Use Disclosure</h2>
                                <p className="mb-4">
                                    Our use and transfer to any other app of information received from Google APIs will adhere to the <strong>Chrome Web Store User Data Policy</strong>, including the Limited Use requirements.
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-sm">
                                    <li>We only use the data to provide or improve user-facing features that are prominent in the extension's interface.</li>
                                    <li>We do not allow humans to read user data unless we have first obtained the user's affirmative agreement for specific messages, or it is necessary for security purposes.</li>
                                    <li>We do not use or transfer the data for serving advertisements, including retargeting, personalized, or interest-based advertising.</li>
                                    <li>We do not transfer data to third parties unless necessary to provide or improve the extension's features, or for legal/security reasons.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
                                <p>
                                    This Privacy Policy explains how <strong>Nex IT Solution</strong> ("we", "us", or "our") manages the information processed by our Chrome extensions, including <strong>Autofill Genius AI</strong> and <strong>Instant Autofill Engine</strong>.
                                    We are committed to maintaining the highest standards of data privacy and transparency.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Data Collection and Usage</h2>
                                <p className="mb-4">Our extensions handle data as follows:</p>
                                
                                <div className="space-y-6">
                                    <div className="bg-muted/50 p-6 rounded-xl border">
                                        <h3 className="text-lg font-medium text-foreground mb-2">User-Provided Files</h3>
                                        <p className="text-sm">
                                            When you upload a document (CV, form, etc.), we process it solely to extract relevant fields for autofilling. 
                                            This processing is initiated exclusively by the user.
                                        </p>
                                    </div>
                                    <div className="bg-muted/50 p-6 rounded-xl border">
                                        <h3 className="text-lg font-medium text-foreground mb-2">Form Interaction</h3>
                                        <p className="text-sm">
                                            The extension identifies input fields on web pages to facilitate data entry. 
                                            We do not monitor your browsing history or collect data from pages where the extension is not active.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Data Storage and Transfer</h2>
                                <p>
                                    <strong>Local Storage:</strong> Your extracted profile data is stored locally in your browser's secure storage. 
                                    It is never automatically synced to our servers without your authentication.
                                </p>
                                <p className="mt-4">
                                    <strong>No Data Selling:</strong> We never sell, trade, or rent user personal data to third parties. 
                                    Data is never used for advertising or user profiling.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">4. AI Processing</h2>
                                <p>
                                    Our extensions use AI models to improve field extraction accuracy. 
                                    Data sent to these models is used only for the immediate extraction task and is not used to train global AI models or shared for secondary purposes.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Security</h2>
                                <p>
                                    We implement industry-standard encryption and security protocols to protect your data during transit and at rest.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Contact</h2>
                                <p>
                                    For any privacy-related inquiries, please contact: <strong>nexai6720@gmail.com</strong>
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
