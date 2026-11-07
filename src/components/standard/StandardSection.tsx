import Image from "next/image";

import { Reveal, RevealHeading, RevealMedia } from "@/components/ui/Reveal";
import { media } from "@/content/media";
import { standards } from "@/content/standards";
import { Gleam, Parallax, PointerGlow } from "@/components/ui/Motion";

export function StandardSection() {
  return (
    <section id="standard" aria-labelledby="standard-heading" className="scroll-mt-24 py-14 lg:py-20">
      <div className="container-cs">
        {/* People band: photograph meets a petrol panel along one diagonal */}
        <div className="relative overflow-hidden rounded-[var(--radius-panel)] bg-petrol-800">
          <PointerGlow />
          <div className="grid lg:grid-cols-12">
            <RevealMedia className="relative aspect-[4/3] lg:col-span-7 lg:aspect-auto lg:min-h-[520px]" from="left">
              <Parallax amount={3}>
                <Image
                  src={media.standardPeople.src}
                  alt={media.standardPeople.alt}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  placeholder="blur"
                  className="object-cover"
                  style={{ objectPosition: media.standardPeople.focus }}
                />
              </Parallax>
            </RevealMedia>
            <div className="on-dark relative flex flex-col justify-center p-7 sm:p-10 lg:col-span-5 lg:p-14">
              <div
                aria-hidden="true"
                className="absolute inset-y-0 -left-24 hidden w-56 -skew-x-[12deg] bg-petrol-800 lg:block"
              />
              <div className="relative">
                <Reveal>
                  <p className="eyebrow flex items-center gap-3 text-brass-300">
                    <span className="h-px w-8 bg-brass-300/70" aria-hidden="true" />
                    Our standard
                  </p>
                </Reveal>
                <RevealHeading
                  id="standard-heading"
                  className="display-lg mt-5 text-porcelain-50"
                  lines={["Good people.", <Gleam key="i">Careful work.</Gleam>]}
                />
                <Reveal delay={0.15}>
                  <p className="mt-6 max-w-sm text-[1.02rem] leading-relaxed text-porcelain-50/75">
                    A Clearspace visit is calm, unhurried and consistent. These are the commitments behind every clean.
                  </p>
                </Reveal>
              </div>
            </div>
          </div>
        </div>

        {/* Commitments, with two supporting details in different proportions */}
        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-8">
          <ol className="grid gap-x-10 sm:grid-cols-2 lg:col-span-7 lg:self-center">
            {standards.map((s, i) => (
              <li key={s.title} className="list-none border-t border-petrol-800/15">
                <Reveal delay={i * 0.06} className="py-6">
                  <span className="font-display text-[1.05rem] tabular-nums text-brass-700" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="display-sm mt-2 text-petrol-900">{s.title}</h3>
                  <p className="mt-2 text-[0.97rem] leading-relaxed text-ink-muted">{s.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
          <div className="grid grid-cols-5 items-end gap-4 lg:col-span-5">
            <RevealMedia className="relative col-span-3 aspect-[3/4] overflow-hidden rounded-[var(--radius-card)]">
              <Parallax amount={3}>
                <Image
                  src={media.standardDetail.src}
                  alt={media.standardDetail.alt}
                  fill
                  sizes="(min-width: 1024px) 24vw, 60vw"
                  placeholder="blur"
                  className="object-cover"
                  style={{ objectPosition: media.standardDetail.focus }}
                />
              </Parallax>
            </RevealMedia>
            <div className="col-span-2 flex flex-col gap-4">
              <RevealMedia className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)]" delay={0.12}>
                <Parallax amount={3}>
                  <Image
                    src={media.standardProducts.src}
                    alt={media.standardProducts.alt}
                    fill
                    sizes="(min-width: 1024px) 16vw, 40vw"
                    placeholder="blur"
                    className="object-cover"
                    style={{ objectPosition: media.standardProducts.focus }}
                  />
                </Parallax>
              </RevealMedia>
              <p className="text-[0.82rem] leading-snug text-ink-muted">
                Products chosen for the surface, never the strongest on the shelf.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
