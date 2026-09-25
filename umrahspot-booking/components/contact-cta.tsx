"use client"

/**
 * Contact CTA Component
 * Call-to-action section for contacting support via WhatsApp or email
 */
import { MessageCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ContactCTA() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-[#ffd700] rounded-lg p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#333333]">Contact Us To Learn More!</h2>
        <div className="flex gap-4 flex-wrap">
          <Button
            className="bg-[#d9b700] hover:bg-[#c4a600] text-[#333333] font-semibold transition-colors"
            onClick={() => window.open("https://wa.me/", "_blank")}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Us
          </Button>
          <Button
            className="bg-[#d9b700] hover:bg-[#c4a600] text-[#333333] font-semibold transition-colors"
            onClick={() => (window.location.href = "mailto:support@umrahspot.com")}
          >
            <Mail className="w-4 h-4 mr-2" />
            Send E-Mail
          </Button>
        </div>
      </div>
    </section>
  )
}
