"use client"

/**
 * Hotel Section Component
 * Displays a section of hotel listings with title and "Find More" link
 */
import { HotelCard, type HotelData } from "./hotel-card"

interface HotelSectionProps {
  title: string
  hotels: HotelData[]
  onFindMore?: () => void
}

export function HotelSection({ title, hotels, onFindMore }: HotelSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#333333]">{title}</h2>
        <button
          onClick={onFindMore}
          className="text-[#ffd700] hover:text-[#d9b700] font-semibold flex items-center gap-1 transition-colors"
          aria-label={`Find more hotels in ${title.split(" in ")[1]}`}
        >
          Find More Spots{" "}
          <span className="text-xl" aria-hidden="true">
            →
          </span>
        </button>
      </div>

      {/* Hotel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {hotels.map((hotel, index) => (
          <HotelCard key={`${title}-${index}`} hotel={hotel} onBook={() => console.log(`Booking ${hotel.name}`)} />
        ))}
      </div>
    </section>
  )
}
