/**
 * Booking Form Component
 * Single-city booking form with city selector (Makkah or Medina)
 * Designed to be easily extended to multi-city in future phases
 */
"use client"

import { useState } from "react"
import { CalendarIcon, Search, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CustomCalendar } from "@/components/ui/custom-calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface RoomConfig {
  id: number
  adults: number
  children: number
}

type City = "makkah" | "medina"

// Constants for room capacity validation
const MAX_ADULTS_PER_ROOM = 4
const MAX_CHILDREN_PER_ROOM = 4
const MAX_TOTAL_GUESTS_PER_ROOM = 5

export function BookingForm() {
  const [selectedCity, setSelectedCity] = useState<City>("makkah")
  const [checkInDate, setCheckInDate] = useState<Date>()
  const [checkOutDate, setCheckOutDate] = useState<Date>()
  const [numberOfRooms, setNumberOfRooms] = useState<number>(1)
  const [roomConfigs, setRoomConfigs] = useState<RoomConfig[]>([{ id: 1, adults: 1, children: 0 }])

  // Validation functions for guest capacity
  /**
   * Checks if adding an adult is allowed based on room capacity rules
   */
  const canAddAdult = (room: RoomConfig): boolean => {
    const totalGuests = room.adults + room.children
    return room.adults < MAX_ADULTS_PER_ROOM && totalGuests < MAX_TOTAL_GUESTS_PER_ROOM
  }

  /**
   * Checks if adding a child is allowed based on room capacity rules
   */
  const canAddChild = (room: RoomConfig): boolean => {
    const totalGuests = room.adults + room.children
    return room.children < MAX_CHILDREN_PER_ROOM && totalGuests < MAX_TOTAL_GUESTS_PER_ROOM
  }

  const handleRoomNumberChange = (rooms: number) => {
    setNumberOfRooms(rooms)
    // Create or trim room configurations based on selected number
    const newConfigs = Array.from({ length: rooms }, (_, i) => {
      // Keep existing config if available, otherwise create new
      return roomConfigs[i] || { id: i + 1, adults: 1, children: 0 }
    })
    setRoomConfigs(newConfigs)
  }

  /**
   * Updates adult count for a specific room
   */
  const updateAdults = (roomIndex: number, increment: boolean) => {
    setRoomConfigs((prev) =>
      prev.map((room, idx) => {
        if (idx !== roomIndex) return room

        if (increment) {
          return canAddAdult(room) ? { ...room, adults: room.adults + 1 } : room
        } else {
          return { ...room, adults: Math.max(1, room.adults - 1) }
        }
      }),
    )
  }

  /**
   * Updates children count for a specific room
   */
  const updateChildren = (roomIndex: number, increment: boolean) => {
    setRoomConfigs((prev) =>
      prev.map((room, idx) => {
        if (idx !== roomIndex) return room

        if (increment) {
          return canAddChild(room) ? { ...room, children: room.children + 1 } : room
        } else {
          return { ...room, children: Math.max(0, room.children - 1) }
        }
      }),
    )
  }

  /**
   * Handles search form submission
   */
  const handleSearch = () => {
    // TODO: Implement search logic
    console.log("Searching with:", { city: selectedCity, checkInDate, checkOutDate, roomConfigs })
  }

  /**
   * Formats date to readable string
   */
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getMinCheckOutDate = () => {
    if (!checkInDate) return new Date()
    const minDate = new Date(checkInDate)
    minDate.setDate(minDate.getDate() + 1)
    return minDate
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="relative mb-[-40px] ml-8 z-10 w-fit">
        <div className="bg-[#ffd700] text-[#333333] text-2xl font-bold px-8 py-4 rounded-lg">Find Your Spot</div>
      </div>

      {/* Booking Form Card */}
      <Card className="bg-white p-6 shadow-lg pt-16 relative">
        {/* City Toggle */}
        <div className="flex gap-0 mb-6 w-fit rounded-lg overflow-hidden border border-[#dddddd]">
          <button
            onClick={() => setSelectedCity("makkah")}
            className={`px-8 py-3 font-semibold transition-all ${
              selectedCity === "makkah" ? "bg-[#ffd700] text-[#333333]" : "bg-white text-[#666666] hover:bg-[#f8f8f8]"
            }`}
            aria-label="Select Makkah"
            aria-pressed={selectedCity === "makkah"}
          >
            Makkah
          </button>
          <button
            onClick={() => setSelectedCity("medina")}
            className={`px-8 py-3 font-semibold transition-all ${
              selectedCity === "medina" ? "bg-[#ffd700] text-[#333333]" : "bg-white text-[#666666] hover:bg-[#f8f8f8]"
            }`}
            aria-label="Select Medina"
            aria-pressed={selectedCity === "medina"}
          >
            Medina
          </button>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="h-6 mb-1">
                <span className="font-semibold text-[#333333] capitalize text-sm block">{selectedCity}</span>
              </div>
              <label htmlFor="checkin" className="text-sm text-[#666666] mb-1 block">
                Check In
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    id="checkin"
                    className="w-full border border-[#dddddd] rounded px-3 py-2 pr-10 text-left text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#ffd700] relative"
                    aria-label={`Select check-in date for ${selectedCity}`}
                  >
                    {checkInDate ? formatDate(checkInDate) : <span className="text-[#999999]">Add dates</span>}
                    <CalendarIcon className="absolute right-3 top-2.5 w-5 h-5 text-[#666666]" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CustomCalendar
                    selected={checkInDate}
                    onSelect={setCheckInDate}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <div className="h-6 mb-1">{/* Empty space for alignment */}</div>
              <label htmlFor="checkout" className="text-sm text-[#666666] mb-1 block">
                Check Out
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    id="checkout"
                    className="w-full border border-[#dddddd] rounded px-3 py-2 pr-10 text-left text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#ffd700] relative"
                    aria-label={`Select check-out date for ${selectedCity}`}
                  >
                    {checkOutDate ? formatDate(checkOutDate) : <span className="text-[#999999]">Add dates</span>}
                    <CalendarIcon className="absolute right-3 top-2.5 w-5 h-5 text-[#666666]" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CustomCalendar
                    selected={checkOutDate}
                    onSelect={setCheckOutDate}
                    disabled={(date) => date < getMinCheckOutDate()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <div className="h-6 mb-1">{/* Empty space for alignment */}</div>
              <label htmlFor="rooms" className="text-sm text-[#666666] mb-1 block">
                Room Number
              </label>
              <select
                id="rooms"
                value={numberOfRooms}
                onChange={(e) => handleRoomNumberChange(Number(e.target.value))}
                className="w-full border border-[#dddddd] rounded px-3 py-2 text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
                aria-label={`Select number of rooms for ${selectedCity}`}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>

            <div>
              <div className="h-6 mb-1">{/* Empty space for alignment */}</div>
              <label className="text-sm text-[#666666] mb-1 block">Room 1</label>
              <div className="flex items-center gap-4">
                {/* Adults Counter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#666666]">Adults (5+ years):</span>
                  <button
                    onClick={() => updateAdults(0, false)}
                    disabled={roomConfigs[0].adults <= 1}
                    className="w-6 h-6 rounded-full border border-[#dddddd] flex items-center justify-center hover:bg-[#f8f8f8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Decrease adults"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-[#333333] w-4 text-center" aria-live="polite">
                    {roomConfigs[0].adults}
                  </span>
                  <button
                    onClick={() => updateAdults(0, true)}
                    disabled={!canAddAdult(roomConfigs[0])}
                    className="w-6 h-6 rounded-full border border-[#dddddd] flex items-center justify-center hover:bg-[#f8f8f8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Increase adults"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Children Counter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#666666]">Children (under 5):</span>
                  <button
                    onClick={() => updateChildren(0, false)}
                    disabled={roomConfigs[0].children <= 0}
                    className="w-6 h-6 rounded-full border border-[#dddddd] flex items-center justify-center hover:bg-[#f8f8f8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Decrease children"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-[#333333] w-4 text-center" aria-live="polite">
                    {roomConfigs[0].children}
                  </span>
                  <button
                    onClick={() => updateChildren(0, true)}
                    disabled={!canAddChild(roomConfigs[0])}
                    className="w-6 h-6 rounded-full border border-[#dddddd] flex items-center justify-center hover:bg-[#f8f8f8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Increase children"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {numberOfRooms > 1 && (
            <div className="space-y-4 mt-4">
              {roomConfigs.slice(1).map((room, index) => (
                <div key={room.id} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Empty columns for alignment */}
                  <div></div>
                  <div></div>
                  <div></div>

                  {/* Guest Counter for Room 2+ */}
                  <div>
                    <label className="text-sm text-[#666666] mb-1 block">Room {room.id}</label>
                    <div className="flex items-center gap-4">
                      {/* Adults Counter */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#666666]">Adults (5+ years):</span>
                        <button
                          onClick={() => updateAdults(index + 1, false)}
                          disabled={room.adults <= 1}
                          className="w-6 h-6 rounded-full border border-[#dddddd] flex items-center justify-center hover:bg-[#f8f8f8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label={`Decrease adults for room ${room.id}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-[#333333] w-4 text-center" aria-live="polite">
                          {room.adults}
                        </span>
                        <button
                          onClick={() => updateAdults(index + 1, true)}
                          disabled={!canAddAdult(room)}
                          className="w-6 h-6 rounded-full border border-[#dddddd] flex items-center justify-center hover:bg-[#f8f8f8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label={`Increase adults for room ${room.id}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Children Counter */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#666666]">Children (under 5):</span>
                        <button
                          onClick={() => updateChildren(index + 1, false)}
                          disabled={room.children <= 0}
                          className="w-6 h-6 rounded-full border border-[#dddddd] flex items-center justify-center hover:bg-[#f8f8f8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label={`Decrease children for room ${room.id}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-[#333333] w-4 text-center" aria-live="polite">
                          {room.children}
                        </span>
                        <button
                          onClick={() => updateChildren(index + 1, true)}
                          disabled={!canAddChild(room)}
                          className="w-6 h-6 rounded-full border border-[#dddddd] flex items-center justify-center hover:bg-[#f8f8f8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label={`Increase children for room ${room.id}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSearch}
            className="bg-[#ffd700] hover:bg-[#d9b700] text-[#333333] font-semibold px-8 transition-colors"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </Card>

      {/* WhatsApp Help Section */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-[#666666] text-sm">Need help with your booking? Chat with us on WhatsApp.</span>
        <a
          href="https://wa.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-[#34a853] flex items-center justify-center hover:bg-[#2d8e47] transition-colors"
          aria-label="Chat on WhatsApp"
        >
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>
      </div>
    </div>
  )
}
