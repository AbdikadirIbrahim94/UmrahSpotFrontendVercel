/**
 * Footer Component
 * Site footer with navigation links, payment methods, and social media icons
 */
import Image from "next/image"
import { Instagram, Facebook, TrendingUp, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#dddddd] mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Logo and Navigation Links */}
          <div>
            <Image src="/umrahspot-logo.jpg" alt="UmrahSpot.com" width={200} height={50} className="h-10 w-auto mb-6" />
            <nav className="space-y-2" aria-label="Footer navigation">
              <a href="#home" className="block text-[#666666] hover:text-[#333333] transition-colors">
                Home
              </a>
              <a href="#about" className="block text-[#666666] hover:text-[#333333] transition-colors">
                About Us
              </a>
              <a href="#faq" className="block text-[#666666] hover:text-[#333333] transition-colors">
                FAQ
              </a>
              <a href="#terms" className="block text-[#666666] hover:text-[#333333] transition-colors">
                Terms & Conditions
              </a>
              <a href="#cancellations" className="block text-[#666666] hover:text-[#333333] transition-colors">
                Cancellations
              </a>
            </nav>
          </div>

          {/* Payment Methods and Social Media */}
          <div className="flex flex-col items-start md:items-end gap-6">
            {/* Payment Methods */}
            <div className="flex gap-3 flex-wrap" role="list" aria-label="Accepted payment methods">
              <Image src="/mastercard-logo.png" alt="Mastercard" width={50} height={30} />
              <Image src="/maestro-logo.jpg" alt="Maestro" width={50} height={30} />
              <Image src="/paypal-logo.png" alt="PayPal" width={50} height={30} />
              <Image src="/visa-logo-generic.png" alt="Visa" width={50} height={30} />
            </div>

            {/* Social Media Links */}
            <div className="flex gap-4" role="list" aria-label="Social media links">
              <a
                href="#instagram"
                className="text-[#666666] hover:text-[#333333] transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#facebook"
                className="text-[#666666] hover:text-[#333333] transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#tiktok"
                className="text-[#666666] hover:text-[#333333] transition-colors"
                aria-label="Follow us on TikTok"
              >
                <TrendingUp className="w-5 h-5" />
              </a>
              <a
                href="#linkedin"
                className="text-[#666666] hover:text-[#333333] transition-colors"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
