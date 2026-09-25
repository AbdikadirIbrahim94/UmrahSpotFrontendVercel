/**
 * UmrahSpot Homepage
 * Main landing page for hotel booking platform serving Mecca and Medina pilgrims
 * Features: Multi-city search, hotel listings, partner integrations, and support contact
 */
"use client"

import { Header } from "@/components/header"
import { BookingForm } from "@/components/booking-form"
import { HotelSection } from "@/components/hotel-section"
import { PartnerLogos } from "@/components/partner-logos"
import { ContactCTA } from "@/components/contact-cta"
import { Footer } from "@/components/footer"
import type { HotelData } from "@/components/hotel-card"

export default function UmrahSpotPage() {
  // Sample hotel data - In production, this would come from an API
  const hotels: HotelData[] = [
    {
      image: "/luxury-hotel-room-with-bed.jpg",
      distance: "5 min to Al-Haram",
      name: "Home in Hawley",
      rating: 12,
      stars: 5,
      mapCount: 0,
      description: "Description text",
      price: 59,
      amenities: ["Wi-Fi", "Shuttle to Haram", "Wheelchair Friendly", "Breakfast Included", "Parking"],
    },
    {
      image: "/images/hotel-1.png",
      distance: "5 min to Al-Haram",
      name: "Home in Hawley",
      rating: 12,
      stars: 5,
      mapCount: 0,
      description: "Description text",
      price: 59,
      amenities: ["Wi-Fi", "Shuttle to Haram", "Wheelchair Friendly", "Breakfast Included", "Parking"],
    },
    {
      image: "/elegant-hotel-bedroom.jpg",
      distance: "5 min to Al-Haram",
      name: "Home in Hawley",
      rating: 12,
      stars: 5,
      mapCount: 0,
      description: "Description text",
      price: 59,
      amenities: ["Wi-Fi", "Shuttle to Haram", "Wheelchair Friendly", "Breakfast Included", "Parking"],
    },
    {
      image: "/comfortable-hotel-suite.jpg",
      distance: "5 min to Al-Haram",
      name: "Home in Hawley",
      rating: 12,
      stars: 5,
      mapCount: 0,
      description: "Description text",
      price: 59,
      amenities: ["Wi-Fi", "Shuttle to Haram", "Wheelchair Friendly", "Breakfast Included", "Parking"],
    },
    {
      image: "/premium-hotel-room.jpg",
      distance: "5 min to Al-Haram",
      name: "Home in Hawley",
      rating: 12,
      stars: 5,
      mapCount: 0,
      description: "Description text",
      price: 59,
      amenities: ["Wi-Fi", "Shuttle to Haram", "Wheelchair Friendly", "Breakfast Included", "Parking"],
    },
  ]

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header with navigation */}
      <Header />

      {/* Main booking form */}
      <BookingForm />

      {/* Hotel listings for Makkah */}
      <HotelSection
        title="Exclusive deals in Makkah"
        hotels={hotels}
        onFindMore={() => console.log("Find more Makkah hotels")}
      />

      {/* Hotel listings for Madinah */}
      <HotelSection
        title="Exclusive deals in Madinah"
        hotels={hotels}
        onFindMore={() => console.log("Find more Madinah hotels")}
      />

      {/* Partner logos section */}
      <PartnerLogos />

      {/* Contact CTA */}
      <ContactCTA />

      {/* Footer */}
      <Footer />
    </div>
  )
}
