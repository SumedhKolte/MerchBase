import Image from "next/image";
import { Boxes, Link2, ShieldCheck, Zap } from "lucide-react";

/** Real catalog items, so the first screen already shows what the app manages. */
const SHOWCASE = [
  { title: "Annibale Colombo Bed", path: "furniture/annibale-colombo-bed" },
  { title: "CK One", path: "fragrances/calvin-klein-ck-one" },
  { title: "Echo Plus", path: "mobile-accessories/amazon-echo-plus" },
  { title: "Leather Watch", path: "mens-watches/brown-leather-belt-watch" },
  { title: "iPhone 5s", path: "smartphones/iphone-5s" },
  { title: "Sun Glasses", path: "sunglasses/black-sun-glasses" },
];

const FEATURES = [
  { icon: Zap, text: "Race-safe search with instant, debounced results" },
  { icon: Link2, text: "Every filter, sort, and page lives in a shareable URL" },
  { icon: ShieldCheck, text: "Demo edits stay local — reset to live data anytime" },
];

/**
 * Brand panel beside the sign-in form on large screens. It is always dark by
 * design (a fixed brand surface), so it uses raw palette colors, not theme tokens.
 */
export function LoginShowcase() {
  return (
    <aside className="relative isolate hidden overflow-hidden bg-zinc-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-grid [--grid-line:rgb(255_255_255/0.06)] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_75%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(36rem_24rem_at_15%_10%,rgb(99_102_241/0.28),transparent)]"
      />

      <div className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
        <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-500 shadow-lg shadow-indigo-500/30">
          <Boxes className="size-4" aria-hidden />
        </span>
        MerchBase
      </div>

      <div className="space-y-10">
        <div className="max-w-md">
          <h2 className="text-4xl font-semibold tracking-tight text-balance">
            Your catalog, organized and under control.
          </h2>
          <p className="mt-4 text-zinc-400">
            Search, filter, and curate 194 live products from one fast, keyboard-friendly workspace.
          </p>
        </div>

        <ul className="grid max-w-md grid-cols-3 gap-3" aria-label="Sample catalog products">
          {SHOWCASE.map(({ title, path }) => (
            <li
              key={path}
              className="relative aspect-square overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10"
            >
              <Image
                src={`https://cdn.dummyjson.com/product-images/${path}/thumbnail.webp`}
                alt={title}
                fill
                sizes="140px"
                className="object-contain p-3"
              />
            </li>
          ))}
        </ul>

        <ul className="space-y-3 text-sm text-zinc-300">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-white/5 text-indigo-300 ring-1 ring-white/10">
                <Icon className="size-4" aria-hidden />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-zinc-500">Product data from DummyJSON.</p>
    </aside>
  );
}
