import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export default function PrivacyPolicyPage() {
    const lastUpdated = "May 19, 2026";

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 bg-muted/30 pt-24 pb-16">
                <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                    <div className="bg-background rounded-2xl p-8 md:p-12 shadow-sm border">
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
                        <p className="text-muted-foreground mb-2">Last Updated: {lastUpdated}</p>
                        <p className="text-muted-foreground mb-10 text-sm">
                            This Privacy Policy applies to the <strong>Autofill Genius AI</strong> and{" "}
                            <strong>Instant Autofill Engine</strong> Chrome extensions (each, an &quot;Extension&quot;,
                            and together the &quot;Extensions&quot;) and to the related services provided at
                            nexitsolution.bd.
                        </p>

                        <div className="space-y-10 text-muted-foreground leading-relaxed">

                            {/* Google Limited Use Disclosure */}
                            <section className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl">
                                <h2 className="text-2xl font-semibold text-foreground mb-4">Google API Limited Use Disclosure</h2>
                                <p className="mb-4">
                                    The use and transfer of information received from Google APIs to any other app by{" "}
                                    <strong>Autofill Genius AI</strong> and <strong>Instant Autofill Engine</strong> will adhere to the{" "}
                                    <a
                                        href="https://developer.chrome.com/docs/webstore/program-policies/limited-use"
                                        className="text-blue-600 dark:text-blue-400 underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Chrome Web Store User Data Policy
                                    </a>
                                    , including the Limited Use requirements.
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-sm">
                                    <li>We only use the data to provide or improve user-facing features that are prominent in the Extension&apos;s user interface.</li>
                                    <li>We do not allow humans to read user data unless we have obtained the user&apos;s affirmative agreement to view specific data, it is necessary for security purposes (such as investigating abuse), it is necessary to comply with applicable law, or the data is aggregated and used for internal operations in accordance with applicable privacy and other laws.</li>
                                    <li>We do not use or transfer the data for serving advertisements, including retargeting, personalized, or interest-based advertising.</li>
                                    <li>We do not sell user data, and we do not transfer user data to third parties except as necessary to provide or improve the Extension&apos;s single purpose, to comply with applicable law, or as part of a merger, acquisition, or sale of assets after obtaining explicit prior consent from the user.</li>
                                    <li>We do not use or transfer user data to determine creditworthiness or for lending purposes.</li>
                                </ul>
                            </section>

                            {/* 1. Introduction */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction &amp; Who We Are</h2>
                                <p className="mb-4">
                                    This Privacy Policy explains how <strong>Nex IT Solution</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, handles, stores, shares, retains, and protects information when you install or use our Chrome extensions, <strong>Autofill Genius AI</strong> and <strong>Instant Autofill Engine</strong>, and the supporting web services hosted at nexitsolution.bd.
                                </p>
                                <p className="mb-4">
                                    Both Extensions have a single purpose: to help you fill out online forms by extracting information from documents you choose to upload (such as CVs, resumes, and identity documents) using artificial intelligence, and by mapping that information into the fields of web forms you are completing.
                                </p>
                                <p>
                                    By installing or using the Extensions, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with it, please do not install or use the Extensions, or uninstall them and discontinue use.
                                </p>
                            </section>

                            {/* 2. Summary table */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Summary of Data Practices</h2>
                                <p className="mb-4 text-sm">The table below summarizes the data the Extensions handle. Each item is described in full in the sections that follow.</p>
                                <div className="overflow-x-auto border rounded-xl">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50 text-foreground">
                                            <tr>
                                                <th className="text-left p-3 font-semibold">Data Category</th>
                                                <th className="text-left p-3 font-semibold">Purpose</th>
                                                <th className="text-left p-3 font-semibold">Where It Is Stored</th>
                                                <th className="text-left p-3 font-semibold">Shared With</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            <tr>
                                                <td className="p-3">Account &amp; authentication data (email, password, session tokens)</td>
                                                <td className="p-3">Sign in to your account and authorize AI requests</td>
                                                <td className="p-3">Session tokens in <code>chrome.storage.local</code>; account record on our authentication provider</td>
                                                <td className="p-3">Supabase (authentication &amp; backend hosting)</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3">Documents you upload (CV, resume, ID, images, PDF, DOCX, text)</td>
                                                <td className="p-3">AI extraction of the personal details needed to fill forms</td>
                                                <td className="p-3">Processed in transit only; not retained after processing</td>
                                                <td className="p-3">Our server, then Google Gemini API</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3">Personal information extracted from documents (name, contact, address, ID numbers, etc.)</td>
                                                <td className="p-3">Reused to autofill forms without re-uploading documents</td>
                                                <td className="p-3"><code>chrome.storage.local</code> on your device</td>
                                                <td className="p-3">Google Gemini API (only when you trigger an autofill/extraction)</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3">Web form / page content of the active tab</td>
                                                <td className="p-3">Detect and fill form fields you ask us to fill</td>
                                                <td className="p-3">Not stored; processed in memory during the action</td>
                                                <td className="p-3">Our server, then Google Gemini API (for AI field mapping)</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3">Subscription &amp; usage data (plan, balance, usage limits)</td>
                                                <td className="p-3">Enforce plan limits and show your remaining balance</td>
                                                <td className="p-3">Cached in <code>chrome.storage.local</code>; held on our backend</td>
                                                <td className="p-3">Supabase (backend hosting)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* 3. Information We Collect */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Information We Collect</h2>

                                <h3 className="text-lg font-semibold text-foreground mb-2">3.1 Account &amp; Authentication Information</h3>
                                <p className="mb-4 text-sm">
                                    To use the AI-powered features, you sign in with an account. When you log in through the Extension, you provide your <strong>email address</strong> and <strong>password</strong>. These credentials are transmitted directly to our authentication provider (Supabase) over an encrypted connection to verify your identity. We do <strong>not</strong> store your password ourselves; after sign-in we receive and store only short-lived <strong>session tokens</strong> (access and refresh tokens) used to authorize your requests.
                                </p>

                                <h3 className="text-lg font-semibold text-foreground mb-2">3.2 Documents You Upload</h3>
                                <p className="mb-4 text-sm">
                                    When you choose to upload a file — such as a CV, resume, application form, national ID, or other identity or personal document, in image, PDF, DOCX, or plain-text format — the Extension reads that file so its contents can be processed for data extraction. PDF, DOCX, and text files are parsed within your browser; images are compressed within your browser before transmission.
                                </p>

                                <h3 className="text-lg font-semibold text-foreground mb-2">3.3 Personal Information Extracted From Your Documents</h3>
                                <p className="mb-4 text-sm">
                                    From the documents you upload, the AI extracts structured personal information so it can be used to fill forms. Depending on the document, this may include sensitive personal data such as your full name, parents&apos; names, date of birth, gender, nationality, national ID or passport number, postal and permanent addresses, phone number, email address, education and work history, and a profile photograph.
                                </p>

                                <h3 className="text-lg font-semibold text-foreground mb-2">3.4 Web Form &amp; Active Page Content</h3>
                                <p className="mb-4 text-sm">
                                    When you ask the Extension to fill a form, it reads the structure and form fields of the <strong>currently active tab</strong> (for example, field labels and input elements) so it can match your saved information to the correct fields. <strong>Autofill Genius AI</strong> only runs on a limited set of websites it is designed for. <strong>Instant Autofill Engine</strong> can operate on any website where you explicitly invoke it. In both cases, page content is read only when you actively use the Extension on that page. We do <strong>not</strong> collect, track, or record your general browsing history, the list of sites you visit, or your activity on pages where you do not invoke the Extension.
                                </p>

                                <h3 className="text-lg font-semibold text-foreground mb-2">3.5 Subscription &amp; Usage Information</h3>
                                <p className="mb-4 text-sm">
                                    To enforce plan limits, the Extension retrieves and locally caches account-related information from our backend, such as your associated account/shop name, subscription plan, remaining balance, and how many extractions you have used against your limit.
                                </p>

                                <h3 className="text-lg font-semibold text-foreground mb-2">3.6 Technical &amp; Diagnostic Information</h3>
                                <p className="text-sm">
                                    When the Extension communicates with our server, standard request information (such as the authenticated request and error responses) may be processed transiently to operate and secure the service. We do not use this information to build advertising or behavioral profiles.
                                </p>
                            </section>

                            {/* 4. How We Use Your Data */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">4. How We Use Your Data</h2>
                                <p className="mb-4 text-sm">We use the information described above strictly for the following purposes:</p>
                                <ul className="list-disc pl-6 space-y-2 text-sm">
                                    <li>To authenticate you and authorize your AI extraction and autofill requests.</li>
                                    <li>To extract structured personal details from documents you upload.</li>
                                    <li>To map your saved information to the fields of forms you are completing.</li>
                                    <li>To store your extracted profile data locally so you can reuse it without re-uploading documents.</li>
                                    <li>To enforce subscription limits and display your remaining balance and usage.</li>
                                    <li>To maintain the security, integrity, and reliability of the service, including investigating abuse.</li>
                                    <li>To comply with applicable legal obligations.</li>
                                </ul>
                                <p className="mt-4 text-sm">
                                    We do <strong>not</strong> use your data for advertising, retargeting, interest-based profiling, creditworthiness or lending decisions, or to train third-party AI models.
                                </p>
                            </section>

                            {/* 5. How We Handle & Process Your Data */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">5. How We Handle &amp; Process Your Data</h2>
                                <ul className="list-disc pl-6 space-y-2 text-sm">
                                    <li><strong className="text-foreground">Client-side preparation:</strong> PDF, DOCX, and text files are parsed inside your browser. Images are resized and compressed inside your browser before any transmission.</li>
                                    <li><strong className="text-foreground">Transmission through our server:</strong> To perform AI extraction and field mapping, the document content (or the active page&apos;s form context) is transmitted over an encrypted HTTPS/TLS connection, together with your session token, to our backend service at nexitsolution.bd.</li>
                                    <li><strong className="text-foreground">AI processing:</strong> Our backend forwards the content to the Google Gemini API, which returns the structured data. The data is processed solely to fulfil your request.</li>
                                    <li><strong className="text-foreground">No model training:</strong> Content sent for processing is used only to return your result and is not used by us or by the AI provider to train models.</li>
                                    <li><strong className="text-foreground">No human review:</strong> We do not allow humans to read your documents or extracted data except with your affirmative consent, where necessary for security or abuse investigation, or where required by law.</li>
                                    <li><strong className="text-foreground">Only on your action:</strong> Data handling occurs only when you actively trigger a sign-in, extraction, or autofill. The Extension does not process data passively or in the background.</li>
                                </ul>
                            </section>

                            {/* 6. How We Store & Retain Your Data */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">6. How We Store &amp; Retain Your Data</h2>
                                <ul className="list-disc pl-6 space-y-2 text-sm">
                                    <li><strong className="text-foreground">Local storage on your device:</strong> Your extracted profile data, saved profiles, profile photo, session tokens, and cached account/usage information are stored locally in your browser using <code>chrome.storage.local</code>. This data stays on your device and is not synced to our servers by the Extension.</li>
                                    <li><strong className="text-foreground">No server retention of documents:</strong> Documents you upload and the active page content are processed in transit only. We do not permanently store, archive, or retain your uploaded documents or page content on our servers after the request that processes them is complete.</li>
                                    <li><strong className="text-foreground">Account record:</strong> Your account (including your email address) and subscription/usage records are stored by our authentication and backend provider (Supabase) for as long as your account remains active, so that you can sign in and so that plan limits can be enforced.</li>
                                    <li><strong className="text-foreground">Retention period:</strong> Locally stored data persists until you delete it or uninstall the Extension. Account and subscription records are retained for the life of your account and deleted on account closure, subject to any retention required by law.</li>
                                </ul>
                            </section>

                            {/* 7. How We Share Your Data */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">7. How We Share Your Data</h2>
                                <p className="mb-4 text-sm">We limit data sharing to what is strictly necessary to deliver the service:</p>
                                <ul className="list-disc pl-6 space-y-2 text-sm">
                                    <li><strong className="text-foreground">Google (Gemini API):</strong> Document content and form context are transmitted, via our server, to the Google Gemini API to perform AI extraction and field mapping. This processing is performed only to return your requested result.</li>
                                    <li><strong className="text-foreground">Supabase:</strong> We use Supabase for authentication and backend hosting. Your sign-in credentials are verified by Supabase, and your account and subscription/usage records are stored on Supabase infrastructure.</li>
                                    <li><strong className="text-foreground">No sale of data:</strong> We do not sell, rent, trade, or license your personal data to anyone, and we do not share it with advertising platforms, data brokers, or information resellers.</li>
                                    <li><strong className="text-foreground">Legal &amp; safety:</strong> We may disclose data if required to do so by law, regulation, legal process, or enforceable governmental request, or where necessary to protect the rights, safety, or security of our users or the service.</li>
                                    <li><strong className="text-foreground">Business transfers:</strong> If we are involved in a merger, acquisition, or sale of assets, user data may be transferred only after obtaining your explicit prior consent, consistent with the Limited Use requirements above.</li>
                                </ul>
                            </section>

                            {/* 8. Data Security */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Data Security</h2>
                                <p className="text-sm">
                                    All communication between the Extension, our servers, and our service providers is encrypted in transit using industry-standard HTTPS/TLS. Authentication uses short-lived session tokens rather than storing your password on your device, and tokens are refreshed and discarded automatically. While no method of electronic transmission or storage is completely secure, we apply reasonable technical and organizational safeguards to protect your information.
                                </p>
                            </section>

                            {/* 9. Your Rights & Choices */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Your Rights &amp; Choices</h2>
                                <ul className="list-disc pl-6 space-y-2 text-sm">
                                    <li><strong className="text-foreground">Access &amp; edit:</strong> You can view and edit all of your saved profile data directly within the Extension&apos;s interface at any time.</li>
                                    <li><strong className="text-foreground">Delete locally:</strong> You can delete individual profiles or all locally stored data through the Extension, or remove all of it by uninstalling the Extension.</li>
                                    <li><strong className="text-foreground">Account deletion:</strong> You may request deletion of your account and associated server-side records by contacting us at the email address below. We will action verified requests within a reasonable period, subject to legal retention requirements.</li>
                                    <li><strong className="text-foreground">Withdraw use:</strong> You can stop all data processing at any time by signing out and/or uninstalling the Extension.</li>
                                </ul>
                            </section>

                            {/* 10. Children's Privacy */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Children&apos;s Privacy</h2>
                                <p>
                                    The Extensions are not directed to children under the age of 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us at <strong className="text-foreground">nexai6720@gmail.com</strong> and we will promptly delete it.
                                </p>
                            </section>

                            {/* 11. Cookies and Tracking */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">11. Cookies &amp; Tracking Technologies</h2>
                                <p>
                                    The Extensions do not use cookies, web beacons, pixel tags, advertising identifiers, or any passive cross-site tracking technologies. Local data is stored exclusively in <code>chrome.storage.local</code>, a browser storage mechanism scoped to the Extension and not accessible to the websites you visit.
                                </p>
                            </section>

                            {/* 12. International Users */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">12. International Data Processing</h2>
                                <p>
                                    Our service providers (including Google and Supabase) may process data on infrastructure located in countries other than your own. Where data is transferred internationally, it remains protected by encryption in transit and is processed only for the purposes described in this policy.
                                </p>
                            </section>

                            {/* 13. Changes */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">13. Changes to This Privacy Policy</h2>
                                <p>
                                    We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. When we make material changes, we will update the &quot;Last Updated&quot; date at the top of this page and, where feasible, provide a notification within the Extension or on the Chrome Web Store listing. Your continued use of the Extensions after changes take effect constitutes acceptance of the updated policy.
                                </p>
                            </section>

                            {/* 14. Contact */}
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">14. Contact Us</h2>
                                <p className="mb-2">
                                    If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
                                </p>
                                <div className="bg-muted/50 p-5 rounded-xl border text-sm space-y-1">
                                    <p><strong className="text-foreground">Company:</strong> Nex IT Solution</p>
                                    <p><strong className="text-foreground">Email:</strong> nexai6720@gmail.com</p>
                                    <p><strong className="text-foreground">Website:</strong> https://nexitsolution.bd/privacy-policy</p>
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
