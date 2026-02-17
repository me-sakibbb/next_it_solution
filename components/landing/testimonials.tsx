'use client'

import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Star, User } from "lucide-react"

const testimonials = [
    {
        name: "Alex Johnson",
        role: "Owner, TechFix Pro",
        content: "This software completely transformed how we manage repairs. The inventory tracking alone saved us hours every week.",
        rating: 5
    },
    {
        name: "Sarah Williams",
        role: "Manager, Gadget Hub",
        content: "The best POS system we've used. It's fast, reliable, and the photo editor is a game-changer for our online listings.",
        rating: 5
    },
    {
        name: "Michael Brown",
        role: "CEO, IT Solutions Ltd",
        content: "Multiple shop management is seamless. I can see what's happening in all my branches in real-time.",
        rating: 5
    },
    {
        name: "Emily Davis",
        role: "Owner, Digital Dreams",
        content: "Customer support is fantastic, and the regular updates keep adding useful features. Highly recommended!",
        rating: 4
    }
]

export function Testimonials() {
    return (
        <section id="testimonials" className="py-24 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Trusted by IT Retailers</h2>
                    <p className="text-lg text-muted-foreground">
                        See what our customers have to say about their experience.
                    </p>
                </div>

                <div className="mx-auto max-w-4xl">
                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        className="w-full"
                    >
                        <CarouselContent>
                            {testimonials.map((testimonial, index) => (
                                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2 pl-4">
                                    <div className="p-1">
                                        <Card className="border-muted shadow-sm hover:shadow-md transition-shadow">
                                            <CardContent className="flex flex-col gap-4 p-6">
                                                <div className="flex text-yellow-500">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${i < testimonial.rating ? "fill-current" : "text-muted"}`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">{testimonial.name}</p>
                                                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex -left-12" />
                        <CarouselNext className="hidden md:flex -right-12" />
                    </Carousel>
                </div>
            </div>
        </section>
    )
}
