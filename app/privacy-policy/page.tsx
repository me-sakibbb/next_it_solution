import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export default function PrivacyPolicyPage() {
    const lastUpdated = "May 12, 2026";

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

                            {/* 2. Data We Collect */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Data We Collect</h2>
                                <p className="mb-4">We collect only the minimum data necessary to provide the extension's functionality:</p>

                                <div className="space-y-4">
                                    <div className="bg-muted/50 p-5 rounded-xl border">
                                        <h3 className="text-base font-semibold text-foreground mb-2">a) User-Uploaded Documents</h3>
                                        <p className="text-sm">
                                            When you upload a file (e.g., a CV, resume, or ID document), the content of that file is processed to extract structured data fields for autofilling. The file is only read at the time of upload and is not stored permanently on our servers.
                                        </p>
                                    </div>

                                    <div className="bg-muted/50 p-5 rounded-xl border">
                                        <h3 className="text-base font-semibold text-foreground mb-2">b) Extracted Profile Data</h3>
                                        <p className="text-sm">
                                            Structured fields extracted from your documents (such as name, email address, phone number, work history, education, and other form-relevant fields) are stored locally in your browser's extension storage (<code>chrome.storage.local</code>) so you can reuse them across sessions.
                                        </p>
                                    </div>

                                    <div className="bg-muted/50 p-5 rounded-xl border">
                                        <h3 className="text-base font-semibold text-foreground mb-2">c) Active Tab and Page Content</h3>
                                        <p className="text-sm">
                                            The Extensions access the content of the currently active tab to identify input fields and fill them. We do not collect, record, or transmit the content of pages where the extension is not explicitly activated by you.
                                        </p>
                                    </div>

                                    <div className="bg-muted/50 p-5 rounded-xl border">
                                        <h3 className="text-base font-semibold text-foreground mb-2">d) API Keys (Optional)</h3>
                                        <p className="text-sm">
                                            If you choose to provide your own AI API key (e.g., a Google Gemini key), it is stored locally in your browser's secure extension storage and is never transmitted to our servers. It is sent directly to the respective AI provider's API.
                                        </p>
                                    </div>

                                    <div className="bg-muted/50 p-5 rounded-xl border">
                                        <h3 className="text-base font-semibold text-foreground mb-2">e) No Browsing History</h3>
                                        <p className="text-sm">
                                            We do not collect, monitor, or store your browsing history, URLs visited, or any passive background activity on your device.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* 3. How We Handle Your Data */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Handle Your Data</h2>
                                <p className="mb-4">
                                    All data handling is initiated explicitly by you (the user). We do not perform any background or passive data collection. The data handling pipeline is as follows:
                                </p>
                                <ol className="list-decimal pl-6 space-y-3 text-sm">
                                    <li><strong>Upload:</strong> You upload a document via the extension popup. The document content is sent securely (HTTPS) to our backend API or directly to an AI provider API for extraction.</li>
                                    <li><strong>Extraction:</strong> AI models process the document to identify and extract structured fields. This processing is ephemeral — the raw document content is not persisted after extraction is complete.</li>
                                    <li><strong>Storage:</strong> Extracted fields are saved to your browser's local extension storage (<code>chrome.storage.local</code>), which is private to your device and browser profile.</li>
                                    <li><strong>Autofill:</strong> When you trigger autofill on a web page, the locally-stored fields are inserted into the detected form fields. No data leaves your device at this step.</li>
                                </ol>
                            </section>

                            {/* 4. Data Storage */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Storage</h2>
                                <div className="space-y-4 text-sm">
                                    <p>
                                        <strong className="text-foreground">Local Browser Storage:</strong> Extracted profile data is stored in <code>chrome.storage.local</code> on your device. This data remains on your device and is never automatically uploaded to our servers.
                                    </p>
                                    <p>
                                        <strong className="text-foreground">Server-Side Retention:</strong> If document content is temporarily processed via our backend API, it is not stored beyond the duration of the API request. We do not maintain a persistent copy of your uploaded documents.
                                    </p>
                                    <p>
                                        <strong className="text-foreground">Retention Period:</strong> Data stored locally persists until you clear it using the extension's "Clear Data" feature, uninstall the extension, or clear your browser storage. We do not impose a server-side retention period because we do not store your personal data on our servers.
                                    </p>
                                    <p>
                                        <strong className="text-foreground">Security:</strong> All data in transit between the extension and any API endpoint is encrypted using industry-standard TLS (HTTPS). Local browser storage is protected by your browser and operating system's security model.
                                    </p>
                                </div>
                            </section>

                            {/* 5. Data Sharing */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Sharing and Third Parties</h2>
                                <p className="mb-4">
                                    We do not sell, rent, or trade your personal data. Data is shared with third parties only in the following limited circumstances:
                                </p>
                                <div className="space-y-4">
                                    <div className="bg-muted/50 p-5 rounded-xl border">
                                        <h3 className="text-base font-semibold text-foreground mb-2">AI Processing Providers</h3>
                                        <p className="text-sm">
                                            To extract structured data from your uploaded documents, we use AI APIs (such as Google Gemini). The content of your document is sent to these providers solely to perform the extraction. These providers process your data under their own privacy policies and are prohibited from retaining or reusing it for other purposes under our usage terms.
                                        </p>
                                    </div>
                                    <div className="bg-muted/50 p-5 rounded-xl border">
                                        <h3 className="text-base font-semibold text-foreground mb-2">Legal Requirements</h3>
                                        <p className="text-sm">
                                            We may disclose data if required to do so by law, court order, or governmental authority, or when we believe disclosure is necessary to protect our legal rights, protect your safety or the safety of others, or investigate fraud.
                                        </p>
                                    </div>
                                    <div className="bg-muted/50 p-5 rounded-xl border">
                                        <h3 className="text-base font-semibold text-foreground mb-2">Business Transfers</h3>
                                        <p className="text-sm">
                                            In the event of a merger, acquisition, or sale of assets, user data may be transferred as part of the transaction. You will be notified via a prominent notice on our website and/or extension before your data is transferred and becomes subject to a different privacy policy.
                                        </p>
                                    </div>
                                    <p className="text-sm font-medium text-foreground">
                                        We do not share data with advertisers, analytics platforms, data brokers, or any third party for marketing, profiling, or advertising purposes.
                                    </p>
                                </div>
                            </section>

                            {/* 6. Your Rights */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Rights and Choices</h2>
                                <p className="mb-4">You have the following rights regarding your data:</p>
                                <ul className="list-disc pl-6 space-y-2 text-sm">
                                    <li><strong className="text-foreground">Access:</strong> You can view all locally stored profile data at any time via the extension popup.</li>
                                    <li><strong className="text-foreground">Deletion:</strong> You can delete your locally stored data at any time using the "Clear Data" option in the extension. Uninstalling the extension also removes all locally stored data.</li>
                                    <li><strong className="text-foreground">Correction:</strong> You can edit any extracted field directly in the extension before using it for autofill.</li>
                                    <li><strong className="text-foreground">Opt-Out:</strong> You can disable or uninstall the extension at any time to stop all data collection and processing.</li>
                                    <li><strong className="text-foreground">Data Portability:</strong> The extension stores your data locally, so it is always under your direct control.</li>
                                </ul>
                                <p className="mt-4 text-sm">
                                    To exercise any of these rights or for questions about your data, contact us at <strong className="text-foreground">nexai6720@gmail.com</strong>.
                                </p>
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
