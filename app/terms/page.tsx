import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export default function TermsPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 bg-muted/30 pt-24 pb-16">
                <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                    <div className="bg-background rounded-2xl p-8 md:p-12 shadow-sm border">
                        <h1 className="text-3xl font-bold tracking-tight mb-8">Terms & Conditions</h1>

                        <div className="space-y-8 text-muted-foreground leading-relaxed">
                            <p>
                                Nex IT Solution-এ স্বাগতম। আমাদের ওয়েবসাইট ও সার্ভিস ব্যবহার করার মাধ্যমে আপনি নিচের শর্তাবলীতে সম্মত হচ্ছেন। অনুগ্রহ করে মনোযোগ সহকারে পড়ুন।
                            </p>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-3">১. সার্ভিসের প্রকৃতি</h2>
                                <p>Nex IT Solution একটি AI-চালিত ডিজিটাল প্ল্যাটফর্ম, যা IT সার্ভিস প্রোভাইডার ব্যবসায়ীদের জন্য অটোমেশন টুলস, স্মার্ট খাতা, POS, ইনভেন্টরি ম্যানেজমেন্ট এবং প্রিমিয়াম অর্ডার সার্ভিস প্রদান করে।</p>
                                <p>আমরা প্রযুক্তিগত সেবা প্রদান করি; চূড়ান্ত সরকারি অনুমোদন, ভিসা অনুমোদন বা তৃতীয় পক্ষের ফলাফলের নিশ্চয়তা প্রদান করি না।</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-3">২. অ্যাকাউন্ট রেজিস্ট্রেশন</h2>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>ব্যবহারকারীকে সঠিক ও হালনাগাদ তথ্য প্রদান করতে হবে।</li>
                                    <li>অ্যাকাউন্টের নিরাপত্তা ব্যবহারকারীর দায়িত্ব।</li>
                                    <li>যেকোনো অননুমোদিত ব্যবহার হলে দ্রুত আমাদের জানাতে হবে।</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-3">৩. সাবস্ক্রিপশন ও পেমেন্ট</h2>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>সকল সাবস্ক্রিপশন ফি অগ্রিম পরিশোধযোগ্য।</li>
                                    <li>সাবস্ক্রিপশন নির্দিষ্ট সময়ের জন্য বৈধ।</li>
                                    <li>সময়মতো নবায়ন না করলে সার্ভিস স্থগিত হতে পারে।</li>
                                    <li>সাবস্ক্রিপশন ফি সাধারণত নন-রিফান্ডেবল (রিফান্ড পলিসি অনুযায়ী)।</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-3">৪. Pay-Per-Order ও ব্যালেন্স সিস্টেম</h2>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>নির্দিষ্ট সার্ভিসের ক্ষেত্রে প্রতি অর্ডারে ব্যালেন্স থেকে চার্জ কাটা হবে।</li>
                                    <li>অর্ডার সাবমিট করার আগে তথ্য যাচাই করা ব্যবহারকারীর দায়িত্ব।</li>
                                    <li>ভুল তথ্যের কারণে সৃষ্ট সমস্যার দায় ব্যবহারকারীর।</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-3">৫. প্রিমিয়াম অর্ডার সার্ভিস</h2>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>ডিজাইন, মার্কেটিং বা অন্যান্য কাস্টম সার্ভিস নির্দিষ্ট শর্ত অনুযায়ী প্রদান করা হবে।</li>
                                    <li>নির্ধারিত রিভিশন সীমার মধ্যে সংশোধন করা হবে।</li>
                                    <li>কাজ শুরু হওয়ার পর অর্ডার বাতিলযোগ্য নয় (রিফান্ড পলিসি প্রযোজ্য)।</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-3">৬. ব্যবহার সীমাবদ্ধতা</h2>
                                <p className="mb-2">ব্যবহারকারী নিম্নলিখিত কাজ করতে পারবেন না:</p>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>অবৈধ কার্যকলাপের জন্য প্ল্যাটফর্ম ব্যবহার</li>
                                    <li>সিস্টেম হ্যাকিং বা ক্ষতি করার চেষ্টা</li>
                                    <li>ভুয়া তথ্য প্রদান</li>
                                    <li>অন্যের পরিচয় ব্যবহার</li>
                                </ul>
                                <p className="mt-2">এই ধরনের কার্যকলাপের ক্ষেত্রে অ্যাকাউন্ট স্থগিত বা বাতিল করা হতে পারে।</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-3">৭. মেধাস্বত্ব (Intellectual Property)</h2>
                                <p>Nex IT Solution-এর সকল সফটওয়্যার, ডিজাইন, কনটেন্ট ও ব্র্যান্ড উপাদান আমাদের নিজস্ব সম্পত্তি। পূর্বানুমতি ছাড়া কপি, পুনঃপ্রকাশ বা বাণিজ্যিক ব্যবহার নিষিদ্ধ।</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-3">৮. দায়বদ্ধতার সীমা</h2>
                                <p className="mb-2">আমরা সর্বোচ্চ মানের সার্ভিস প্রদানের চেষ্টা করি। তবে:</p>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>তৃতীয় পক্ষের সিস্টেম সমস্যা</li>
                                    <li>ইন্টারনেট সংযোগজনিত সমস্যা</li>
                                    <li>ব্যবহারকারীর ভুল ইনপুট</li>
                                </ul>
                                <p className="mt-2">এসব ক্ষেত্রে Nex IT Solution দায়ী থাকবে না।</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-3">৯. সার্ভিস পরিবর্তন</h2>
                                <p>আমরা যেকোনো সময় সার্ভিস আপডেট, পরিবর্তন বা স্থগিত করার অধিকার সংরক্ষণ করি।</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-3">১০. অ্যাকাউন্ট বাতিল</h2>
                                <p>নিয়ম ভঙ্গ, প্রতারণা বা অপব্যবহারের ক্ষেত্রে পূর্ব নোটিশ ছাড়াই অ্যাকাউন্ট বাতিল করা হতে পারে।</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-3">১১. নীতিমালা পরিবর্তন</h2>
                                <p>এই Terms & Conditions সময় সময় আপডেট করা হতে পারে। আপডেটকৃত সংস্করণ ওয়েবসাইটে প্রকাশের পর কার্যকর হবে।</p>
                            </section>

                            <section className="mt-12 p-6 bg-muted/50 rounded-xl">
                                <h2 className="text-xl font-semibold text-foreground mb-4">যোগাযোগ</h2>
                                <p className="mb-4">কোনো প্রশ্ন বা সহায়তার জন্য আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।</p>
                                <div className="space-y-1 text-foreground font-medium">
                                    <p>Nex IT Solution</p>
                                    <p>AI দিয়ে ব্যবসা অটোমেট করুন।</p>
                                    <p>স্মার্ট সিস্টেমে নিয়ন্ত্রণ নিন।</p>
                                    <p>লাভের গতি বাড়ান।</p>
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
