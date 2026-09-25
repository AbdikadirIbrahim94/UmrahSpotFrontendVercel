/**
 * Type Definitions
 * Shared TypeScript interfaces and types for the application
 */

export interface RoomConfig {
  id: number
  adults: number
  children: number
}

export interface BookingFormData {
  medina: {
    checkIn: string
    checkOut: string
    rooms: number
    roomConfigs: RoomConfig[]
  }
  makkah: {
    checkIn: string
    checkOut: string
    rooms: number
    roomConfigs: RoomConfig[]
  }
}

export interface HotelData {
  id?: string
  image: string
  distance: string
  name: string
  rating: number
  stars: number
  mapCount: number
  description: string
  price: number
  amenities: string[]
  location: "makkah" | "madinah"
}

export interface SearchParams {
  destination: string
  checkIn: string
  checkOut: string
  rooms: number
  adults: number
  children: number
}
