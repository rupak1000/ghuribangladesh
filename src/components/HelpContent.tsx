"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, Compass, Frame, Globe, Languages, Map as MapIcon, Printer, Route, Search, ShieldCheck, Utensils, User, type LucideIcon } from "lucide-react";
import { useT } from "@/lib/i18n";
import { LinkButton } from "./ui/Button";
import { T } from "./T";

interface Bi {
  en: string;
  bn: string;
}
const b = (en: string, bn: string): Bi => ({ en, bn });

const features: { id: string; icon: LucideIcon; title: Bi; href?: string; cta?: Bi; points: Bi[] }[] = [
  {
    id: "explore",
    icon: Compass,
    title: b("Explore the map", "মানচিত্রে ঘুরে দেখুন"),
    href: "/explore",
    cta: b("Open Explore", "ঘুরে দেখুন"),
    points: [
      b("Tap any district on the map to see its places, foods and experiences, then open its page.", "মানচিত্রের যেকোনো জেলায় ট্যাপ করলে তার স্থান, খাবার ও অভিজ্ঞতা দেখা যাবে। তারপর জেলার পাতাটি খুলুন।"),
      b("Zoom with the + and − buttons, pinch on a phone, or hold Ctrl or ⌘ and scroll on a computer. Drag to move around.", "+ ও − বোতামে জুম করুন, ফোনে দুই আঙুলে টেনে বড়-ছোট করুন, আর কম্পিউটারে Ctrl বা ⌘ চেপে স্ক্রল করুন। টেনে মানচিত্র সরান।"),
      b("Use the filters (type, who it is for, region) to narrow down places. Numbered circles are groups of places that open up as you zoom in.", "ধরন, কাদের জন্য ও অঞ্চল অনুযায়ী ফিল্টার দিয়ে স্থান বাছাই করুন। সংখ্যা লেখা গোল চিহ্নগুলো একাধিক স্থানের গুচ্ছ, জুম করলে আলাদা হয়ে যায়।"),
    ],
  },
  {
    id: "search",
    icon: Search,
    title: b("Search", "খোঁজা"),
    points: [
      b("Press ⌘K (or Ctrl+K) or tap the search icon. Type a district, a place, a dish or a word like “beach” or “tea”.", "⌘K (বা Ctrl+K) চাপুন অথবা সার্চ আইকনে ট্যাপ করুন। জেলা, স্থান, খাবার কিংবা “সৈকত” বা “চা”-এর মতো কোনো শব্দ লিখুন।"),
      b("Results are grouped into districts, places, foods and experiences. Press Enter to open the best match.", "ফলাফল জেলা, স্থান, খাবার ও অভিজ্ঞতা অনুযায়ী সাজানো থাকে। সবচেয়ে মিল থাকা ফলাফল খুলতে Enter চাপুন।"),
    ],
  },
  {
    id: "food",
    icon: Utensils,
    title: b("Food", "খাবার"),
    href: "/food",
    cta: b("Taste Bangladesh", "বাংলাদেশের স্বাদ নিন"),
    points: [
      b("Pick a district on the food map to see what it is famous for. Scroll down to see the favourite dish of every district.", "খাবারের মানচিত্রে একটি জেলা বাছুন, দেখবেন সেখানকার বিখ্যাত খাবার কী। নিচে স্ক্রল করলে প্রতিটি জেলার প্রিয় খাবার পাবেন।"),
      b("Mark a dish as “I've Tried This”, “Want to Try” or a favorite. Your progress shows how many districts you have tasted.", "কোনো খাবারকে “আমি চেখে দেখেছি”, “চেখে দেখতে চাই” বা প্রিয় হিসেবে চিহ্নিত করুন। কত জেলার স্বাদ নিয়েছেন তা অগ্রগতিতে দেখা যায়।"),
    ],
  },
  {
    id: "mark",
    icon: Bookmark,
    title: b("Save, visit and favorite", "সংরক্ষণ, ভ্রমণ ও প্রিয়"),
    points: [
      b("On a place, use Save (want to visit), “I've Been Here” (visited) and the heart (favorite). Add to Trip puts it in your trip plan.", "কোনো স্থানে “সংরক্ষণ” (ঘুরতে চাই), “আমি গিয়েছি” (ঘোরা হয়েছে) ও হার্ট (প্রিয়) ব্যবহার করুন। “ট্রিপে যোগ করুন” চাপলে স্থানটি আপনার ট্রিপ পরিকল্পনায় চলে যায়।"),
      b("On a district, use “Add to My Map” and the Visited, Want to Visit and Favorite buttons.", "কোনো জেলায় “আমার মানচিত্রে যোগ করুন” এবং ঘোরা হয়েছে, ঘুরতে চাই ও প্রিয় বোতামগুলো ব্যবহার করুন।"),
      b("You can use the app as a guest, but saving needs a quick sign-in (just a name, or continue as guest). Everything is kept on this device.", "অতিথি হিসেবেও অ্যাপ ব্যবহার করা যায়, তবে সংরক্ষণ করতে হলে একটু সাইন ইন করতে হয় (শুধু একটি নাম, অথবা অতিথি হিসেবেই চালিয়ে যান)। সবকিছু এই ডিভাইসেই থাকে।"),
    ],
  },
  {
    id: "mymap",
    icon: MapIcon,
    title: b("My Map and achievements", "আমার মানচিত্র ও অর্জন"),
    href: "/my-map",
    cta: b("Open My Map", "আমার মানচিত্র খুলুন"),
    points: [
      b("Your map colours each district: visited, want to visit, favorite. Under it, the district list lets you tick districts by name, one division at a time.", "আপনার মানচিত্রে প্রতিটি জেলা রঙ পায়: ঘোরা হয়েছে, ঘুরতে চাই, প্রিয়। এর নিচের জেলার তালিকা থেকে বিভাগ ধরে ধরে নাম দেখে জেলা টিক দিতে পারবেন।"),
      b("Achievements unlock as you go, from your first district to all 64. “Try a sample journey” shows how a full map looks.", "প্রথম জেলা থেকে শুরু করে সব ৬৪ জেলা পর্যন্ত, ঘুরতে ঘুরতে একের পর এক অর্জন খুলে যায়। “একটি নমুনা যাত্রা চেষ্টা করুন” চাপলে দেখবেন ভরা মানচিত্র কেমন হয়।"),
    ],
  },
  {
    id: "trips",
    icon: Route,
    title: b("Trip planner", "ট্রিপ পরিকল্পনা"),
    href: "/trips",
    cta: b("Plan a trip", "ট্রিপ পরিকল্পনা করুন"),
    points: [
      b("Step 1: choose your starting city, then add destinations by tapping the map or searching. Step 2: pick travelers, how you will travel (buses, flight, self-drive car, motorbike, ferry, hiking), stay level and number of days.", "ধাপ ১: শুরুর শহর বাছুন, তারপর মানচিত্রে ট্যাপ করে বা খুঁজে গন্তব্য যোগ করুন। ধাপ ২: ভ্রমণকারীর সংখ্যা, যাতায়াতের মাধ্যম (বাস, বিমান, নিজে চালানো গাড়ি, মোটরবাইক, ফেরি, হাঁটা), থাকার মান আর কত দিন ঘুরবেন তা ঠিক করুন।"),
      b("Press Generate to get a day-by-day plan with the route on the map, distance and time for each leg, famous local food, places with time needed, where to stay, and a cost breakdown.", "“তৈরি করুন” চাপলেই পাবেন দিন-ভিত্তিক পরিকল্পনা: মানচিত্রে পথ, প্রতিটি অংশের দূরত্ব ও সময়, বিখ্যাত স্থানীয় খাবার, কোন স্থানে কত সময় লাগবে, কোথায় থাকবেন আর খরচের বিবরণ।"),
      b("Edit anything: remove or add stops, rename the trip, tick which costs count, or type your own prices. Share the plan with friends by link or WhatsApp, or print it.", "সবকিছুই বদলানো যায়: বিরতি বাদ দিন বা যোগ করুন, ট্রিপের নাম বদলান, কোন খরচ ধরা হবে তা টিক দিন, কিংবা নিজের দাম লিখুন। পরিকল্পনাটি লিংক বা হোয়াটসঅ্যাপে বন্ধুদের সাথে শেয়ার করুন, অথবা ছাপিয়ে নিন।"),
    ],
  },
  {
    id: "profile",
    icon: User,
    title: b("Profile and public link", "প্রোফাইল ও পাবলিক লিংক"),
    href: "/profile",
    cta: b("Open Profile", "প্রোফাইল খুলুন"),
    points: [
      b("Your profile shows your stats, achievements and map colours (try the light Natural theme or darker ones).", "আপনার প্রোফাইলে পরিসংখ্যান, অর্জন আর মানচিত্রের রং দেখা যায় (হালকা “Natural” থিম বা গাঢ় থিমগুলো একবার দেখুন)।"),
      b("Press “Create my public link” to get a short page like /u/your-name-1a2b that anyone can open without an account. It shows your name, bio, map, visited places and foods, never your email. You can delete it any time.", "“আমার পাবলিক লিংক বানান” চাপলে /u/your-name-1a2b-এর মতো একটি ছোট পাতা পাবেন, যা অ্যাকাউন্ট ছাড়াই যে কেউ খুলতে পারে। তাতে আপনার নাম, পরিচিতি, মানচিত্র, ঘুরে আসা স্থান ও খাবার থাকে, ইমেইল কখনোই নয়। যেকোনো সময় এটি মুছে ফেলা যায়।"),
    ],
  },
  {
    id: "wall",
    icon: Frame,
    title: b("Wall map for printing", "ছাপার জন্য দেয়ালের মানচিত্র"),
    href: "/wall-map",
    cta: b("Make a wall map", "দেয়ালের মানচিত্র বানান"),
    points: [
      b("Choose a style (Natural, Vintage, Midnight or Line art), a paper size from A4 to A1, a border or frame mat, and your own title.", "একটি ধরন (Natural, Vintage, Midnight বা Line art), A4 থেকে A1 পর্যন্ত কাগজের আকার, বর্ডার বা ফ্রেম ম্যাট আর নিজের শিরোনাম বেছে নিন।"),
      b("Download a high-resolution PNG, a SVG that stays sharp at any size, or print it. Colour in the districts you have visited to make it personal.", "উচ্চ রেজোলিউশনের PNG, যেকোনো আকারে স্পষ্ট থাকা SVG ডাউনলোড করুন, কিংবা সরাসরি ছাপুন। যেসব জেলায় গেছেন সেগুলোতে রং করে মানচিত্রটিকে নিজের করে নিন।"),
    ],
  },
  {
    id: "language",
    icon: Languages,
    title: b("Language", "ভাষা"),
    points: [
      b("Use the “বাংলা / EN” button at the top to switch the menus, buttons and district names between Bengali and English. Longer descriptions are currently in English.", "উপরের “বাংলা / EN” বোতাম চেপে মেনু, বোতাম ও জেলার নাম বাংলা আর ইংরেজির মধ্যে বদলে নিন। বড় বিবরণগুলো এখনও ইংরেজিতে আছে।"),
    ],
  },
];

const faqs: { q: Bi; a: Bi }[] = [
  { q: b("Do I need an account?", "অ্যাকাউন্ট কি লাগবে?"), a: b("No. You can explore everything as a guest. To save places, mark visits or plan trips, sign in with just a name, or choose “Continue as guest”. There is no password.", "না। অতিথি হিসেবেই সবকিছু ঘুরে দেখা যায়। স্থান সংরক্ষণ, ভ্রমণ চিহ্নিত করা বা ট্রিপ পরিকল্পনার জন্য শুধু একটি নাম দিয়ে সাইন ইন করুন, অথবা “অতিথি হিসেবে চালিয়ে যান” বেছে নিন। কোনো পাসওয়ার্ড নেই।") },
  { q: b("Where is my data kept?", "আমার তথ্য কোথায় থাকে?"), a: b("On this device, in your browser. If you clear your browser data or switch phones, your map starts fresh. A public profile or a shared trip link is the only thing stored on our server, and only when you create it.", "এই ডিভাইসে, আপনার ব্রাউজারে। ব্রাউজারের ডেটা মুছলে বা ফোন বদলালে আপনার মানচিত্র নতুন করে শুরু হবে। আমাদের সার্ভারে শুধু পাবলিক প্রোফাইল বা শেয়ার করা ট্রিপের লিংক জমা থাকে, আর তা-ও কেবল আপনি তৈরি করলে।") },
  { q: b("Are the costs real prices?", "খরচগুলো কি আসল দাম?"), a: b("They are estimates, not live prices. Distances come from real road routes, but fares, hotel rooms, food and local transport use typical rates, and they change with season and bargaining. In the cost box you can type your own quotes to get a total based on real numbers.", "এগুলো আনুমানিক হিসাব, সরাসরি দাম নয়। দূরত্ব আসল সড়কপথ থেকে নেওয়া, কিন্তু ভাড়া, হোটেল, খাবার ও স্থানীয় যাতায়াতে সাধারণ দর ধরা হয়েছে, যা মৌসুম ও দরদামে বদলায়। খরচের ঘরে নিজের পাওয়া দর লিখলে আসল সংখ্যার ভিত্তিতে মোট হিসাব পাবেন।") },
  { q: b("How are distances and fares worked out?", "দূরত্ব ও ভাড়া কীভাবে হিসাব করা হয়?"), a: b("Distances and drive times come from OpenStreetMap road routing between district headquarters. Bus fares are about ৳2.4–3.2 per km (non-AC) and ৳3.8–5.2 per km (AC). Self-drive counts fuel and tolls only. Stay is rooms × nights × a nightly price for the level you pick, shared by two. Food and local transport are per person per day, and entry fees and extras add about 10%. The result shows a likely range of 85% to 120%.", "দূরত্ব ও গাড়ি চালানোর সময় জেলা সদরগুলোর মধ্যে OpenStreetMap-এর সড়কপথ থেকে নেওয়া হয়। বাসভাড়া কিলোমিটারে প্রায় ৳২.৪–৩.২ (নন-এসি) এবং ৳৩.৮–৫.২ (এসি)। নিজে চালালে শুধু জ্বালানি ও টোল ধরা হয়। থাকার খরচ হলো রুম × রাত × আপনার বাছাই করা মানের রাতপ্রতি দাম, দুজনে ভাগ করে। খাবার ও স্থানীয় যাতায়াত জনপ্রতি দিনপ্রতি ধরা হয়, আর প্রবেশ ফি ও অন্যান্য খরচে প্রায় ১০% যোগ হয়। ফলাফলে ৮৫% থেকে ১২০% পর্যন্ত সম্ভাব্য পরিসর দেখানো হয়।") },
  { q: b("Why do some places show an illustration instead of a photo?", "কিছু স্থানে ছবির বদলে চিত্রকল্প কেন দেখা যায়?"), a: b("Photos come from Wikimedia Commons under free licences and are credited to their authors. Where we could not find a good photo of the exact place, we show an illustration instead of a wrong picture.", "ছবিগুলো উইকিমিডিয়া কমন্স থেকে মুক্ত লাইসেন্সে নেওয়া, আর আলোকচিত্রীদের কৃতজ্ঞতা জানানো হয়েছে। কোনো স্থানের সঠিক ভালো ছবি না পেলে ভুল ছবি দেখানোর চেয়ে আমরা একটি চিত্রকল্প দেখাই।") },
  { q: b("How do I delete my public profile or a shared trip?", "আমার পাবলিক প্রোফাইল বা শেয়ার করা ট্রিপ কীভাবে মুছব?"), a: b("For your profile, open Profile and choose “Stop sharing and delete the public page”. Shared trip links are read-only snapshots and cannot be changed after sharing.", "প্রোফাইলের জন্য প্রোফাইল পাতায় গিয়ে “শেয়ার বন্ধ করুন ও পাবলিক পাতা মুছুন” বেছে নিন। শেয়ার করা ট্রিপের লিংক শুধু-পড়া একটি কপি, শেয়ার করার পর তা আর বদলানো যায় না।") },
  { q: b("How do I print the map?", "মানচিত্র কীভাবে ছাপব?"), a: b("Open Wall map, choose your paper size and style, then Download PNG or SVG for a print shop, or press Print and choose “Save as PDF”. For home printing set margins to None and scale to 100%.", "“দেয়ালের মানচিত্র” খুলে কাগজের আকার ও ধরন বাছুন। তারপর প্রেসে দেওয়ার জন্য PNG বা SVG ডাউনলোড করুন, অথবা “প্রিন্ট” চেপে “Save as PDF” বেছে নিন। বাসায় ছাপতে মার্জিন ‘None’ আর স্কেল ১০০% রাখুন।") },
  { q: b("Something looks wrong. What can I do?", "কিছু ভুল মনে হচ্ছে। কী করব?"), a: b("Try refreshing the page. The places and foods were compiled by hand and may contain mistakes, so please check opening details before you travel.", "পাতাটি রিফ্রেশ করে দেখুন। স্থান ও খাবারের তথ্য হাতে সংগ্রহ করা, তাই ভুল থাকতে পারে। যাওয়ার আগে খোলা-বন্ধের সময়সহ তথ্যগুলো যাচাই করে নিন।") },
];

const quick: [string, Bi, Bi][] = [
  ["1", b("Explore", "ঘুরে দেখুন"), b("Tap districts on the map and browse places and foods.", "মানচিত্রে জেলায় ট্যাপ করে স্থান ও খাবার দেখুন।")],
  ["2", b("Mark", "চিহ্নিত করুন"), b("Save places and mark districts you have visited. Watch your map fill in.", "স্থান সংরক্ষণ করুন আর ঘুরে আসা জেলা চিহ্নিত করুন। দেখুন আপনার মানচিত্র ধীরে ধীরে ভরে উঠছে।")],
  ["3", b("Plan & share", "পরিকল্পনা ও শেয়ার"), b("Plan a trip, share your profile, or print a wall map.", "ট্রিপ পরিকল্পনা করুন, প্রোফাইল শেয়ার করুন, কিংবা দেয়ালের মানচিত্র ছাপুন।")],
];

export function HelpContent() {
  const { lang, t } = useT();
  const x = (v: Bi) => v[lang];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
      <p className="eyebrow"><T>Help &amp; guide</T></p>
      <h1 className="mt-1 font-display text-3xl font-semibold leading-tight md:text-5xl"><T>How Ghuri Bangladesh works</T></h1>
      <p className="mt-3 max-w-2xl text-base text-muted md:text-lg"><T>Discover places and food across all 64 districts, keep track of where you have been, plan trips with distances and costs, and print your own map for the wall.</T></p>

      <section className="mt-8 grid gap-3 sm:grid-cols-3" aria-label={t("Quick start")}>
        {quick.map(([n, title, desc]) => (
          <div key={n} className="rounded-2xl border border-line bg-card p-4 shadow-soft">
            <span className="grid size-8 place-items-center rounded-full bg-forest text-sm font-bold text-white">{lang === "bn" ? "১২৩"[Number(n) - 1] : n}</span>
            <h2 className="mt-3 font-display text-xl font-semibold">{x(title)}</h2>
            <p className="mt-1 text-sm text-muted">{x(desc)}</p>
          </div>
        ))}
      </section>

      <nav aria-label={t("On this page")} className="mt-8 flex flex-wrap gap-2">
        {features.map((f) => (
          <a key={f.id} href={`#${f.id}`} className="inline-flex h-10 items-center rounded-full bg-moss px-4 text-sm font-medium hover:bg-emerald-soft">{x(f.title)}</a>
        ))}
        <a href="#faq" className="inline-flex h-10 items-center rounded-full bg-moss px-4 text-sm font-medium hover:bg-emerald-soft"><T>Questions</T></a>
      </nav>

      <div className="mt-8 space-y-4">
        {features.map(({ id, icon: Icon, title, points, href, cta }) => (
          <section key={id} id={id} className="scroll-mt-24 rounded-3xl border border-line bg-card p-5 shadow-soft md:p-7">
            <div className="flex items-start justify-between gap-4">
              <h2 className="flex items-center gap-3 font-display text-2xl font-semibold">
                <span className="grid size-10 place-items-center rounded-full bg-emerald-soft text-forest"><Icon className="size-5" aria-hidden /></span>
                {x(title)}
              </h2>
              {href && cta && (
                <Link href={href} className="hidden min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-forest hover:underline sm:flex">{x(cta)} <ArrowRight className="size-4" aria-hidden /></Link>
              )}
            </div>
            <ul className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-ink/90">
              {points.map((p) => (
                <li key={p.en} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald" aria-hidden />{x(p)}</li>
              ))}
            </ul>
            {href && cta && <Link href={href} className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-forest hover:underline sm:hidden">{x(cta)} <ArrowRight className="size-4" aria-hidden /></Link>}
          </section>
        ))}
      </div>

      <section id="faq" className="mt-12 scroll-mt-24">
        <h2 className="flex items-center gap-3 font-display text-2xl font-semibold md:text-3xl"><ShieldCheck className="size-6 text-emerald" aria-hidden /> <T>Questions and answers</T></h2>
        <div className="mt-4 divide-y divide-line rounded-3xl border border-line bg-card shadow-soft">
          {faqs.map((f) => (
            <details key={f.q.en} className="group px-5 py-1 md:px-7">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold marker:hidden">
                {x(f.q)}
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-moss text-lg leading-none transition group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="pb-4 text-[15px] leading-relaxed text-ink/85">{x(f.a)}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-3xl bg-forest p-7 text-center text-white md:p-10">
        <h2 className="font-display text-2xl font-semibold md:text-3xl"><T>Ready to explore?</T></h2>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <LinkButton href="/explore" variant="amber" size="lg"><Compass className="size-4" aria-hidden /> <T>Explore</T></LinkButton>
          <LinkButton href="/trips" variant="light" size="lg"><Route className="size-4" aria-hidden /> <T>Plan a trip</T></LinkButton>
          <LinkButton href="/wall-map" variant="light" size="lg"><Printer className="size-4" aria-hidden /> <T>Wall map</T></LinkButton>
          <LinkButton href="/my-map" variant="light" size="lg"><Globe className="size-4" aria-hidden /> <T>My map</T></LinkButton>
        </div>
      </section>
    </div>
  );
}
