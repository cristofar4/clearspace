"use client";

import type { MouseEvent } from "react";

import { useSite } from "@/components/providers/SiteProvider";
import { Icon } from "@/components/ui/Icon";
import { Wordmark } from "@/components/ui/Wordmark";
import { bookingMode } from "@/content/booking";
import { photoCredits } from "@/content/media";
import { services, type ServiceId } from "@/content/services";
import { primaryNav, site } from "@/content/site";
import { useClientValue } from "@/lib/hooks";
import { PointerGlow, ScannedWordmark } from "@/components/ui/Motion";

export function SiteFooter() {
  const { showService } = useSite();
  const year = useClientValue(() => new Date().getFullYear(), site.copyrightFallbackYear);

  const pick = (e: MouseEvent, id: ServiceId) => {
    e.preventDefault();
    showService(id, { scroll: true });
  };

  const contact = [
    site.contact.email && { label: "Email", value: site.contact.email, href: `mailto:${site.contact.email}` },
    site.contact.phone && {
      label: "Phone",
      value: site.contact.phone,
      href: `tel:${site.contact.phone.replace(/\s/g, "")}`,
    },
    site.contact.serviceArea && { label: "Area", value: site.contact.serviceArea },
    site.contact.hours && { label: "Hours", value: site.contact.hours },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  return (
    <footer className="on-dark relative overflow-hidden bg-petrol-900 text-porcelain-50">
      <PointerGlow />
      <div className="container-cs relative py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Wordmark tone="light" />
            <p className="mt-6 max-w-sm font-display text-[1.6rem] leading-snug text-porcelain-50/90">{site.tagline}</p>
            <a href="#book" className="btn btn-light mt-8">
              Book a clean
              <Icon name="arrow" size={18} className="btn-arrow" />
            </a>
          </div>

          <nav aria-label="Footer" className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <p className="eyebrow text-brass-300">Services</p>
              <ul className="mt-5 space-y-3 text-[0.95rem]">
                {services.map((s) => (
                  <li key={s.id}>
                    <a
                      href="#services"
                      onClick={(e) => pick(e, s.id)}
                      className="link-underline text-porcelain-50/80 hover:text-porcelain-50"
                    >
                      {s.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-brass-300">Explore</p>
              <ul className="mt-5 space-y-3 text-[0.95rem]">
                <li>
                  <a href="#top" className="link-underline text-porcelain-50/80 hover:text-porcelain-50">
                    The Clearspace reset
                  </a>
                </li>
                {primaryNav.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="link-underline text-porcelain-50/80 hover:text-porcelain-50">
                      {l.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a href="#book" className="link-underline text-porcelain-50/80 hover:text-porcelain-50">
                    Book a clean
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="eyebrow text-brass-300">Contact</p>
              {contact.length ? (
                <dl className="mt-5 space-y-3 text-[0.95rem]">
                  {contact.map((c) => (
                    <div key={c.label}>
                      <dt className="sr-only">{c.label}</dt>
                      <dd>
                        {c.href ? (
                          <a href={c.href} className="link-underline text-porcelain-50/80 hover:text-porcelain-50">
                            {c.value}
                          </a>
                        ) : (
                          <span className="text-porcelain-50/80">{c.value}</span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-5 max-w-[16rem] text-[0.95rem] leading-relaxed text-porcelain-50/70">
                  The quickest way to reach us is a booking request. Tell us about your space and we will reply.
                </p>
              )}
            </div>
          </nav>
        </div>

        <div className="mt-14 lg:mt-20">
          <ScannedWordmark text={site.wordmark} />
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-porcelain-50/12 pt-6 text-[0.8rem] text-porcelain-50/70 md:flex-row md:items-start md:justify-between">
          <p>
            © {year} {site.name}
            {bookingMode === "demo" && <span> · Demo site. Bookings are not live.</span>}
          </p>
          <details className="group md:max-w-md md:text-right">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full hover:text-porcelain-50">
              Photography credits
              <Icon name="chevronDown" size={14} className="transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 leading-relaxed">
              Photographs via Unsplash by{" "}
              {photoCredits.map((c, i) => (
                <span key={c.name}>
                  <a
                    href={c.url}
                    className="underline decoration-porcelain-50/30 underline-offset-2 hover:text-porcelain-50"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {c.name}
                  </a>
                  {i < photoCredits.length - 2 ? ", " : i === photoCredits.length - 2 ? " and " : "."}
                </span>
              ))}
            </p>
          </details>
        </div>
      </div>
    </footer>
  );
}
