import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import useReveal from '../hooks/useReveal';
import useEntrance from '../hooks/useEntrance';
import useAutoScroll from '../hooks/useAutoScroll';
import useScrollFx from '../hooks/useScrollFx';
import useMagnetic from '../hooks/useMagnetic';
import useTilt from '../hooks/useTilt';
import splitChars from '../hooks/splitChars';
import { onIntro } from '../hooks/introGate';
import {
  MapPin, Users, ArrowRight, ShieldCheck, Navigation,
  Headphones, Wallet, PhoneCall, Car, Plane, Compass,
  Briefcase, Building2, ShoppingBag, Smartphone, QrCode, ChevronRight,
  Star, BadgeCheck, Megaphone, Bike, Smile, Clock
} from 'lucide-react';
import { useLanding } from '../landingContentContext';
import useAppModules from '../useAppModules';
import useVehicleTypes from '../useVehicleTypes';

const initials = (name) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const Home = ({ openBookingModal, setActiveTab }) => {
  const pageRef = useRef(null);
  const driverRail = useRef(null);

  useReveal(pageRef);
  useScrollFx(pageRef);
  useMagnetic(pageRef);
  useTilt(pageRef);
  useAutoScroll(driverRail, { interval: 3800 });

  /**
   * Hero entrance. Deliberately `set` + `to` with clearProps rather than
   * gsap.from: `from` leaves its targets at opacity 0 until the tween plays, so
   * anything that stops the timeline mid-flight strands them invisible — that is
   * what left a hole where the CTA buttons should be. Here the markup is visible
   * by default, the tween owns the hidden state for its own duration only, and
   * clearProps strips every inline style on completion.
   */
  useEntrance(pageRef, () => {
    const shown = { opacity: 1, y: 0, clearProps: 'opacity,transform' };
    const chars = splitChars(pageRef.current.querySelectorAll('.hero-word'));
    const rest = ['.hero-subtitle', '.hero-cta-group > *', '.badge-item', '.booking-card'];
    let watchdog;

    // Build on the intro, not on mount. Setting the hidden state up front would
    // leave the hero blank behind a curtain that never lifted.
    const off = onIntro(() => {
      gsap.set(chars, { yPercent: 115, opacity: 0 });
      rest.forEach((sel) => gsap.set(sel, { opacity: 0, y: 22 }));

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        // headline rises character by character out of its line mask
        .to(chars, {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.022,
          clearProps: 'opacity,transform',
        })
        .to('.hero-subtitle', { ...shown, duration: 0.5 }, '-=0.55')
        .to('.hero-cta-group > *', { ...shown, duration: 0.45, stagger: 0.08 }, '-=0.32')
        .to('.badge-item', { ...shown, duration: 0.4, stagger: 0.055 }, '-=0.26')
        .to('.booking-card', { ...shown, duration: 0.7 }, '-=0.7');

      // useEntrance probes the ticker on mount, but this build is deferred until
      // the curtain lifts — by then that probe is long gone. A live ticker always
      // advances a playing timeline within 700ms; if it has not, drop every
      // inline style so the hero is simply visible rather than hidden forever.
      watchdog = setTimeout(() => {
        if (tl.progress() > 0) return;
        tl.kill();
        gsap.set(chars, { clearProps: 'all' });
        rest.forEach((sel) => gsap.set(sel, { clearProps: 'all' }));
      }, 700);
    });

    return () => {
      clearTimeout(watchdog);
      off();
    };
  });

  const [tab, setTab] = useState('city');
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [passengers, setPassengers] = useState('1 Passenger');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    openBookingModal();
  };



  // Photos live in Frontend/public/vehicles/ — see that folder's README + ATTRIBUTION
  // before swapping any of them out.
  // Hero badges store an icon name; components cannot be serialised.
const HERO_BADGE_ICONS = { ShieldCheck, Navigation, Headphones, Wallet };

const fallbackVehicles = [
    {
      name: 'Auto Rickshaw',
      type: 'Auto',
      seats: '3 Seats',
      bags: '1 Bag',
      price: '₹8',
      unit: '/km',
      image: '/vehicles/auto.jpg'
    },
    {
      name: 'Maruti Suzuki Dzire',
      type: 'Sedan',
      seats: '4 Seats',
      bags: '2 Bags',
      price: '₹12',
      unit: '/km',
      image: '/vehicles/dzire.jpg'
    },
    {
      name: 'Maruti Suzuki Ertiga',
      type: 'MUV',
      seats: '6 Seats',
      bags: '4 Bags',
      price: '₹16',
      unit: '/km',
      image: '/vehicles/ertiga.jpg'
    },
    {
      name: 'Toyota Innova Crysta',
      type: 'Premium SUV',
      seats: '6 Seats',
      bags: '4 Bags',
      price: '₹20',
      unit: '/km',
      image: '/vehicles/innova-crysta.jpg'
    },
    {
      name: 'Toyota Fortuner',
      type: 'Luxury SUV',
      seats: '7 Seats',
      bags: '4 Bags',
      price: '₹30',
      unit: '/km',
      image: '/vehicles/fortuner.jpg'
    }
  ];

  // All page content comes from the CMS, falling back to the bundled copy so the
  // page is never blank while the request is in flight or if it fails.
  const { services, valueProps, drivers, partners, launchCities, contact, brand, hero } = useLanding();
  // The app's own module list is the source of truth for what Ferrido sells;
  // the CMS list is only a fallback for when it cannot be reached.
  const appModules = useAppModules();
  const serviceCards = appModules.length ? appModules : services;
  const { vehicles } = useVehicleTypes(fallbackVehicles);



  // The three-step route under the hero. Static copy: it describes the product,
  // not anything an admin edits.
  const steps = [
    { icon: MapPin, title: 'Set your pickup', desc: 'Pick a city ride, outstation trip or airport transfer and drop your pin.' },
    { icon: ShieldCheck, title: 'Meet your captain', desc: 'A verified, police-checked driver is assigned and you track them live.' },
    { icon: Smile, title: 'Arrive happy', desc: 'Sit back, ride easy, and pay the fare you were shown - no surprises.' },
  ];

  return (
    <div className="home-page animate-fade-in" ref={pageRef}>
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-bg-blob" data-parallax="-120" />
        <div className="container hero-container">
          <div className="hero-left" data-hero-exit>
            <span className="hero-kicker">
              <span className="kicker-dot" />
              Now live in {launchCities.map((c) => c.name).join(' · ')}
            </span>

            {/* Split per word so each keeps its own clipping mask and rise-in
                animation; the copy itself comes from the CMS. */}
            <h1 className="hero-title">
              {[hero.titleLine1, hero.titleLine2].map((line, lineIndex) => (
                <span className="hero-line" key={lineIndex}>
                  {String(line || '').split(/\s+/).filter(Boolean).map((word, wordIndex, words) => (
                    <span key={wordIndex}>
                      <span className={lineIndex === 1 ? 'hero-word accent' : 'hero-word'}>{word}</span>
                      {wordIndex < words.length - 1 ? ' ' : null}
                    </span>
                  ))}
                </span>
              ))}
            </h1>
            <p className="hero-subtitle">{hero.subtitle}</p>

            <div className="hero-cta-group">
              <button className="btn btn-teal hero-btn-main" data-magnetic onClick={openBookingModal}>
                {hero.primaryCta} <ArrowRight size={18} />
              </button>
              <button className="btn btn-navy-outline" onClick={() => setActiveTab('contact')}>
                <Smartphone size={18} /> {hero.secondaryCta}
              </button>
            </div>

            <div className="hero-trust-badges">
              {(hero.badges || []).map((badge, index) => {
                const BadgeIcon = HERO_BADGE_ICONS[badge.icon] || ShieldCheck;
                return (
                  <div className="badge-item" key={index}>
                    <span className="badge-ico"><BadgeIcon size={14} /></span>
                    <span>{badge.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* The logo's map pin, blown up and filled with the night-drive photo. */}
          <div className="hero-right" aria-hidden="true">
            <div className="pin-stage">
              <div className="speed-lines">
                <span /><span /><span />
              </div>
              <div className="hero-pin">
                <div className="hero-pin-inner" />
              </div>
              <div className="pin-shadow" />
              <div className="float-chip chip-top">
                <span className="chip-ico"><Navigation size={16} /></span>
                <div>
                  <strong>Live tracking</strong>
                  <span>Follow every turn</span>
                </div>
              </div>
              <div className="float-chip chip-bottom">
                <span className="chip-ico navy"><ShieldCheck size={16} /></span>
                <div>
                  <strong>Verified captains</strong>
                  <span>Police-checked drivers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking bar, docked across the bottom edge of the hero */}
        <div className="container">
          <div className="booking-card">
            <div className="booking-tabs" role="tablist">
              {[
                { id: 'city', label: 'City Ride', icon: Car },
                { id: 'outstation', label: 'Outstation', icon: Compass },
                { id: 'airport', label: 'Airport', icon: Plane },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  className={`b-tab ${tab === t.id ? 'active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  <t.icon size={15} /> {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="booking-form">
              <div className="field-group">
                <label htmlFor="bk-pickup">Pickup</label>
                <div className="field-input-wrap">
                  <span className="field-dot pickup" />
                  <input
                    id="bk-pickup"
                    type="text"
                    placeholder="Where from?"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="bk-drop">Drop</label>
                <div className="field-input-wrap">
                  <span className="field-dot drop" />
                  <input
                    id="bk-drop"
                    type="text"
                    placeholder="Where to?"
                    value={drop}
                    onChange={(e) => setDrop(e.target.value)}
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="bk-when">When</label>
                <div className="field-input-wrap">
                  <Clock size={15} className="field-lead" />
                  <input
                    id="bk-when"
                    type="text"
                    placeholder="Now"
                    value={dateTime}
                    onFocus={(e) => { e.target.type = 'datetime-local'; }}
                    onChange={(e) => setDateTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="bk-pax">Passengers</label>
                <div className="field-input-wrap">
                  <Users size={15} className="field-lead" />
                  <select id="bk-pax" value={passengers} onChange={(e) => setPassengers(e.target.value)}>
                    <option value="1 Passenger">1 Passenger</option>
                    <option value="2 Passengers">2 Passengers</option>
                    <option value="4 Passengers">4 Passengers</option>
                    <option value="6 Passengers">6 Passengers</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-teal booking-submit-btn">
                Find My Ride <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-padding steps-section">
        <div className="container">
          <div className="center-head" data-reveal>
            <span className="eyebrow center"><span className="eyebrow-num">01</span> How It Works</span>
            <h2 className="section-title" data-reveal-mask><span>Three taps to <em>arrive happy</em></span></h2>
          </div>

          <div className="steps-grid" data-reveal-stagger>
            {steps.map((s, i) => (
              <div className="step-card" key={s.title}>
                <div className="step-pin">
                  <s.icon size={22} />
                  <span className="step-num">{i + 1}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section-padding services-section">
        <div className="container">
          <div className="section-title-group" data-reveal>
            <div>
              <span className="eyebrow"><span className="eyebrow-num">02</span> What We Move</span>
              <h2 className="section-title" data-reveal-mask><span>Rides for every plan</span></h2>
            </div>
            <button className="section-link" onClick={() => setActiveTab('services')}>
              All services <ChevronRight size={16} />
            </button>
          </div>

          <div className="services-grid" data-reveal-stagger>
            {serviceCards.map((s) => {
              // Modules carry a real icon image; the CMS fallback carries a
              // lucide component instead.
              const IconComp = s.icon && typeof s.icon !== 'string' ? s.icon : Car;
              return (
                <button
                  type="button"
                  key={s.id}
                  className="service-card"
                  onClick={() => setActiveTab('services')}
                >
                  <span className="service-icon-wrapper">
                    {s.image ? (
                      <img
                        src={s.image}
                        alt=""
                        className="service-icon-img"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <IconComp size={22} />
                    )}
                  </span>
                  <span className="service-text">
                    <span className="service-card-title">{s.title}</span>
                    {s.desc && <span className="service-card-desc">{s.desc}</span>}
                  </span>
                  <ArrowRight size={16} className="service-arrow" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY FERRIDO */}
      <section className="why-us-section grain-layer">
        <div className="container why-layout">
          <div className="why-head" data-reveal>
            <span className="eyebrow"><span className="eyebrow-num">03</span> The Difference</span>
            <h2 className="section-title light" data-reveal-mask><span>Why riders choose Ferrido</span></h2>
            <p className="why-lead">
              A ride is only easy when everything around it is - the booking, the driver,
              the price and the help when you need it.
            </p>
            <button className="btn btn-teal" onClick={openBookingModal}>
              Book your first ride <ArrowRight size={18} />
            </button>
          </div>

          <div className="why-us-grid" data-reveal-stagger>
            {valueProps.map((v, idx) => {
              const IconComponent = v.icon;
              return (
                <div key={idx} className="why-us-card">
                  <div className="why-icon-box">
                    <IconComponent size={20} />
                  </div>
                  <h4 className="why-title">{v.title}</h4>
                  <p className="why-desc">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FLEET */}
      <section className="section-padding vehicles-section">
        <div className="container">
          <div className="section-title-group" data-reveal>
            <div>
              <span className="eyebrow"><span className="eyebrow-num">04</span> The Fleet</span>
              <h2 className="section-title" data-reveal-mask><span>Pick your ride</span></h2>
            </div>
          </div>

          {/* Two identical tracks: the first slides left by exactly its own
              width plus one gap, at which point the second sits where the
              first began, so the loop has no visible seam and no end. */}
          <div className="vehicles-marquee">
            {[0, 1].map((pass) => (
              <div className="vehicles-track" key={pass} aria-hidden={pass === 1}>
                {vehicles.map((v, i) => (
                  <div key={i} className="vehicle-card" data-tilt>
                    <div className="vehicle-img-container" data-img-parallax>
                      <img src={v.image} alt={v.name} className="vehicle-img" loading="lazy" />
                      <span className="vehicle-type-badge">{v.type}</span>
                    </div>
                    <div className="vehicle-card-body">
                      <h3 className="vehicle-name">{v.name}</h3>
                      <div className="vehicle-specs">
                        {v.seats && <span><Users size={14} /> {v.seats}</span>}
                        {v.bags && <span><Briefcase size={14} /> {v.bags}</span>}
                      </div>
                      <div className="vehicle-price-row">
                        {/* No price at all when the vehicle has no configured
                            rate - better than an empty or invented one. */}
                        <div className="price-tag">
                          {v.price ? (
                            <>
                              <span className="price-num">{v.price}</span>
                              <span className="price-unit">{v.unit}</span>
                            </>
                          ) : null}
                        </div>
                        <button className="vehicle-book" onClick={openBookingModal}>
                          Book <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DRIVERS */}
      <section className="section-padding drivers-section">
        <div className="container">
          <div className="section-title-group" data-reveal>
            <div>
              <span className="eyebrow"><span className="eyebrow-num">05</span> Who Drives You</span>
              <h2 className="section-title" data-reveal-mask><span>Meet our captains</span></h2>
              <p className="section-sub-dark">Every Ferrido captain is background-verified, police-checked and rated by real riders.</p>
            </div>
            <button className="section-link" onClick={() => setActiveTab('driver')}>
              Become a captain <ChevronRight size={16} />
            </button>
          </div>

          <div className="drivers-grid snap-row" data-reveal-stagger ref={driverRail}>
            {drivers.map((d, i) => (
              <div key={i} className="driver-card" data-tilt>
                <div className="driver-top">
                  <div className="avatar driver-photo">
                    {initials(d.name)}
                    <img
                      src={d.photo}
                      alt={d.name}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <span className={`driver-badge ${d.badge === 'Top Driver' ? 'top' : ''}`}>
                    <BadgeCheck size={12} /> {d.badge}
                  </span>
                </div>

                <h3 className="driver-name">{d.name}</h3>

                <div className="driver-rating">
                  <Star size={14} color="#F7941D" fill="#F7941D" />
                  <strong>{d.rating}</strong>
                  <span>· {d.trips}</span>
                </div>

                <div className="driver-meta">
                  <div className="dm-row"><ShieldCheck size={14} /> {d.experience}</div>
                  <div className="dm-row"><Car size={14} /> {d.vehicle}</div>
                  <div className="dm-row"><MapPin size={14} /> {d.city}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section className="section-padding cities-section">
        <div className="container">
          <div className="section-title-group" data-reveal>
            <div>
              <span className="eyebrow"><span className="eyebrow-num">06</span> Coverage</span>
              <h2 className="section-title" data-reveal-mask><span>Where you&apos;ll find us</span></h2>
              <p className="section-sub-dark">{contact.addressShort}</p>
            </div>
            <a className="section-link" href={contact.mapsUrl} target="_blank" rel="noreferrer">
              Get directions <ChevronRight size={16} />
            </a>
          </div>

          <div className="cities-grid" data-reveal-stagger>
            {launchCities.map((c) => (
              <div key={c.name} className="city-card">
                <div className="city-pin"><MapPin size={18} /></div>
                <div>
                  <h3>{c.name}</h3>
                  <span>{c.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS + ADVERTISE */}
      <section className="trusted-app-section">
        <div className="container">
          <div className="trusted-block">
            <h3 className="trusted-heading" data-reveal-mask><span>Trusted by hotels, airports &amp; malls</span></h3>
            <div className="partners-marquee" data-marquee-velocity>
              {/* rendered twice so the track loops without a visible seam; the
                  copy is aria-hidden so screen readers do not repeat it */}
              {[0, 1].map((pass) => (
                <div className="partners-track" key={pass} aria-hidden={pass === 1}>
                  {partners.map((p, index) => (
                    <div key={index} className="partner-logo-item">
                      <span className="p-title">{p.name}</span>
                      {p.subtitle && <span className="p-sub">{p.subtitle}</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="advertise-teaser" data-reveal>
            <div>
              <span className="at-tag"><Megaphone size={14} /> For Businesses</span>
              <h2 className="at-title">Advertise with Ferrido</h2>
              <p className="at-desc">
                Put your brand in front of thousands of daily riders - across our apps, website,
                home banners, booking screens and push notifications.
              </p>
            </div>
            <button className="btn btn-navy" onClick={() => setActiveTab('advertise')}>
              Explore ad options <ArrowRight size={18} />
            </button>
          </div>

          {/* APP DOWNLOAD */}
          <div className="app-download-banner" data-reveal>
            <div className="app-banner-left">
              <span className="eyebrow light-eyebrow">Get the app</span>
              <h2 className="app-banner-title">Ride easy from your <em>pocket</em></h2>
              <p className="app-banner-desc">{brand.appBlurb || 'Book rides on the go, anytime, anywhere.'}</p>

              <div className="app-store-btns">
                {/* Falls back to the placeholder icon until a QR image is uploaded. */}
                <div className="qr-box">
                  {brand.playStoreQr || brand.appStoreQr ? (
                    <img
                      src={brand.playStoreQr || brand.appStoreQr}
                      alt="Scan to download the app"
                      style={{ width: 64, height: 64, objectFit: 'contain' }}
                    />
                  ) : (
                    <QrCode size={40} color="#0B1F3A" />
                  )}
                </div>
                <div className="store-btns-column">
                  {[
                    { url: brand.playStoreUrl, sub: 'GET IT ON', name: 'Google Play' },
                    { url: brand.appStoreUrl, sub: 'Download on the', name: 'App Store' },
                  ].map((badge) => {
                    const Tag = badge.url ? 'a' : 'div';
                    const props = badge.url ? { href: badge.url, target: '_blank', rel: 'noreferrer' } : {};
                    return (
                      <Tag key={badge.name} className="store-btn" {...props}>
                        <span className="st-sub">{badge.sub}</span>
                        <span className="st-name">{badge.name}</span>
                      </Tag>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="app-banner-right" aria-hidden="true">
              <div className="mockup-phone" data-parallax="-60">
                <div className="mockup-screen">
                  <img src={brand.logo} alt="" className="m-logo-img" />
                  <span className="m-logo"><b>Fer</b>rido</span>
                  <p className="m-tag">{brand.tagline}</p>
                  <div className="m-field"><span className="field-dot pickup" /> Where from?</div>
                  <div className="m-field"><span className="field-dot drop" /> Where to?</div>
                  <div className="m-btn">Book a Ride</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .zicab-landing .home-page {
          --fr-navy: #0B1F3A;
          --fr-navy-2: #12305A;
          --fr-orange: #F7941D;
          --fr-orange-2: #EE6F12;
          --fr-cream: #FFF8F0;
          --fr-line: #EEE3D6;
          background: #FFFFFF;

          em { font-style: normal; color: var(--fr-orange); }

          .btn-navy {
            background: var(--fr-navy);
            color: #FFFFFF;
            box-shadow: 0 10px 24px rgba(11, 31, 58, 0.22);
          }
          .btn-navy:hover { background: var(--fr-navy-2); transform: translateY(-2px); }

          .btn-navy-outline {
            background: #FFFFFF;
            color: var(--fr-navy);
            border: 1.5px solid rgba(11, 31, 58, 0.14);
            box-shadow: 0 4px 14px rgba(11, 31, 58, 0.06);
          }
          .btn-navy-outline:hover { border-color: var(--fr-orange); color: var(--fr-orange-2); transform: translateY(-2px); }

          .eyebrow.center { justify-content: center; }
          .eyebrow.center::before {
            content: '';
            flex: 0 1 60px;
            height: 1px;
            background: linear-gradient(270deg, var(--fr-orange), transparent);
          }

          /* ---------- HERO ---------- */
          .hero-section {
            position: relative;
            overflow: hidden;
            padding: clamp(40px, 6vw, 84px) 0 56px;
            background:
              radial-gradient(60% 70% at 85% 30%, rgba(247, 148, 29, 0.16), transparent 70%),
              radial-gradient(50% 60% at 0% 100%, rgba(11, 31, 58, 0.06), transparent 70%),
              var(--fr-cream);
          }

          .hero-bg-blob {
            position: absolute;
            right: -12%;
            top: -18%;
            width: min(720px, 80vw);
            aspect-ratio: 1;
            border-radius: 50%;
            border: 1px dashed rgba(247, 148, 29, 0.35);
            pointer-events: none;
          }

          .hero-container {
            display: grid;
            grid-template-columns: 1.05fr 0.95fr;
            align-items: center;
            gap: 40px;
          }

          .hero-kicker {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 7px 14px 7px 10px;
            border-radius: 999px;
            background: #FFFFFF;
            border: 1px solid var(--fr-line);
            box-shadow: 0 4px 14px rgba(11, 31, 58, 0.05);
            font-size: 13px;
            font-weight: 600;
            color: var(--fr-navy);
            margin-bottom: 22px;
          }
          .kicker-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: var(--fr-orange);
            box-shadow: 0 0 0 4px rgba(247, 148, 29, 0.2);
          }

          .hero-title {
            font-family: var(--font-display) !important;
            font-size: clamp(2.6rem, 1.6rem + 4vw, 5rem);
            line-height: 1.02;
            font-weight: 800;
            font-style: italic;
            letter-spacing: -0.035em;
            color: var(--fr-navy);
            margin: 0 0 20px;
          }
          .hero-title * { font-family: var(--font-display) !important; }
          .hero-line { display: block; overflow: hidden; padding-bottom: 0.06em; }
          .hero-word { display: inline-block; }
          /* Solid, not gradient text: the entrance splits each word into per-letter
             spans, and background-clip: text does not paint through those. */
          .hero-word.accent { color: var(--fr-orange); padding-right: 0.08em; }

          .hero-subtitle {
            font-size: clamp(1rem, 0.92rem + 0.35vw, 1.18rem);
            color: #475569;
            max-width: 520px;
            line-height: 1.65;
            margin-bottom: 30px;
          }

          .hero-cta-group { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 30px; }
          .hero-btn-main { padding: 15px 30px; }

          .hero-trust-badges { display: flex; flex-wrap: wrap; gap: 10px 22px; }
          .badge-item {
            display: inline-flex; align-items: center; gap: 8px;
            font-size: 13.5px; font-weight: 600; color: var(--fr-navy);
          }
          .badge-ico {
            display: grid; place-items: center;
            width: 26px; height: 26px; border-radius: 8px;
            background: rgba(247, 148, 29, 0.14);
            color: var(--fr-orange-2);
          }

          /* Pin visual */
          .hero-right { display: flex; justify-content: center; }
          .pin-stage {
            position: relative;
            width: min(440px, 100%);
            aspect-ratio: 1 / 1.08;
          }
          .hero-pin {
            position: absolute;
            left: 50%;
            top: 4%;
            width: 74%;
            aspect-ratio: 1;
            transform: translateX(-50%) rotate(-45deg);
            border-radius: 50% 50% 50% 0;
            background: linear-gradient(135deg, var(--fr-navy-2), var(--fr-navy));
            padding: 14px;
            box-shadow: 0 30px 60px rgba(11, 31, 58, 0.28);
          }
          .hero-pin::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            border: 3px solid var(--fr-orange);
            clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
            transform: rotate(45deg) scale(1.06);
            opacity: 0.9;
          }
          .hero-pin-inner {
            width: 100%;
            height: 100%;
            border-radius: inherit;
            overflow: hidden;
            background: #07152B url('/carbackground.png') no-repeat;
            background-size: 175%;
            background-position: 78% 60%;
          }
          .pin-shadow {
            position: absolute;
            left: 50%;
            bottom: 3%;
            width: 34%;
            height: 18px;
            transform: translateX(-50%);
            border-radius: 50%;
            background: radial-gradient(closest-side, rgba(11, 31, 58, 0.28), transparent);
          }
          .speed-lines {
            position: absolute;
            left: 0;
            top: 44%;
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 4;
          }
          .speed-lines span {
            display: block;
            height: 7px;
            border-radius: 99px;
            background: linear-gradient(90deg, rgba(247, 148, 29, 0.15), var(--fr-orange));
            animation: fr-speed 2.4s var(--ease-out) infinite;
          }
          .speed-lines span:nth-child(1) { width: 110px; }
          .speed-lines span:nth-child(2) { width: 150px; animation-delay: 0.15s; }
          .speed-lines span:nth-child(3) { width: 90px; animation-delay: 0.3s; }

          .float-chip {
            position: absolute;
            display: flex; align-items: center; gap: 10px;
            padding: 10px 16px 10px 10px;
            background: rgba(255, 255, 255, 0.96);
            border: 1px solid var(--fr-line);
            border-radius: 16px;
            box-shadow: 0 16px 34px rgba(11, 31, 58, 0.14);
            z-index: 3;
            animation: fr-float 5s ease-in-out infinite;
          }
          .float-chip strong { display: block; font-size: 13.5px; color: var(--fr-navy); }
          .float-chip span { font-size: 12px; color: #64748B; }
          .chip-top { right: -2%; top: 10%; }
          .chip-bottom { left: 2%; bottom: 14%; animation-delay: -2.5s; }
          .chip-ico {
            display: grid; place-items: center;
            width: 34px; height: 34px; border-radius: 11px;
            background: var(--fr-orange); color: #FFFFFF !important;
          }
          .chip-ico.navy { background: var(--fr-navy); }

          /* Booking bar */
          .booking-card {
            position: relative;
            margin-top: clamp(28px, 4vw, 48px);
            background: #FFFFFF;
            border-radius: 24px;
            padding: 10px 10px 12px;
            border: 1px solid var(--fr-line);
            box-shadow: 0 30px 70px rgba(11, 31, 58, 0.12), 0 4px 12px rgba(11, 31, 58, 0.05);
          }
          .booking-tabs { display: flex; gap: 6px; padding: 4px 6px 10px; }
          .b-tab {
            display: inline-flex; align-items: center; gap: 7px;
            border: none; cursor: pointer;
            padding: 9px 16px;
            border-radius: 12px;
            background: transparent;
            color: #64748B;
            font-weight: 600; font-size: 14px;
            transition: var(--transition);
          }
          .b-tab:hover { color: var(--fr-navy); background: #F6F1EA; }
          .b-tab.active { background: var(--fr-navy); color: #FFFFFF; }

          .booking-form {
            display: grid;
            grid-template-columns: 1.3fr 1.3fr 1fr 1fr auto;
            gap: 8px;
            align-items: stretch;
          }
          .field-group {
            background: #F8F5F1;
            border-radius: 16px;
            padding: 10px 14px;
            border: 1.5px solid transparent;
            transition: var(--transition);
          }
          .field-group:focus-within { border-color: var(--fr-orange); background: #FFFFFF; }
          .field-group label {
            display: block;
            font-size: 11px; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.08em;
            color: #94A3B8;
            margin-bottom: 4px;
          }
          .field-input-wrap { display: flex; align-items: center; gap: 10px; }
          .field-input-wrap input,
          .field-input-wrap select {
            width: 100%;
            border: none; outline: none; background: transparent;
            font-size: 15px; font-weight: 600; color: var(--fr-navy);
            padding: 0; min-width: 0;
          }
          .field-input-wrap input::placeholder { color: #A3AEC0; font-weight: 500; }
          .field-lead { color: var(--fr-orange-2); flex-shrink: 0; }
          .field-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
          .field-dot.pickup { background: var(--fr-orange); box-shadow: 0 0 0 3px rgba(247, 148, 29, 0.22); }
          .field-dot.drop { background: var(--fr-navy); border-radius: 3px; }
          .booking-submit-btn { border-radius: 16px; padding: 0 26px; min-height: 58px; }

          /* ---------- HOW IT WORKS ---------- */
          .steps-section { background: #FFFFFF; }
          .center-head { text-align: center; margin-bottom: 44px; }
          .steps-grid {
            position: relative;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
          /* the dashed route that links the three pins */
          .steps-grid::before {
            content: '';
            position: absolute;
            top: 34px;
            left: 16%;
            right: 16%;
            border-top: 2px dashed rgba(247, 148, 29, 0.45);
          }
          .step-card { position: relative; text-align: center; padding: 0 12px; }
          .step-pin {
            position: relative;
            width: 68px; height: 68px;
            margin: 0 auto 20px;
            display: grid; place-items: center;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            background: var(--fr-navy);
            color: #FFFFFF;
            box-shadow: 0 14px 28px rgba(11, 31, 58, 0.22);
          }
          .step-pin > svg { transform: rotate(45deg); }
          .step-card:nth-child(2) .step-pin { background: var(--fr-orange); box-shadow: 0 14px 28px rgba(247, 148, 29, 0.32); }
          .step-num {
            position: absolute;
            top: -6px; right: -6px;
            transform: rotate(45deg);
            width: 24px; height: 24px; border-radius: 50%;
            display: grid; place-items: center;
            background: #FFFFFF; color: var(--fr-navy);
            font-size: 12px; font-weight: 800;
            box-shadow: 0 4px 10px rgba(11, 31, 58, 0.15);
          }
          .step-card h3 { font-size: 19px; font-weight: 700; color: var(--fr-navy); margin-bottom: 8px; }
          .step-card p { font-size: 14.5px; color: #64748B; line-height: 1.6; max-width: 300px; margin: 0 auto; }

          /* ---------- SERVICES ---------- */
          .services-section { background: var(--fr-cream); }
          .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 14px;
          }
          .service-card {
            display: flex; align-items: center; gap: 14px;
            text-align: left;
            width: 100%;
            padding: 16px;
            background: #FFFFFF;
            border: 1px solid var(--fr-line);
            border-radius: 18px;
            cursor: pointer;
            transition: var(--transition);
          }
          .service-card:hover {
            transform: translateY(-3px);
            border-color: rgba(247, 148, 29, 0.55);
            box-shadow: 0 16px 34px rgba(11, 31, 58, 0.08);
          }
          .service-icon-wrapper {
            flex-shrink: 0;
            width: 50px; height: 50px;
            display: grid; place-items: center;
            border-radius: 14px;
            background: linear-gradient(135deg, rgba(247, 148, 29, 0.18), rgba(247, 148, 29, 0.06));
            color: var(--fr-orange-2);
          }
          .service-icon-img { width: 34px; height: 34px; object-fit: contain; }
          .service-text { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
          .service-card-title { font-size: 15.5px; font-weight: 700; color: var(--fr-navy); }
          .service-card-desc { font-size: 13px; color: #64748B; line-height: 1.45; }
          .service-arrow { color: #CBD5E1; flex-shrink: 0; transition: var(--transition); }
          .service-card:hover .service-arrow { color: var(--fr-orange); transform: translateX(3px); }

          /* ---------- WHY ---------- */
          .why-us-section {
            position: relative;
            padding: clamp(56px, 7vw, 100px) 0;
            background:
              radial-gradient(50% 80% at 100% 0%, rgba(247, 148, 29, 0.18), transparent 60%),
              linear-gradient(160deg, #0E2748 0%, var(--fr-navy) 60%, #081830 100%);
            color: #FFFFFF;
          }
          .why-layout {
            display: grid;
            grid-template-columns: 0.85fr 1.15fr;
            gap: clamp(32px, 5vw, 72px);
            align-items: center;
          }
          .why-lead { color: #A9B6C9; font-size: 16px; line-height: 1.7; margin: 14px 0 28px; max-width: 440px; }
          .why-us-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
          .why-us-card {
            padding: 22px;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.09);
            transition: var(--transition);
          }
          .why-us-card:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(247, 148, 29, 0.5); }
          .why-icon-box {
            width: 44px; height: 44px; border-radius: 13px;
            display: grid; place-items: center;
            background: var(--fr-orange); color: #FFFFFF;
            margin-bottom: 16px;
            box-shadow: 0 10px 22px rgba(247, 148, 29, 0.3);
          }
          .why-title { font-size: 16.5px; font-weight: 700; color: #FFFFFF; margin-bottom: 6px; }
          .why-desc { font-size: 14px; color: #A9B6C9; line-height: 1.6; }

          /* ---------- FLEET ---------- */
          .vehicles-section { background: #FFFFFF; }
          /* Continuous marquee; see the comment on the markup. */
          .vehicles-marquee {
            display: flex;
            --marquee-gap: 18px;
            gap: var(--marquee-gap);
            overflow: hidden;
            padding: 6px 0 14px;
            mask-image: linear-gradient(90deg, transparent, #000 3%, #000 97%, transparent);
            -webkit-mask-image: linear-gradient(90deg, transparent, #000 3%, #000 97%, transparent);
          }
          .vehicles-track {
            display: flex;
            gap: var(--marquee-gap);
            flex-shrink: 0;
            animation: zc-marqueeScroll 42s linear infinite;
          }
          .vehicles-marquee:hover .vehicles-track { animation-play-state: paused; }
          .vehicles-track > .vehicle-card { flex: 0 0 262px; }

          .vehicle-card {
            background: #FFFFFF;
            border: 1px solid var(--fr-line);
            border-radius: 22px;
            overflow: hidden;
            transition: box-shadow 0.25s ease, border-color 0.25s ease;
          }
          .vehicle-card:hover { border-color: rgba(247, 148, 29, 0.5); box-shadow: 0 18px 40px rgba(11, 31, 58, 0.1); }
          .vehicle-img-container { position: relative; height: 160px; overflow: hidden; background: #F3EEE7; }
          .vehicle-img { width: 100%; height: 100%; object-fit: cover; }
          .vehicle-type-badge {
            position: absolute; left: 12px; top: 12px;
            padding: 5px 11px; border-radius: 999px;
            background: rgba(11, 31, 58, 0.85); color: #FFFFFF;
            font-size: 11.5px; font-weight: 600;
            backdrop-filter: blur(6px);
          }
          .vehicle-card-body { padding: 16px 18px 18px; }
          .vehicle-name { font-size: 16.5px; font-weight: 700; color: var(--fr-navy); margin-bottom: 8px; }
          .vehicle-specs { display: flex; gap: 14px; font-size: 13px; color: #64748B; margin-bottom: 14px; }
          .vehicle-specs span { display: inline-flex; align-items: center; gap: 5px; }
          .vehicle-price-row {
            display: flex; align-items: center; justify-content: space-between;
            padding-top: 14px; border-top: 1px dashed var(--fr-line);
          }
          .price-num { font-size: 22px; font-weight: 800; color: var(--fr-navy); }
          .price-unit { font-size: 13px; color: #94A3B8; margin-left: 2px; }
          .vehicle-book {
            display: inline-flex; align-items: center; gap: 6px;
            border: none; cursor: pointer;
            padding: 9px 16px; border-radius: 999px;
            background: rgba(247, 148, 29, 0.14);
            color: var(--fr-orange-2);
            font-weight: 700; font-size: 13.5px;
            transition: var(--transition);
          }
          .vehicle-book:hover { background: var(--fr-orange); color: #FFFFFF; }

          @media (prefers-reduced-motion: reduce) {
            .vehicles-track { animation: none; }
            .vehicles-marquee { overflow-x: auto; }
            .speed-lines span, .float-chip { animation: none; }
          }

          /* Touch screens get a swipeable snap rail instead of a moving row:
             an overflow:hidden marquee cannot be swiped. */
          @media (hover: none), (max-width: 768px) {
            .vehicles-marquee {
              overflow-x: auto;
              scroll-snap-type: x mandatory;
              -webkit-overflow-scrolling: touch;
              scrollbar-width: none;
              mask-image: none;
              -webkit-mask-image: none;
              margin: 0 -16px;
              padding: 2px 16px 12px;
            }
            .vehicles-marquee::-webkit-scrollbar { display: none; }
            .vehicles-track { animation: none; }
            .vehicles-track[aria-hidden='true'] { display: none; }
            .vehicles-track > .vehicle-card { scroll-snap-align: start; flex-basis: 72vw; max-width: 262px; }
          }

          /* ---------- DRIVERS ---------- */
          .drivers-section { background: var(--fr-cream); }
          .section-sub-dark { color: #64748B; font-size: 15px; margin-top: 8px; max-width: 560px; }
          .drivers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
          .driver-card {
            background: #FFFFFF;
            border: 1px solid var(--fr-line);
            border-radius: 22px;
            padding: 20px;
          }
          .driver-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
          .driver-photo {
            position: relative;
            width: 58px; height: 58px; border-radius: 18px;
            display: grid; place-items: center;
            background: var(--fr-navy); color: #FFFFFF;
            font-weight: 700; overflow: hidden;
          }
          .driver-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
          .driver-badge {
            display: inline-flex; align-items: center; gap: 4px;
            padding: 5px 10px; border-radius: 999px;
            background: #EEF2F7; color: var(--fr-navy);
            font-size: 11.5px; font-weight: 700;
          }
          .driver-badge.top { background: rgba(247, 148, 29, 0.16); color: #B85A06; }
          .driver-name { font-size: 17px; font-weight: 700; color: var(--fr-navy); margin-bottom: 4px; }
          .driver-rating { display: flex; align-items: center; gap: 5px; font-size: 13.5px; color: #64748B; margin-bottom: 14px; }
          .driver-rating strong { color: var(--fr-navy); }
          .driver-meta { display: grid; gap: 7px; padding-top: 14px; border-top: 1px dashed var(--fr-line); }
          .dm-row { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: #475569; }
          .dm-row svg { color: var(--fr-orange-2); }

          /* ---------- CITIES ---------- */
          .cities-section { background: #FFFFFF; }
          .cities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
          .city-card {
            display: flex; align-items: center; gap: 14px;
            padding: 18px;
            border-radius: 18px;
            border: 1px solid var(--fr-line);
            background: linear-gradient(135deg, #FFFFFF, var(--fr-cream));
          }
          .city-pin {
            flex-shrink: 0;
            width: 44px; height: 44px;
            display: grid; place-items: center;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            background: var(--fr-orange); color: #FFFFFF;
          }
          .city-pin svg { transform: rotate(45deg); }
          .city-card h3 { font-size: 17px; font-weight: 700; color: var(--fr-navy); }
          .city-card span { font-size: 13px; color: #64748B; }

          /* ---------- PARTNERS / ADVERTISE / APP ---------- */
          .trusted-app-section { background: #FFFFFF; padding: 10px 0 80px; }
          .trusted-block { margin-bottom: 40px; }
          .trusted-heading {
            text-align: center;
            font-size: 13px; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.14em;
            color: #94A3B8;
            margin-bottom: 18px;
          }
          .partners-marquee {
            display: flex;
            --marquee-gap: 14px;
            gap: var(--marquee-gap);
            overflow: hidden;
            pointer-events: none;
            mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
            -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
          }
          .partners-track {
            display: flex;
            gap: var(--marquee-gap);
            flex-shrink: 0;
            animation: zc-marqueeScroll 32s linear infinite;
          }
          @media (prefers-reduced-motion: reduce) { .partners-track { animation: none; } }
          .partner-logo-item {
            display: flex; flex-direction: column; justify-content: center;
            min-width: 180px;
            padding: 12px 20px;
            border-radius: 14px;
            background: #FAF7F3;
            border: 1px solid var(--fr-line);
          }
          .p-title { font-weight: 700; color: var(--fr-navy); font-size: 14.5px; white-space: nowrap; }
          .p-sub { font-size: 12px; color: #94A3B8; white-space: nowrap; }

          .advertise-teaser {
            display: flex; align-items: center; justify-content: space-between; gap: 24px;
            padding: clamp(24px, 3vw, 36px);
            margin-bottom: 24px;
            border-radius: 26px;
            background: linear-gradient(120deg, #FFE7CC 0%, #FFD3A1 100%);
          }
          .at-tag {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
            color: #9A4A05; margin-bottom: 8px;
          }
          .at-title { font-size: clamp(1.4rem, 1rem + 1.4vw, 2rem); font-weight: 800; color: var(--fr-navy); margin-bottom: 8px; }
          .at-desc { color: #5B4630; max-width: 620px; font-size: 15px; line-height: 1.6; }

          .app-download-banner {
            position: relative;
            overflow: hidden;
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            align-items: center;
            gap: 24px;
            padding: clamp(30px, 4vw, 56px);
            border-radius: 30px;
            background:
              radial-gradient(60% 90% at 100% 100%, rgba(247, 148, 29, 0.35), transparent 60%),
              linear-gradient(150deg, #12305A 0%, var(--fr-navy) 70%);
            color: #FFFFFF;
          }
          .light-eyebrow { color: #FFB55C; }
          .app-banner-title {
            font-size: clamp(1.7rem, 1.1rem + 2vw, 2.8rem);
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 12px;
            color: #FFFFFF;
          }
          .app-banner-desc { color: #A9B6C9; font-size: 15.5px; max-width: 440px; margin-bottom: 26px; }
          .app-store-btns { display: flex; gap: 14px; align-items: stretch; flex-wrap: wrap; }
          .qr-box {
            width: 92px; height: 92px; border-radius: 16px;
            display: grid; place-items: center;
            background: #FFFFFF;
          }
          .store-btns-column { display: flex; flex-direction: column; gap: 10px; }
          .store-btn {
            display: flex; flex-direction: column;
            min-width: 160px;
            padding: 8px 16px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.18);
            color: #FFFFFF;
            text-decoration: none;
          }
          .st-sub { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em; color: #A9B6C9; }
          .st-name { font-size: 15px; font-weight: 700; }

          .app-banner-right { display: flex; justify-content: center; }
          .mockup-phone {
            width: 210px;
            padding: 10px;
            border-radius: 34px;
            background: #FFFFFF;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35);
            transform: rotate(6deg);
          }
          .mockup-screen {
            display: flex; flex-direction: column; align-items: center;
            padding: 26px 16px 20px;
            border-radius: 26px;
            background: var(--fr-cream);
            text-align: center;
          }
          .m-logo-img { width: 64px; height: 64px; border-radius: 16px; object-fit: cover; margin-bottom: 8px; }
          .m-logo { font-size: 22px; font-weight: 800; font-style: italic; color: var(--fr-orange); }
          .m-logo b { color: var(--fr-navy); }
          .m-tag { font-size: 10.5px; color: #64748B; margin: 2px 0 16px; letter-spacing: 0.04em; }
          .m-field {
            width: 100%;
            display: flex; align-items: center; gap: 8px;
            padding: 9px 10px; margin-bottom: 6px;
            border-radius: 10px;
            background: #FFFFFF;
            font-size: 11.5px; color: #94A3B8; text-align: left;
          }
          .m-btn {
            width: 100%;
            margin-top: 6px;
            padding: 10px;
            border-radius: 12px;
            background: var(--fr-orange);
            color: #FFFFFF;
            font-size: 12.5px; font-weight: 700;
          }

          /* ---------- RESPONSIVE ---------- */
          @media (max-width: 1080px) {
            .booking-form { grid-template-columns: 1fr 1fr; }
            .booking-submit-btn { grid-column: 1 / -1; }
          }

          @media (max-width: 960px) {
            .hero-container { grid-template-columns: 1fr; }
            .hero-right { margin-top: 8px; }
            .pin-stage { width: min(300px, 78vw); }
            .why-layout { grid-template-columns: 1fr; }
            .app-download-banner { grid-template-columns: 1fr; }
            .app-banner-right { display: none; }
          }

          @media (max-width: 720px) {
            .steps-grid { grid-template-columns: 1fr; gap: 30px; }
            .steps-grid::before { display: none; }
            .advertise-teaser { flex-direction: column; align-items: flex-start; }
          }

          @media (max-width: 560px) {
            .booking-form { grid-template-columns: 1fr; }
            .booking-tabs { overflow-x: auto; }
            .b-tab { padding: 8px 12px; font-size: 13px; white-space: nowrap; }
            .why-us-grid { grid-template-columns: 1fr; }
            .speed-lines span:nth-child(2) { width: 110px; }
            .float-chip { padding: 8px 12px 8px 8px; }
            .float-chip span { display: none; }
            .chip-top { right: -4%; }
            .chip-bottom { left: -2%; }
            .hero-cta-group .btn { flex: 1 1 auto; }
            .trusted-app-section { padding-bottom: 50px; }
          }
        }

        @keyframes fr-speed {
          0% { transform: translateX(-16px); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateX(18px); opacity: 0; }
        }

        @keyframes fr-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* One track width plus one gap, so the duplicate track lands exactly
           where the first began. */
        @keyframes zc-marqueeScroll {
          to { transform: translateX(calc(-100% - var(--marquee-gap))); }
        }
      `}</style>
    </div>
  );
};

export default Home;
