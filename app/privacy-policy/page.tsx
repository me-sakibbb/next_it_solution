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
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
                                <p>
                                    This Privacy Policy describes how <strong>Autofill Genius AI</strong> (referred to as "the Extension", "we", "us", or "our") collects, uses, stores, and protects user data. 
                                    Our Chrome extension is designed to help users autofill online application forms by extracting relevant information from documents voluntarily uploaded by the user.
                                </p>
                                <p className="mt-4">
                                    We are committed to protecting user privacy and complying with the <strong>Chrome Web Store User Data Policy</strong>, including the Limited Use requirements.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
                                <p className="mb-4">Our extension may process the following types of data:</p>
                                
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="bg-muted/50 p-6 rounded-xl border">
                                        <h3 className="text-lg font-medium text-foreground mb-2">a) User-Provided Data</h3>
                                        <ul className="list-disc pl-5 space-y-2 text-sm">
                                            <li>Documents uploaded by the user (such as CVs, application forms, or other files)</li>
                                            <li>Information extracted from those documents (such as name, email, phone number, address, education, etc.)</li>
                                        </ul>
                                    </div>
                                    <div className="bg-muted/50 p-6 rounded-xl border">
                                        <h3 className="text-lg font-medium text-foreground mb-2">b) Automatically Processed Data</h3>
                                        <ul className="list-disc pl-5 space-y-2 text-sm">
                                            <li>Form field data on websites where the user chooses to autofill</li>
                                            <li>Basic technical data necessary for extension functionality (e.g., extension settings)</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use the Information</h2>
                                <p className="mb-4">We use the collected information <strong>only</strong> to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Extract relevant data from user-uploaded documents using AI processing.</li>
                                    <li>Autofill online forms at the user’s explicit request.</li>
                                    <li>Improve the accuracy of form field detection and data mapping.</li>
                                </ul>

                                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                        We do <strong>NOT</strong> use user data for:
                                    </p>
                                    <ul className="list-disc pl-6 mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                        <li>Advertising or marketing purposes.</li>
                                        <li>Selling to third parties, data brokers, or ad networks.</li>
                                        <li>Profiling users or tracking behavior across websites.</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Processing and Storage</h2>
                                <p>
                                    <strong>Local Processing:</strong> Whenever possible, data is processed locally within the user's browser. 
                                    We prioritize privacy by minimizing data transmission.
                                </p>
                                <p className="mt-4">
                                    <strong>No External Storage:</strong> We do not collect, transmit, or store your personal information on our external servers for any purpose other than providing the core functionality of the extension. 
                                    We do not maintain a database of your uploaded documents or extracted personal profiles.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Sharing</h2>
                                <p>
                                    We do not sell, rent, or share user personal data with third parties. Data is only handled as necessary to perform the autofill function initiated by the user. 
                                    We do not share data with third-party AI models in a way that allows them to train on your personal information.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Security</h2>
                                <p>
                                    We implement appropriate technical and organizational security measures to protect user data against unauthorized access, alteration, disclosure, or destruction. 
                                    All data transmissions (if any) are encrypted using industry-standard SSL/TLS protocols.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">7. User Control</h2>
                                <p className="mb-4">Users have full control over their data:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Choice:</strong> Users choose which documents to upload and when to trigger the autofill action.</li>
                                    <li><strong>Uninstallation:</strong> Users can uninstall the extension at any time.</li>
                                    <li><strong>Data Clearance:</strong> Any locally stored data (settings, cached fragments) can be cleared by removing the extension or clearing browser data.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Children's Privacy</h2>
                                <p>
                                    This extension is not intended for children under the age of 13. We do not knowingly collect personal information from children. 
                                    If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Changes to This Privacy Policy</h2>
                                <p>
                                    We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. 
                                    We encourage users to frequently check this page for any changes.
                                </p>
                            </section>

                            <section className="pt-10 border-t">
                                <h2 className="text-2xl font-semibold text-foreground mb-6">10. Contact Information</h2>
                                <p className="mb-6">If you have any questions about this Privacy Policy, you may contact us at:</p>
                                
                                <div className="bg-muted/50 p-6 rounded-2xl border space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Company</p>
                                        <p className="text-foreground text-lg font-medium">Nex IT Solution</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Email</p>
                                        <a href="mailto:nexai6720@gmail.com" className="text-primary hover:underline text-lg font-medium">nexai6720@gmail.com</a>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Website</p>
                                        <a href="https://next-it-solution.vercel.app" className="text-primary hover:underline text-lg font-medium">next-it-solution.vercel.app</a>
                                    </div>
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
