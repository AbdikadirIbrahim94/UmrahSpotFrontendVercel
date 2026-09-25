"use client"

/**
 * Hotel Card Component
 * Displays hotel information including image, amenities, pricing, and booking CTA
 */
import Image from "next/image"
import { MapPin, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export interface HotelData {
  image: string
  distance: string
  name: string
  rating: number
  stars: number
  mapCount: number
  description: string
  price: number
  amenities: string[]
}

interface HotelCardProps {
  hotel: HotelData
  onBook?: () => void
}

export function HotelCard({ hotel, onBook }: HotelCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Hotel Image with Distance Badge */}
      <div className="relative">
        <Image
          src={hotel.image || "/placeholder.svg"}
          alt={hotel.name}
          width={300}
          height={200}
          className="w-full h-48 object-cover"
        />

        {/* Distance Badge */}
        <div className="absolute top-2 left-2 bg-[#142444] text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <MapPin className="w-3 h-3" aria-hidden="true" />
          <span>{hotel.distance}</span>
        </div>

        {/* Image Carousel Indicators */}
        <div
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1"
          role="group"
          aria-label="Image carousel"
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i === 2 ? "bg-white" : "bg-white/50"}`}
              aria-label={`Image ${i + 1} of 5`}
              aria-current={i === 2 ? "true" : "false"}
            ></div>
          ))}
        </div>
      </div>

      {/* Hotel Details */}
      <div className="p-4">
        {/* Hotel Name and Favorite */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-[#333333]">{hotel.name}</h3>
          <button
            className="flex items-center gap-1 hover:text-[#ffd700] transition-colors"
            aria-label="Add to favorites"
          >
            <Heart className="w-4 h-4 text-[#666666]" />
            <span className="text-xs text-[#666666]">({hotel.rating})</span>
          </button>
        </div>

        {/* Star Rating and Map Location */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex" role="img" aria-label={`${hotel.stars} star rating`}>
            {[...Array(hotel.stars)].map((_, i) => (
              <span key={i} className="text-[#ffd700]" aria-hidden="true">
                ★
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs text-[#666666]">
            <MapPin className="w-3 h-3" aria-hidden="true" />
            <span>{hotel.mapCount}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[#999999] mb-3">{hotel.description}</p>

        {/* Amenities List */}
        <ul className="space-y-1 mb-4" aria-label="Hotel amenities">
          {hotel.amenities.map((amenity, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-[#666666]">
              <div className="w-1 h-1 bg-[#666666] rounded-full" aria-hidden="true"></div>
              {amenity}
            </li>
          ))}
        </ul>

        {/* Pricing and Booking */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-[#333333]">$ {hotel.price}</div>
            <div className="text-xs text-[#999999]">Price per night</div>
          </div>
          <Button
            onClick={onBook}
            className="bg-white hover:bg-[#f8f8f8] text-[#333333] border border-[#dddddd] text-sm transition-colors"
          >
            Book Now →
          </Button>
        </div>
      </div>
    </Card>
  )
}
