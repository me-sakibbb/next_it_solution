import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 bg-muted/30 pt-24 pb-16">
                <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                    <div className="bg-background rounded-2xl p-8 md:p-12 shadow-sm border">
                        <h1 className="text-3xl font-bold tracking-tight mb-8">About Us</h1>

                        <div className="space-y-6 text-muted-foreground leading-relaxed">
                            <p>
                                <strong className="text-foreground">Nex IT Solution</strong> হলো একটি AI-চালিত ডিজিটাল প্ল্যাটফর্ম, যা বিশেষভাবে IT সার্ভিস প্রোভাইডার ব্যবসায়ীদের জন্য তৈরি। আমরা প্রযুক্তিকে এমনভাবে ব্যবহার করি যাতে আপনার কাজ হয় দ্রুত, সহজ এবং লাভজনক।
                            </p>

                            <div className="pt-4">
                                <h2 className="text-xl font-semibold text-foreground mb-4">আমরা কী করি</h2>
                                <p className="mb-4">
                                    কৃত্রিম বুদ্ধিমত্তা ব্যবহার করে আপনার দোকানের বিভিন্ন ম্যানুয়াল কাজসমূহ কে অটোমেশনের মাধ্যমে আরো বেশী কাস্টমার কে সার্ভিস দেয়ার সক্ষমতা প্রদান করি, এতে ব্যাবসার প্রফিট হয় আগের চেয়ে অনেকাংশে বেশি।
                                </p>
                                <p className="mb-4">
                                    একই সাথে ব্যবসার সব হিসাব-নিকাশ এখন পাচ্ছেন এক প্ল্যাটফর্মে। আর আলাদা খাতা বা জটিল সফটওয়্যার নয় — সবকিছু স্মার্ট, ক্লিন এবং থাকছে আপনার নিয়ন্ত্রণে।
                                </p>

                                <ul className="list-disc pl-6 space-y-2 mb-6">
                                    <li>আয়-ব্যয় ম্যানেজমেন্ট</li>
                                    <li>পয়েন্ট অফ সেল (POS)</li>
                                    <li>ইনভেন্টরি ম্যানেজমেন্ট</li>
                                    <li>সেলস রিপোর্ট ও প্রফিট অ্যানালাইসিস</li>
                                </ul>

                                <p>
                                    শুধু ম্যানেজমেন্ট নয়, আমরা আপনার ব্যবসা বড় করতেও কাজ করি। এরই প্রেক্ষিতে অটোমেশন সেবার পাশাপাশি আমাদের রয়েছে প্রিমিয়াম অর্ডার সার্ভিস।
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
