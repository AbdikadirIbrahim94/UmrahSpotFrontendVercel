/**
 * Header Component
 * Main navigation header with logo, menu items, language/currency selectors, and CTA button
 */
"use client"

import { ChevronDown } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="bg-white border-b border-[#dddddd]">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <a href="/" aria-label="UmrahSpot Home">
              <Image src="/umrahspot-logo.jpg" alt="UmrahSpot.com" width={200} height={50} className="h-10 w-auto" />
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
              <a
                href="#makkah"
                className="text-[#333333] hover:text-[#ffd700] border-b-2 border-[#333333] pb-1 transition-colors"
              >
                Makkah Hotels
              </a>
              <a href="#medina" className="text-[#666666] hover:text-[#ffd700] transition-colors">
                Medina Hotels
              </a>
              <div className="relative">
                <a href="#activities" className="text-[#666666] hover:text-[#ffd700] transition-colors">
                  Activities
                </a>
                <span
                  className="absolute -top-2 -right-8 bg-[#4285f4] text-white text-xs px-2 py-0.5 rounded"
                  aria-label="New feature"
                >
                  NEW
                </span>
              </div>
            </nav>
          </div>

          {/* Language, Currency, and CTA */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <button
              className="flex items-center gap-1 text-[#333333] hover:text-[#ffd700] transition-colors"
              aria-label="Select language"
            >
              EN <ChevronDown className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Currency Selector */}
            <button
              className="flex items-center gap-1 text-[#333333] hover:text-[#ffd700] transition-colors"
              aria-label="Select currency"
            >
              € EUR <ChevronDown className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Manage Booking CTA */}
            <Button className="bg-[#ffd700] hover:bg-[#d9b700] text-[#333333] font-semibold transition-colors">
              Manage Booking
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
