import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export default function PrivacyPolicyPage() {
    const lastUpdated = "May 16, 2026";

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 bg-muted/30 pt-24 pb-16">
                <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                    <div className="bg-background rounded-2xl p-8 md:p-12 shadow-sm border">
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
                        <p className="text-muted-foreground mb-10">Last Updated: {lastUpdated}</p>

                        <div className="space-y-10 text-muted-foreground leading-relaxed">

                            {/* Google Limited Use Disclosure */}
                            <section className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl">
                                <h2 className="text-2xl font-semibold text-foreground mb-4">Google API Limited Use Disclosure</h2>
                                <p className="mb-4">
                                    Our use and transfer to any other app of information received from Google APIs will adhere to the{" "}
                                    <a
                                        href="https://chromewebstore.google.com/category/extensions"
                                        className="text-blue-600 dark:text-blue-400 underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Chrome Web Store User Data Policy
                                    </a>
                                    , including the Limited Use requirements.
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-sm">
                                    <li>We only use the data to provide or improve user-facing features that are prominent in the extension's interface.</li>
                                    <li>We do not allow humans to read user data unless we have obtained the user's affirmative agreement, or it is necessary for security purposes such as investigating abuse.</li>
                                    <li>We do not use or transfer the data for serving advertisements, including retargeting, personalized, or interest-based advertising.</li>
                                    <li>We do not transfer data to third parties unless necessary to provide or improve the extension's features, comply with applicable law, or as part of a merger or acquisition.</li>
                                </ul>
                            </section>

                            {/* 1. Introduction */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
                                <p className="mb-4">
                                    This Privacy Policy explains how <strong>Nex IT Solution</strong> ("we", "us", or "our") collects, uses, stores, and shares information when you use our Chrome extensions, including <strong>Autofill Genius AI</strong> and <strong>Instant Autofill Engine</strong> (collectively, the "Extensions").
                                </p>
                                <p>
                                    By installing or using our Extensions, you agree to the practices described in this policy. If you do not agree, please uninstall the Extensions and discontinue use.
                                </p>
                            </section>

                            {/* 2. User Data Collection */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">2. User Data Collection</h2>
                                <p className="mb-4 text-sm">We collect the following types of information to provide the core functionality of the extension:</p>
                                <ul className="list-disc pl-6 space-y-2 text-sm">
                                    <li><strong className="text-foreground">Uploaded Documents:</strong> When you use the extension to upload files such as CVs, resumes, or application forms, we temporarily collect these files for processing.</li>
                                    <li><strong className="text-foreground">Extracted Information:</strong> We collect the structured text fields extracted from your uploaded documents (e.g., name, contact details, work experience).</li>
                                    <li><strong className="text-foreground">Active Web Page Context:</strong> The extension reads the current active web page specifically to detect form input fields in order to autofill them. We do not track or collect your general browsing history.</li>
                                </ul>
                            </section>

                            {/* 3. User Data Handling */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Data Handling</h2>
                                <p className="mb-4 text-sm">Your data is handled securely and strictly for the intended purposes:</p>
                                <ul className="list-disc pl-6 space-y-2 text-sm">
                                    <li><strong className="text-foreground">Service Provision:</strong> Your uploaded documents are processed solely for the purpose of extracting relevant text fields required to autofill online forms.</li>
                                    <li><strong className="text-foreground">Secure Transmission:</strong> All data transmitted between your browser and the processing APIs is encrypted using industry-standard protocols (HTTPS/TLS).</li>
                                    <li><strong className="text-foreground">No Background Processing:</strong> We do not monitor your activity in the background. Data handling only occurs when you explicitly interact with the extension.</li>
                                </ul>
                            </section>

                            {/* 4. User Data Storage */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">4. User Data Storage</h2>
                                <p className="mb-4 text-sm">We follow a minimal-retention and user-controlled storage approach:</p>
                                <ul className="list-disc pl-6 space-y-2 text-sm">
                                    <li><strong className="text-foreground">Local Storage:</strong> Extracted profile data is stored locally within your browser using <code>chrome.storage.local</code>. This allows you to reuse the extracted information for future autofill sessions without needing to re-upload documents.</li>
                                    <li><strong className="text-foreground">No Server Retention:</strong> We do not permanently store, archive, or retain your uploaded documents or the extracted content on our servers. Once the real-time extraction process is complete, the document data is discarded.</li>
                                    <li><strong className="text-foreground">User Control:</strong> You maintain full control over your locally stored data. You can delete it at any time via the extension's interface or by uninstalling the extension.</li>
                                </ul>
                            </section>

                            {/* 5. User Data Sharing */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">5. User Data Sharing</h2>
                                <p className="mb-4 text-sm">We respect your privacy and limit data sharing to what is strictly necessary:</p>
                                <ul className="list-disc pl-6 space-y-2 text-sm">
                                    <li><strong className="text-foreground">Third-Party AI Providers:</strong> To perform text extraction, we securely transmit your uploaded documents to third-party AI service providers (such as Google Gemini API). These providers only process the data for the requested extraction and are prohibited from using it to train models or for other purposes.</li>
                                    <li><strong className="text-foreground">No Selling of Data:</strong> We do not sell, rent, or trade your personal data to any third parties for marketing, advertising, or profiling purposes.</li>
                                    <li><strong className="text-foreground">Legal Requirements:</strong> We may disclose data if required by law, court order, or governmental authority.</li>
                                </ul>
                            </section>

                            {/* 6. Your Rights */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Rights</h2>
                                <p className="text-sm">You have the right to access, edit, and delete your locally stored data at any time through the extension interface. Uninstalling the extension will automatically remove all associated local data.</p>
                            </section>

                            {/* 7. Children's Privacy */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Children&apos;s Privacy</h2>
                                <p>
                                    Our Extensions are not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately at <strong className="text-foreground">nexai6720@gmail.com</strong> and we will promptly delete it.
                                </p>
                            </section>

                            {/* 8. Cookies and Tracking */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Cookies and Tracking Technologies</h2>
                                <p>
                                    Our Chrome Extensions do not use cookies, web beacons, pixel tags, or any other passive tracking technologies. Data is stored exclusively in <code>chrome.storage.local</code>, which is a browser storage mechanism specific to the extension and not accessible to websites or third parties.
                                </p>
                            </section>

                            {/* 9. Changes */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Changes to This Privacy Policy</h2>
                                <p>
                                    We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. When we make material changes, we will update the "Last Updated" date at the top of this page and, where feasible, provide a notification within the extension or via the Chrome Web Store listing. Your continued use of the Extensions after any changes constitutes your acceptance of the updated policy.
                                </p>
                            </section>

                            {/* 10. Contact */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact Us</h2>
                                <p className="mb-2">
                                    If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
                                </p>
                                <div className="bg-muted/50 p-5 rounded-xl border text-sm space-y-1">
                                    <p><strong className="text-foreground">Company:</strong> Nex IT Solution</p>
                                    <p><strong className="text-foreground">Email:</strong> nexai6720@gmail.com</p>
                                    <p><strong className="text-foreground">Extensions:</strong> Autofill Genius AI, Instant Autofill Engine</p>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
