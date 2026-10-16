import React, { useState } from 'react';
import { PartnerVendor } from '../types';

interface PartnersSectionProps {
  partners: PartnerVendor[];
  selectedBeachId?: string;
  onSelectBeach?: (beachId: string) => void;
}

export const PartnersSection: React.FC<PartnersSectionProps> = ({
  partners,
  selectedBeachId,
  onSelectBeach,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [inquiryPartner, setInquiryPartner] = useState<PartnerVendor | null>(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [vendorSubmitted, setVendorSubmitted] = useState(false);

  // Form states
  const [charterDate, setCharterDate] = useState('2026-10-18');
  const [guestsCount, setGuestsCount] = useState('4');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const categories = ['All', 'Fishing Charter', 'Boat Rental', 'Water Sports Equipment'];

  const filteredPartners = partners.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchBeach = !selectedBeachId || p.beachId === selectedBeachId;
    return matchCat && matchBeach;
  });

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
    setTimeout(() => {
      setInquirySubmitted(false);
      setInquiryPartner(null);
    }, 2400);
  };

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVendorSubmitted(true);
    setTimeout(() => {
      setVendorSubmitted(false);
      setIsVendorModalOpen(false);
    }, 2400);
  };

  return (
    <div id="partners" className="py-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-cyan-400 mb-1">
            Verified Marine Network
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Charter Fleets & Water Sports Gear
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Book certified sportfishing yachts, sailing catamarans, and high-performance hydrofoils.
            All bookings integrate with WaveReady weather peace-of-mind rescheduling.
          </p>
        </div>

        {/* Vendor Partner Application CTA */}
        <button
          onClick={() => setIsVendorModalOpen(true)}
          className="px-4 py-2.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-xl border border-cyan-500/40 transition-colors whitespace-nowrap self-start md:self-auto cursor-pointer"
        >
          List Your Fleet or School
        </button>
      </div>

      {/* Network Commercial Impact Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div>
          <div className="text-[11px] font-medium text-slate-400">Active Marine Suppliers</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-100 mt-0.5">14 Fleets</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Sentosa, Keppel & Changi</div>
        </div>
        <div>
          <div className="text-[11px] font-medium text-slate-400">Supplier Revenue Facilitated</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-100 mt-0.5">$64,800/mo</div>
          <div className="text-[10px] text-cyan-400 mt-0.5">Direct charter volume</div>
        </div>
        <div>
          <div className="text-[11px] font-medium text-slate-400">Partner Royalty Model</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-100 mt-0.5">7% - 10%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Per verified booking</div>
        </div>
        <div>
          <div className="text-[11px] font-medium text-slate-400">Charter Peace of Mind</div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-0.5">100% Guaranteed</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Weather-rescheduled</div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}

        {selectedBeachId && onSelectBeach && (
          <button
            onClick={() => onSelectBeach('')}
            className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-900/50 rounded-xl border border-slate-800 whitespace-nowrap ml-auto"
          >
            Clear Beach Filter ✕
          </button>
        )}
      </div>

      {/* Partner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => (
          <div
            key={partner.id}
            className="group rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden flex flex-col shadow-lg"
          >
            {/* Image Container with Fallback */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-950">
              <img
                src={partner.imageUrl}
                alt={partner.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // Fallback container
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-semibold text-cyan-400 border border-slate-700">
                {partner.category}
              </div>

              <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-mono font-bold text-white border border-slate-800">
                {partner.rateLabel}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
              <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                <span>{partner.locationName}</span>
                <span className="text-cyan-400 font-mono text-[10px]">{partner.royaltyContributionRate}</span>
              </div>

              <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-2">
                {partner.name}
              </h3>

              <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                {partner.description}
              </p>

              {/* Amenities */}
              <div className="space-y-1 mb-5 flex-1">
                {partner.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="text-cyan-400 text-xs">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Book / Inquire CTA */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <a
                  href={`tel:${partner.contactNumber}`}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-mono"
                >
                  {partner.contactNumber}
                </a>

                <button
                  onClick={() => setInquiryPartner(partner)}
                  className="px-4 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition-colors cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  Reserve / Inquire
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking / Charter Inquiry Modal */}
      {inquiryPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setInquiryPartner(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg p-1"
            >
              ✕
            </button>

            {inquirySubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-slate-100">Inquiry Transmitted</h3>
                <p className="text-xs text-slate-300">
                  {inquiryPartner.name} will contact you shortly to confirm current tide availability
                  and secure your weather-protected reservation.
                </p>
              </div>
            ) : (
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold text-cyan-400 mb-1">
                  Charter Reservation Request
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-1">{inquiryPartner.name}</h3>
                <div className="text-xs text-slate-400 font-mono mb-4">{inquiryPartner.rateLabel}</div>

                {/* Weather Guarantee Badge */}
                <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl mb-4 text-xs text-cyan-200 flex items-start gap-2">
                  <span className="text-base">🛡️</span>
                  <div>
                    <span className="font-semibold block text-cyan-300">WaveReady Peace of Mind Protection</span>
                    Should NEA offshore winds exceed charter safe limits on your scheduled date, your booking qualifies for a 100% free reschedule.
                  </div>
                </div>

                <form onSubmit={handleInquirySubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Desired Charter Date</label>
                    <input
                      type="date"
                      value={charterDate}
                      onChange={(e) => setCharterDate(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Number of Guests / Anglers</label>
                    <select
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="1-2">1 - 2 Guests</option>
                      <option value="3-4">3 - 4 Guests</option>
                      <option value="5-8">5 - 8 Guests</option>
                      <option value="9-12">9 - 12 Guests (Full Charter)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Captain Marcus Tan"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Contact Phone (WhatsApp)</label>
                    <input
                      type="tel"
                      placeholder="+65 9123 4567"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer text-sm shadow-lg shadow-cyan-500/25"
                  >
                    Confirm Weather-Guaranteed Request
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vendor Partnership Application Modal */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsVendorModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg p-1"
            >
              ✕
            </button>

            {vendorSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-slate-100">Partnership Application Received</h3>
                <p className="text-xs text-slate-300">
                  Our Marine Partner Liaison team will review your fleet inspection and safety certifications within 24 hours.
                </p>
              </div>
            ) : (
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold text-cyan-400 mb-1">
                  Vendor Network
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-1">List Your Fleet or Water Sports Gear</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Connect with high-net-worth water sports enthusiasts and fishing charters seeking reliable coastal operators.
                </p>

                <form onSubmit={handleVendorSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Business / Fleet Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Marina South Offshore Anglers"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Primary Offering</label>
                    <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500">
                      <option>Sportfishing Boat Charter</option>
                      <option>Luxury Yacht / Catamaran Rental</option>
                      <option>Jetski & Hydrofoil Rental</option>
                      <option>Kayaking & SUP Fleets</option>
                      <option>Sailing School & Dinghy Hire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Home Marina / Beach Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ONE°15 Marina, Sentosa Cove"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Direct WhatsApp / Contact</label>
                    <input
                      type="tel"
                      required
                      placeholder="+65 9876 5432"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                    Standard royalty contribution is 7% - 10% on verified completed bookings. No upfront listing fees.
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer text-sm shadow-md"
                  >
                    Submit Partner Registration
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
