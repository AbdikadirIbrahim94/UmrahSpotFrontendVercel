/**
 * Partner Logos Component
 * Displays trusted partner logos (Google, Slack, etc.)
 */
import Image from "next/image"

export function PartnerLogos() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-center text-[#333333] mb-8">UmrahSpot Brings You the Best Deals From</h2>
      <div className="flex items-center justify-center gap-16 flex-wrap">
        <Image src="/google-logo.png" alt="Google" width={180} height={60} className="h-12 w-auto" />
        <Image src="/slack-logo.png" alt="Slack" width={180} height={60} className="h-12 w-auto" />
      </div>
    </section>
  )
}
