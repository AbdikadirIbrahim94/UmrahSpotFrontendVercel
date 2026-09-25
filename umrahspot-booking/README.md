# UmrahSpot.com - Hotel Booking Platform

A modern, responsive hotel booking platform designed specifically for pilgrims traveling to Mecca and Medina for Umrah.

## Features

- **Single-City Booking**: Search and book hotels in either Makkah or Madinah (Phase 1 - single city selection)
- **Flexible Room Configuration**: Customize number of rooms, adults, and children per room
- **Hotel Listings**: Browse exclusive deals with detailed amenities and pricing
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop devices
- **Accessibility**: WCAG 2.1 compliant with proper ARIA labels and keyboard navigation
- **WhatsApp Integration**: Direct support channel for booking assistance

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## Project Structure

\`\`\`
├── app/
│   ├── page.tsx              # Main homepage
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── header.tsx            # Navigation header
│   ├── booking-form.tsx      # Multi-city booking form
│   ├── hotel-card.tsx        # Individual hotel card
│   ├── hotel-section.tsx     # Hotel listing section
│   ├── partner-logos.tsx     # Partner logos display
│   ├── contact-cta.tsx       # Contact call-to-action
│   └── footer.tsx            # Site footer
├── lib/
│   └── types.ts              # TypeScript type definitions
└── public/
    └── [images]              # Static assets
\`\`\`

## Component Documentation

### Header
Main navigation with logo, menu items, language/currency selectors, and booking management CTA.

### BookingForm
Form component handling:
- **Phase 1**: Single-city search with tab selector (Medina OR Makkah)
- Date selection for check-in/check-out
- Room quantity selection
- Guest counters (adults/children) with increment/decrement controls
- Form validation and submission
- **Future Phase 2**: Will support multi-city booking (Medina + Makkah simultaneously)

### HotelCard
Reusable card component displaying:
- Hotel image with carousel indicators
- Distance to Al-Haram
- Star rating and reviews
- Amenities list
- Pricing and booking CTA

### HotelSection
Container component for hotel listings with section title and "Find More" link.

## Accessibility Features

- Semantic HTML elements (`header`, `nav`, `section`, `footer`)
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus management for form controls
- Screen reader announcements for dynamic content (`aria-live`)
- Proper color contrast ratios (WCAG AA compliant)

## Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Color Palette

- Primary Brand: `#ffd700` (Gold)
- Dark Text: `#333333`
- Medium Text: `#666666`
- Light Text: `#999999`
- Borders: `#dddddd`
- Background: `#f8f8f8`
- WhatsApp Green: `#34a853`
- Accent Blue: `#4285f4`

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

### Environment Variables

Create a `.env.local` file:

\`\`\`env
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_WHATSAPP_NUMBER=your_whatsapp_number
\`\`\`

## Future Enhancements

- [ ] **Multi-city booking** (Phase 2 - search both cities simultaneously)
- [ ] Date picker integration (react-datepicker or similar)
- [ ] API integration for real hotel data
- [ ] User authentication and booking management
- [ ] Payment gateway integration
- [ ] Multi-language support (Arabic, English, Urdu)
- [ ] Advanced filtering (price range, amenities, distance)
- [ ] Hotel comparison feature
- [ ] Reviews and ratings system
- [ ] Email notifications
- [ ] Booking history and management

## Developer Notes

### Code Style
- Use TypeScript for type safety
- Follow React best practices (hooks, composition)
- Keep components small and focused
- Use semantic HTML
- Add comments for complex logic
- Maintain consistent naming conventions

### Performance Optimization
- Use Next.js Image component for optimized images
- Implement lazy loading for hotel cards
- Minimize bundle size with code splitting
- Cache API responses where appropriate

### Testing Recommendations
- Unit tests for utility functions
- Component tests with React Testing Library
- E2E tests for critical user flows (search, booking)
- Accessibility testing with axe-core

## Support

For questions or issues, please contact:
- Email: support@umrahspot.com
- WhatsApp: [Your WhatsApp Number]

## License

Proprietary - All rights reserved
