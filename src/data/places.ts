import type { Category, Place, Style } from "@/lib/types";
import { districts } from "./districts";
import { hash, slugify } from "@/lib/utils";

interface Extra {
  ll?: [number, number];
  tags?: Style[];
  best?: string;
  budget?: string;
  hidden?: boolean;
  todo?: string[];
}

const centers = new Map(districts.map((d) => [d.slug, d]));

const defaultTags: Record<Category, Style[]> = {
  nature: ["photography", "family", "couple"],
  history: ["family", "solo", "budget"],
  food: ["budget", "family", "solo"],
  adventure: ["solo", "couple", "photography"],
  beach: ["family", "couple", "photography"],
  culture: ["solo", "family", "photography"],
  wildlife: ["family", "photography", "solo"],
};

const defaultBudget: Record<Category, string> = {
  nature: "৳2,000–4,500",
  history: "৳800–2,500",
  food: "৳500–1,500",
  adventure: "৳3,500–7,000",
  beach: "৳2,500–6,000",
  culture: "৳1,000–3,000",
  wildlife: "৳2,500–5,500",
};

const defaultBest: Record<Category, string> = {
  nature: "Oct–Mar",
  history: "Nov–Feb",
  food: "Year-round",
  adventure: "Nov–Feb",
  beach: "Nov–Mar",
  culture: "Nov–Mar",
  wildlife: "Nov–Mar",
};

const defaultTodo: Record<Category, string[]> = {
  nature: ["Walk the main trail early in the morning", "Photograph the light at golden hour", "Pick up local snacks from nearby stalls"],
  history: ["Hire a local guide for the backstory", "Visit the on-site museum or information board", "Combine with a nearby heritage site"],
  food: ["Go hungry and order the signature dishes", "Ask the vendor what is freshest today"],
  adventure: ["Check conditions with local guides first", "Start early to beat the heat", "Carry water and a rain layer"],
  beach: ["Watch the sunset from the shoreline", "Try fresh seafood from the beachside stalls", "Take a long barefoot walk at low tide"],
  culture: ["Join a local celebration if one is on", "Browse handicrafts directly from artisans", "Chat with residents about the area's stories"],
  wildlife: ["Go at dawn or dusk for the best sightings", "Move quietly and keep your distance", "Hire a licensed forest guide"],
};

const catMap: Record<string, Category> = {
  n: "nature", h: "history", f: "food", a: "adventure", b: "beach", c: "culture", w: "wildlife",
};

function p(district: string, name: string, cats: string, rating: number, blurb: string, o: Extra = {}): Place {
  const c = centers.get(district);
  if (!c) throw new Error(`Unknown district ${district}`);
  const categories = cats.split("").map((k) => catMap[k]);
  const j = hash(name);
  const lat = o.ll?.[0] ?? c.lat + (((j % 200) - 100) / 100) * 0.12;
  const lng = o.ll?.[1] ?? c.lng + ((((j >> 8) % 200) - 100) / 100) * 0.12;
  const primary = categories[0];
  return {
    id: `${district}--${slugify(name)}`,
    districtSlug: district,
    name,
    categories,
    styles: o.tags ?? defaultTags[primary],
    rating,
    blurb,
    bestTime: o.best ?? defaultBest[primary],
    budget: o.budget ?? defaultBudget[primary],
    lat,
    lng,
    hidden: o.hidden ?? false,
    exact: !!o.ll,
    thingsToDo: o.todo ?? defaultTodo[primary],
  };
}

export const places: Place[] = [
  // Dhaka
  p("dhaka", "Lalbagh Fort", "h", 4.5, "A 17th-century Mughal fort complex with a tomb, mosque and quiet gardens in the heart of Old Dhaka.", { ll: [23.7189, 90.3881], tags: ["family", "photography", "budget"], budget: "৳300–1,200", todo: ["Walk the garden pathways and the Pari Bibi tomb", "Visit the museum in the Diwan-i-Aam", "Eat bakarkhani in Old Dhaka afterwards"] }),
  p("dhaka", "Ahsan Manzil", "h", 4.6, "The pink riverside palace of the Nawabs of Dhaka, now a museum on the Buriganga.", { ll: [23.7086, 90.4063], tags: ["family", "photography", "solo"], budget: "৳300–1,000", todo: ["Tour the restored rooms and dome", "Take a boat ride on the Buriganga", "Walk through Shankhari Bazar nearby"] }),
  p("dhaka", "Hatirjheel", "nc", 4.4, "A lakeside promenade and bridge system in central Dhaka, lit up beautifully at night.", { ll: [23.7497, 90.4004], tags: ["family", "couple", "photography"], best: "Evening, Oct–Mar", budget: "৳200–1,000", todo: ["Take a boat across the lake", "Walk the promenade at dusk", "Photograph the illuminated bridges"] }),
  p("dhaka", "Old Dhaka Food Walk", "fc", 4.7, "Chawkbazar and Nazira Bazar's lanes serve legendary bakarkhani, kebab and biryani.", { ll: [23.7156, 90.4], tags: ["solo", "budget", "photography"], best: "Evenings", budget: "৳500–1,500", hidden: false, todo: ["Try Haji Biryani and kebab at Chawkbazar", "Buy bakarkhani from a bakery", "Sip lassi in Nazira Bazar"] }),
  p("dhaka", "National Parliament House", "hc", 4.6, "Louis Kahn's monumental concrete landmark, a world-renowned modern building.", { ll: [23.7625, 90.3782], tags: ["photography", "solo", "family"], budget: "Free entry (guided tours by request)" }),
  p("dhaka", "Armenian Church", "h", 4.2, "A small 18th-century church in Armanitola, quiet and photogenic.", { ll: [23.7172, 90.4023], hidden: true, tags: ["solo", "photography", "budget"], budget: "Free" }),

  p("gazipur", "Bhawal National Park", "nw", 4.2, "Sal forest reserve with walking trails 40 km from Dhaka.", { ll: [24.0678, 90.3697], tags: ["family", "budget", "photography"], budget: "৳600–1,500" }),
  p("gazipur", "Bangabandhu Safari Park", "w", 4.1, "A drive-through safari park with deer, tigers and lions.", { ll: [24.0987, 90.3957], tags: ["family"], budget: "৳700–1,800" }),
  p("gazipur", "Nuhash Polli", "nc", 4.0, "A themed resort park with lakeside cottages and gardens.", { tags: ["family", "couple"], budget: "৳2,500–6,000" }),

  p("narayanganj", "Panam Nagar (Sonargaon)", "h", 4.5, "A dilapidated 19th-century merchant town that was once the Sultanate's capital. One of the most atmospheric heritage sites near Dhaka.", { ll: [23.6573, 90.5921], tags: ["photography", "solo", "family"], budget: "৳300–1,000" }),
  p("narayanganj", "Folk Art and Crafts Museum", "c", 4.2, "Housed in Sardar Bari in Sonargaon, a museum of Bengali folk arts and crafts.", { ll: [23.6419, 90.6034], tags: ["family", "solo"], budget: "৳200–600" }),
  p("narayanganj", "Goaldi Mosque", "h", 4.1, "A Sultanate-era mosque in Sonargaon.", { hidden: true, tags: ["solo", "photography"], budget: "Free" }),

  p("narsingdi", "Shibpur Weavers' Villages", "c", 4.0, "Handloom villages known for woven fabrics.", { tags: ["solo", "photography", "budget"], hidden: true }),
  p("narsingdi", "Meghna River Banks", "n", 4.0, "A wide, quiet river stretch with sandy banks.", { hidden: true }),

  p("manikganj", "Padma and Jamuna Char Villages", "n", 4.0, "Sandbar villages that appear and disappear with the seasons.", { hidden: true, tags: ["photography", "solo", "budget"] }),
  p("manikganj", "Baliati Palace", "h", 4.1, "A Zamindar-era palace in Saturia.", { ll: [23.8869, 90.0431], hidden: true, tags: ["photography", "solo"] }),

  p("munshiganj", "Padma Bridge (Mawa side)", "ac", 4.7, "The nation's largest bridge spans the Padma, with food stalls and views on the Mawa riverbank.", { ll: [23.4663, 90.2724], tags: ["family", "couple", "photography"], budget: "৳500–2,000" }),
  p("munshiganj", "Idrakpur Fort", "h", 4.2, "A 17th-century Mughal river fort in the Dhaleshwari-Meghna network.", { ll: [23.5465, 90.5156], hidden: true, tags: ["solo", "photography", "budget"] }),
  p("munshiganj", "Bikrampur's Atish Dipankar's Birthplace", "hc", 4.1, "The ancient Bikrampur is the birthplace of the Buddhist scholar Atish Dipankar.", { hidden: true, tags: ["solo", "budget"] }),

  p("tangail", "Madhupur National Park", "nw", 4.3, "A sal forest park with Garo (Mandi) villages.", { ll: [24.6329, 90.0842], tags: ["family", "photography", "solo"], budget: "৳1,000–2,500" }),
  p("tangail", "Atia Mosque", "h", 4.3, "A 1609 Mughal-era mosque.", { ll: [24.2486, 89.9236], tags: ["photography", "solo", "family"], budget: "Free" }),
  p("tangail", "Porabari Sweet Shops", "f", 4.5, "Birthplace of the famous Porabari chomchom.", { ll: [24.2562, 89.9298], tags: ["budget", "solo", "family"], budget: "৳300–800" }),

  p("kishoreganj", "Nikli Haor", "n", 4.3, "A seasonal wetland with boat trips in the monsoon.", { ll: [24.3016, 90.9421], tags: ["photography", "couple", "solo"], best: "Jul–Oct", budget: "৳1,500–3,500" }),
  p("kishoreganj", "Sholakia Eidgah", "c", 4.0, "One of the largest Eid prayer grounds in the country.", { ll: [24.4402, 90.7806], hidden: true, tags: ["solo", "family"] }),

  p("faridpur", "Kanaipur Zamindar Bari", "h", 4.0, "A historic zamindar complex in Faridpur.", { hidden: true, tags: ["photography", "solo"] }),
  p("faridpur", "Padma Riverbank at Charbhadrasan", "n", 4.0, "Wide sandy river banks where fishermen pull their nets at dusk.", { hidden: true }),

  p("gopalganj", "Tungipara Mausoleum Complex", "hc", 4.5, "The final resting place of Sheikh Mujibur Rahman.", { ll: [22.9066, 89.9031], tags: ["family", "solo", "photography"], budget: "Free" }),
  p("gopalganj", "Madhumati River", "n", 4.0, "A calm river with village landing stages.", { hidden: true }),

  p("madaripur", "Shakuni Lake", "n", 4.0, "A lake in Madaripur town with walking paths.", { tags: ["family", "couple", "budget"] }),
  p("rajbari", "Goalanda Ghat", "ac", 4.2, "A historic ferry ghat where the Padma and Jamuna merge.", { ll: [23.7415, 89.7788], tags: ["photography", "solo", "budget"] }),
  p("shariatpur", "Padma Bridge (Zajira side)", "a", 4.5, "The south landing of the Padma Bridge.", { ll: [23.4521, 90.2634], tags: ["family", "couple", "photography"] }),

  // Chattogram
  p("chattogram", "Patenga Sea Beach", "b", 4.1, "The city's beach at the Karnaphuli river mouth.", { ll: [22.2352, 91.7992], tags: ["family", "budget", "couple"], best: "Evenings, Nov–Mar" }),
  p("chattogram", "Foy's Lake", "nc", 4.3, "A hillside lake with an amusement park and walking paths.", { ll: [22.3626, 91.7969], tags: ["family", "couple", "photography"], budget: "৳500–2,000" }),
  p("chattogram", "Sitakunda Eco Park & Chandranath Hill", "na", 4.4, "Forested hills with hilltop temples and waterfalls near the sea.", { ll: [22.6141, 91.6636], tags: ["solo", "photography", "budget"], budget: "৳500–1,500", todo: ["Climb to the Chandranath Temple", "Visit Suptadhara waterfall in the monsoon"] }),
  p("chattogram", "Batali Hill", "nc", 4.0, "A city hilltop with views across Chattogram.", { ll: [22.3586, 91.8222], tags: ["couple", "photography", "budget"] }),
  p("chattogram", "Parki Sea Beach", "b", 4.3, "A long, quieter beach across the river in Anwara.", { ll: [22.2326, 91.8176], tags: ["family", "couple", "photography"], hidden: true }),
  p("chattogram", "Chittagong War Cemetery", "h", 4.4, "A calm, beautifully kept Commonwealth cemetery.", { ll: [22.3633, 91.8171], tags: ["solo", "photography"], budget: "Free" }),

  p("coxs-bazar", "Cox's Bazar Beach", "b", 4.7, "The world's longest unbroken natural sea beach: a 120 km sweep of sand along the Bay of Bengal.", { ll: [21.4272, 91.9786], tags: ["family", "couple", "budget"], best: "Nov–Mar", budget: "৳3,000–8,000", todo: ["Walk the Laboni beach at sunset", "Try fresh seafood at the beachside stalls", "Watch the sun set from the Himchari road"] }),
  p("coxs-bazar", "Inani Beach", "b", 4.6, "A wide beach with coral-stone rocks, quieter than the main strip.", { ll: [21.2269, 92.0239], tags: ["couple", "photography", "family"], best: "Nov–Mar", budget: "৳2,500–6,000" }),
  p("coxs-bazar", "Himchari", "nb", 4.4, "Waterfall and viewpoint on the Marine Drive.", { ll: [21.3703, 92.0089], tags: ["couple", "photography", "family"], todo: ["Climb up to the Himchari falls", "Watch waves hit the Marine Drive cliffs"] }),
  p("coxs-bazar", "Maheshkhali Island", "nc", 4.3, "A hilly island with the Adinath Temple and betel-leaf farms.", { ll: [21.5167, 91.9333], tags: ["solo", "photography", "budget"], budget: "৳1,500–3,500" }),
  p("coxs-bazar", "Saint Martin's Island", "bn", 4.8, "Bangladesh's only coral island, with turquoise water and a relaxed pace.", { ll: [20.6276, 92.3225], tags: ["couple", "photography", "family"], best: "Nov–Feb", budget: "৳6,000–15,000", todo: ["Snorkel at Chera Dwip", "Watch the sunrise from the east shore", "Eat fresh lobster"] }),
  p("coxs-bazar", "Sonadia Island", "nw", 4.1, "A protected uninhabited island and mangrove ecosystem.", { ll: [21.4833, 91.8667], tags: ["photography", "solo"], hidden: true }),
  p("coxs-bazar", "Ramu Buddhist Temples", "hc", 4.0, "Century-old Buddhist temples with Burmese-style architecture.", { ll: [21.4274, 92.0446], tags: ["solo", "photography", "family"], hidden: true, budget: "Free" }),
  p("coxs-bazar", "Teknaf Peninsula", "n", 4.3, "The southernmost tip of Bangladesh at the Myanmar border.", { ll: [20.8667, 92.3], tags: ["solo", "photography"], hidden: true }),

  p("bandarban", "Nilgiri Hills", "na", 4.7, "A 2,200-ft peak resort known for sea-of-clouds sunrises.", { ll: [21.8889, 92.3792], tags: ["couple", "photography", "family"], best: "Nov–Feb", budget: "৳4,000–10,000" }),
  p("bandarban", "Boga Lake", "na", 4.6, "A high-altitude natural lake reached by a trek.", { ll: [21.9917, 92.4833], tags: ["solo", "photography"], best: "Nov–Mar", budget: "৳4,000–8,000", todo: ["Hike with a local guide", "Camp overnight by the lake"] }),
  p("bandarban", "Nafakhum Waterfall", "n", 4.5, "A wide, powerful falls on the Remakri river.", { ll: [21.4217, 92.5], tags: ["photography", "solo"], best: "Jul–Oct", budget: "৳3,500–7,000" }),
  p("bandarban", "Golden Temple (Buddha Dhatu Jadi)", "hc", 4.4, "A hilltop Buddhist temple with gilded Buddha statues.", { ll: [22.1647, 92.1856], tags: ["family", "solo", "photography"] }),
  p("bandarban", "Chimbuk Hill", "na", 4.4, "A hilltop viewpoint with sweeping valley views.", { ll: [22.0717, 92.2667], tags: ["photography", "solo", "couple"] }),
  p("bandarban", "Shoilo Propat", "n", 4.0, "A tiered waterfall on the way to the hill villages.", { ll: [22.1869, 92.2269], hidden: true }),

  p("rangamati", "Kaptai Lake", "nc", 4.6, "Bangladesh's largest man-made lake, with island-dotted boat rides.", { ll: [22.4967, 92.2], tags: ["family", "couple", "photography"], budget: "৳2,500–6,000" }),
  p("rangamati", "Hanging Bridge", "nc", 4.4, "A suspension bridge over Kaptai Lake, Rangamati's icon.", { ll: [22.6592, 92.1768], tags: ["family", "photography", "budget"] }),
  p("rangamati", "Sajek Valley", "na", 4.8, "A hilltop valley of cloud-level cottages and Lushai, Pangkhua and Chakma villages.", { ll: [23.3794, 92.2933], tags: ["couple", "photography", "family"], best: "Jun–Feb", budget: "৳4,000–9,000", todo: ["Watch the sunrise above the clouds", "Visit Konglak Para village", "Try bamboo chicken"] }),
  p("rangamati", "Shuvolong Falls", "n", 4.3, "A waterfall on the Kaptai Lake approach.", { ll: [22.5167, 92.2833], tags: ["photography", "family"], hidden: true }),
  p("rangamati", "Rajban Vihara", "hc", 4.1, "A Buddhist monastery with a major shrine.", { ll: [22.6317, 92.1944], tags: ["solo", "photography"] }),
  p("rangamati", "Tribal Cultural Institute Museum", "c", 4.1, "A small museum on the cultures of the hill communities.", { ll: [22.6475, 92.1833], tags: ["family", "solo", "budget"], budget: "৳100–400" }),

  p("khagrachhari", "Alutila Cave", "na", 4.2, "A mysterious dark cave said to stretch kilometres.", { ll: [23.1175, 91.9728], tags: ["solo", "photography"] }),
  p("khagrachhari", "Richhang Waterfall", "n", 4.3, "A seasonal waterfall in the Chittagong Hill Tracts.", { ll: [23.0486, 91.9486], hidden: true, tags: ["photography", "solo"] }),
  p("khagrachhari", "Nunchari Hills", "na", 4.0, "Hill viewpoints with views over the plain.", { hidden: true }),

  p("feni", "Muhuri Project", "nc", 4.0, "A flood-control dam and sluice-gate system across the Muhuri river.", { ll: [23.0369, 91.3817], tags: ["family", "photography", "budget"] }),
  p("noakhali", "Nijhum Dwip", "nw", 4.6, "An island of deer, mangroves and sandy tidal flats.", { ll: [22.0833, 91.0167], tags: ["photography", "solo", "couple"], best: "Nov–Mar", budget: "৳3,500–7,000" }),
  p("noakhali", "Hatiya Island", "n", 4.1, "A big estuary island with Meghna views.", { ll: [22.3667, 91.1], hidden: true, tags: ["solo", "photography"] }),
  p("lakshmipur", "Char Alexander", "nb", 4.1, "A beach on a newly formed island at the Meghna estuary.", { ll: [22.6, 90.7], tags: ["photography", "solo", "budget"], hidden: true }),
  p("chandpur", "Meghna–Padma Confluence", "n", 4.3, "Where two great rivers meet, with wide water and big skies.", { ll: [23.2333, 90.65], tags: ["photography", "solo", "family"], budget: "৳500–1,500" }),
  p("chandpur", "Chandpur River Port", "c", 4.0, "A busy river launch terminal.", { ll: [23.2255, 90.6532], hidden: true }),

  p("cumilla", "Shalban Vihara", "h", 4.4, "An 8th-century Buddhist monastery at Mainamati with 115 cells.", { ll: [23.4283, 91.1411], tags: ["family", "solo", "photography"], budget: "৳300–800" }),
  p("cumilla", "Kotila Mura", "h", 4.3, "A Buddhist ruin site of three stupas on a hill.", { ll: [23.4333, 91.1], tags: ["photography", "solo"] }),
  p("cumilla", "Mainamati War Cemetery", "h", 4.1, "A peaceful Commonwealth war cemetery.", { ll: [23.4297, 91.1], hidden: true, tags: ["solo"], budget: "Free" }),
  p("cumilla", "Dharmasagar Dighi", "n", 4.0, "A large historic pond in Cumilla town.", { ll: [23.4608, 91.18], tags: ["family", "budget"] }),

  p("brahmanbaria", "Titas River Banks", "n", 4.0, "A calm river famous in Bengali literature.", { hidden: true }),
  p("brahmanbaria", "Akhaura Railway Junction", "h", 4.0, "A historic railway junction with colonial-era buildings.", { ll: [23.8667, 91.2167], tags: ["solo", "photography", "budget"], hidden: true }),

  // Sylhet
  p("sylhet", "Ratargul Swamp Forest", "nwa", 4.8, "Bangladesh's only freshwater swamp forest, best explored by boat in the monsoon.", { ll: [25.0143, 91.9387], tags: ["photography", "couple", "solo"], best: "Jun–Oct", budget: "৳2,500–5,000", todo: ["Take a boat through the flooded trees", "Hire a local boatman for a guided trip", "Keep your camera dry"] }),
  p("sylhet", "Jaflong", "na", 4.5, "A border region with stone-collecting rivers, Khasi villages and views of the Meghalaya hills.", { ll: [25.1656, 92.0187], tags: ["family", "photography", "couple"], budget: "৳1,500–4,000" }),
  p("sylhet", "Bisnakandi", "n", 4.5, "A border village on the Pyain river, with clear water pouring from the Meghalaya hills.", { ll: [25.1583, 91.8097], tags: ["photography", "solo", "couple"], best: "Jun–Oct" }),
  p("sylhet", "Lalakhal", "n", 4.6, "A clear blue river stream with boat rides through Jaintiapur forests.", { ll: [25.1319, 92.0014], tags: ["photography", "couple", "family"], best: "Jul–Oct" }),
  p("sylhet", "Shah Jalal Dargah", "hc", 4.4, "The shrine of the 14th-century Sufi saint who shaped Sylhet.", { ll: [24.9049, 91.8706], tags: ["solo", "family"], budget: "Free" }),
  p("sylhet", "Malnicherra Tea Estate", "nc", 4.4, "Bangladesh's first commercial tea estate, in Sylhet city.", { ll: [24.9167, 91.8667], tags: ["family", "photography", "couple"], budget: "৳500–1,500" }),

  p("moulvibazar", "Lawachara National Park", "nw", 4.5, "A rainforest with hoolock gibbons and walking trails.", { ll: [24.3253, 91.7861], tags: ["family", "photography", "solo"], budget: "৳1,500–3,500" }),
  p("moulvibazar", "Madhabkunda Waterfall", "n", 4.5, "A multi-tiered waterfall, one of the largest in the country.", { ll: [24.5619, 92.0431], tags: ["family", "photography", "couple"] }),
  p("moulvibazar", "Srimangal Tea Gardens", "nc", 4.7, "Rolling tea estates with seven-layer tea tastings.", { ll: [24.3065, 91.7296], tags: ["couple", "photography", "family"], budget: "৳2,000–5,000" }),
  p("moulvibazar", "Baikka Beel", "nw", 4.3, "A freshwater wetland sanctuary with migratory birds.", { ll: [24.2833, 91.7833], tags: ["photography", "solo"], hidden: true, best: "Nov–Feb" }),
  p("moulvibazar", "Hum Hum Waterfall", "na", 4.4, "A remote falls reached via a forest trek.", { ll: [24.1, 92.0], hidden: true, tags: ["solo", "photography"], best: "Jul–Oct" }),

  p("habiganj", "Satchari National Park", "nw", 4.4, "A small rainforest park with hoolock gibbons and tea.", { ll: [24.1167, 91.4583], tags: ["family", "photography", "solo"] }),
  p("habiganj", "Raghunandan Hill", "n", 4.0, "A forested hill with trekking trails.", { hidden: true, tags: ["solo", "photography"] }),

  p("sunamganj", "Tanguar Haor", "nw", 4.6, "A Ramsar wetland of lakes and migratory birds.", { ll: [25.1667, 91.0], tags: ["photography", "solo", "couple"], best: "Jul–Oct, Dec–Feb", budget: "৳3,000–6,500" }),
  p("sunamganj", "Niladri Lake", "n", 4.3, "A blue lake in a former stone quarry.", { ll: [25.1319, 91.1], tags: ["photography", "couple"], hidden: true }),
  p("sunamganj", "Barek Tila", "n", 4.2, "A forested hillock rising from the haor.", { ll: [25.0333, 91.0833], hidden: true, tags: ["photography", "solo"] }),

  // Rajshahi
  p("rajshahi", "Puthia Temple Complex", "h", 4.5, "A cluster of terracotta temples from the 16th–19th centuries.", { ll: [24.3689, 88.8481], tags: ["family", "photography", "solo"] }),
  p("rajshahi", "Varendra Research Museum", "h", 4.2, "Bangladesh's oldest museum, with rare sculptures.", { ll: [24.3667, 88.6], tags: ["solo", "family"], budget: "৳100–400" }),
  p("rajshahi", "Padma Garden", "n", 4.0, "A riverside park on the Padma.", { ll: [24.3667, 88.6], tags: ["family", "couple", "budget"] }),
  p("rajshahi", "Bagha Mosque", "h", 4.2, "A 16th-century terracotta mosque.", { ll: [24.1667, 88.8], hidden: true, tags: ["photography", "solo"] }),

  p("natore", "Natore Rajbari (Uttara Ganabhaban)", "h", 4.3, "A palace complex of the Natore Maharajas.", { ll: [24.4167, 88.9833], tags: ["family", "solo", "photography"] }),
  p("natore", "Kacha Golla Shops", "f", 4.2, "Natore's best-known sweet, sold across town.", { tags: ["budget", "solo", "family"], budget: "৳200–600" }),

  p("chapai-nawabganj", "Choto Sona Mosque", "h", 4.4, "A 15th-century mosque in Gour with golden-era decoration.", { ll: [24.8, 88.1], tags: ["photography", "solo"] }),
  p("chapai-nawabganj", "Mango Orchards", "nf", 4.3, "Orchards of Langra and Fazli mangoes at harvest.", { tags: ["family", "photography", "solo"], best: "May–Jul" }),

  p("naogaon", "Paharpur Buddhist Vihara (Somapura Mahavihara)", "h", 4.7, "A UNESCO World Heritage Site, the largest known Buddhist monastery south of the Himalayas.", { ll: [25.0311, 88.9764], tags: ["family", "photography", "solo"], budget: "৳300–1,000" }),
  p("naogaon", "Kusumba Mosque", "h", 4.2, "A 16th-century mosque in black stone.", { ll: [24.9, 88.9], hidden: true, tags: ["photography", "solo"] }),

  p("pabna", "Hardinge Bridge", "h", 4.2, "A century-old railway bridge over the Padma.", { ll: [24.0731, 89.0331], tags: ["photography", "solo", "budget"] }),
  p("pabna", "Lalon Shah Bridge", "c", 4.2, "A modern road-and-rail bridge over the Padma.", { ll: [24.0739, 89.0331], tags: ["photography", "family"] }),

  p("bogura", "Mahasthangarh", "h", 4.5, "The ruins of ancient Pundranagar, among Bangladesh's oldest cities.", { ll: [24.9672, 89.3453], tags: ["family", "solo", "photography"], budget: "৳300–1,000" }),
  p("bogura", "Behular Basar Ghar", "h", 4.0, "A site linked to the Behula folk legend.", { ll: [24.9, 89.3], hidden: true, tags: ["solo", "photography"] }),
  p("bogura", "Bogura Doi Shops", "f", 4.7, "The classic clay-pot sweet yogurt.", { tags: ["budget", "solo", "family"], budget: "৳200–600" }),

  p("joypurhat", "Joypurhat Farmland Villages", "n", 4.0, "A quiet agricultural landscape.", { hidden: true, tags: ["solo", "photography", "budget"] }),
  p("sirajganj", "Bangabandhu Jamuna Bridge", "ac", 4.4, "Bangladesh's longest bridge, linking east and west.", { ll: [24.3997, 89.7414], tags: ["photography", "family", "solo"] }),
  p("sirajganj", "Rabindra Kachari Bari (Shahzadpur)", "hc", 4.4, "Rabindranath Tagore's estate house on the Padma.", { ll: [24.2236, 89.5953], tags: ["family", "solo", "photography"] }),

  // Khulna
  p("khulna", "Sundarbans Boat Tours", "nw", 4.6, "Khulna is the starting point for multi-day boat trips into the world's largest mangrove forest.", { ll: [22.8156, 89.5667], tags: ["family", "photography", "solo"], best: "Nov–Feb", budget: "৳5,000–12,000" }),
  p("khulna", "Rupsha River Banks", "n", 4.0, "A riverfront promenade.", { hidden: true }),
  p("bagerhat", "Sixty Dome Mosque", "h", 4.6, "A 15th-century mosque and UNESCO site.", { ll: [22.6742, 89.7439], tags: ["family", "photography", "solo"], budget: "৳300–800" }),
  p("bagerhat", "Karamjal Wildlife Centre", "nw", 4.2, "A Sundarbans-edge breeding centre for crocodiles and deer, reached from Mongla.", { ll: [22.2, 89.6], tags: ["family", "photography"] }),
  p("bagerhat", "Mongla Port & Sundarbans", "nw", 4.3, "A port at the edge of the Sundarbans.", { ll: [22.4833, 89.6], tags: ["solo", "photography"] }),
  p("bagerhat", "Khan Jahan Ali's Tomb", "h", 4.3, "The shrine of the 15th-century founder of Bagerhat.", { ll: [22.6667, 89.7667], tags: ["solo", "photography"] }),
  p("satkhira", "Sundarbans (Kaikhali)", "nw", 4.2, "A Sundarbans access point from the west.", { ll: [22.2, 89.2], hidden: true }),
  p("jashore", "Date-Palm Sap Farms", "fc", 4.2, "Winter sap collection villages.", { best: "Dec–Feb", hidden: true, tags: ["photography", "solo", "budget"] }),
  p("jhenaidah", "Date-Palm Jaggery Villages", "fc", 4.0, "Rural sap-and-jaggery making in winter.", { best: "Dec–Feb", hidden: true, tags: ["photography", "solo", "budget"] }),
  p("magura", "Nabaganga River", "n", 4.0, "A quiet river with village landings.", { hidden: true }),
  p("narail", "S. M. Sultan Museum", "c", 4.2, "A gallery for the painter S. M. Sultan.", { ll: [23.1667, 89.5], tags: ["solo", "photography", "budget"] }),
  p("narail", "Narail Zamindar Bari", "h", 4.0, "A zamindar-era complex in Narail.", { hidden: true }),
  p("chuadanga", "Mathabhanga River", "n", 4.0, "A river on the Indian border.", { hidden: true }),
  p("kushtia", "Lalon Akhra", "c", 4.4, "The shrine of the Baul saint Lalon Shah.", { ll: [23.8667, 89.1167], tags: ["solo", "photography", "family"] }),
  p("kushtia", "Shilaidaha Kuthibari", "hc", 4.4, "Rabindranath Tagore's riverside house.", { ll: [23.9, 89.15], tags: ["family", "solo", "photography"] }),
  p("meherpur", "Mujibnagar Memorial", "hc", 4.3, "The site of the first provisional government oath in 1971.", { ll: [23.6, 88.6], tags: ["family", "solo"], budget: "Free" }),

  // Barishal
  p("barishal", "Kirtankhola River", "n", 4.2, "A wide river that defines Barishal's riverfront and boat life.", { ll: [22.7, 90.37], tags: ["photography", "family", "couple"] }),
  p("barishal", "Durga Sagar", "n", 4.1, "A large historic pond in Babuganj.", { hidden: true }),
  p("bhola", "Char Kukri-Mukri", "nw", 4.2, "A wild island of birds and mangroves.", { ll: [22.2, 90.6], tags: ["photography", "solo"], hidden: true }),
  p("barguna", "Sonakata Mangrove Forest", "nw", 4.1, "A coastal mangrove stretch.", { hidden: true, tags: ["photography", "solo"] }),
  p("jhalakathi", "Floating Guava Market (Bhimruli)", "fc", 4.5, "A famous floating guava market on canals.", { best: "Jul–Sep", tags: ["photography", "family", "solo"] }),
  p("patuakhali", "Kuakata Sea Beach", "b", 4.6, "A beach where you can watch both sunrise and sunset over the sea.", { ll: [21.8167, 90.1167], tags: ["family", "couple", "photography"], budget: "৳2,500–6,000" }),
  p("patuakhali", "Fatrar Char", "nb", 4.1, "A mangrove-forested island.", { hidden: true }),
  p("pirojpur", "Floating Markets of Pirojpur", "fc", 4.2, "Boats full of produce on the canal.", { tags: ["photography", "solo"], hidden: true }),

  // Rangpur
  p("rangpur", "Tajhat Palace", "h", 4.3, "A 19th-century zamindar palace.", { ll: [25.7339, 89.2447], tags: ["family", "photography", "solo"] }),
  p("rangpur", "Teesta Barrage", "n", 4.0, "A barrage on the Teesta.", { ll: [26.1833, 89.0333], tags: ["photography", "family"] }),
  p("dinajpur", "Kantaji Temple", "h", 4.6, "A stunning terracotta temple from 1752.", { ll: [25.7833, 88.6167], tags: ["family", "photography", "solo"] }),
  p("dinajpur", "Ramsagar National Park", "nw", 4.0, "A large lake in a national park.", { ll: [25.5667, 88.6333], tags: ["family", "couple"] }),
  p("thakurgaon", "Tea Gardens of Thakurgaon", "n", 4.0, "A tea-growing region at the Indian border.", { tags: ["photography", "solo"], hidden: true }),
  p("panchagarh", "Tetulia Tea Gardens", "n", 4.3, "Tea gardens with Kanchenjunga views on clear days.", { ll: [26.35, 88.55], tags: ["photography", "couple", "solo"], hidden: true }),
  p("panchagarh", "Banglabandha Land Port", "c", 4.0, "The border post at Bangladesh's northernmost point.", { ll: [26.5, 88.55], tags: ["solo", "photography"] }),
  p("nilphamari", "Teesta River Banks", "n", 4.1, "Sandy banks and char islands.", { tags: ["photography", "solo"], hidden: true }),
  p("lalmonirhat", "Teesta Chars", "n", 4.0, "Sandbars in the Teesta.", { tags: ["photography", "solo"], hidden: true }),
  p("kurigram", "Brahmaputra Chars", "n", 4.0, "A landscape of shifting sandbars.", { tags: ["photography", "solo"], hidden: true }),
  p("gaibandha", "Brahmaputra Riverbank", "n", 4.0, "Vast riverbanks and char villages.", { tags: ["photography", "solo"], hidden: true }),

  // Mymensingh
  p("mymensingh", "Shashi Lodge", "hc", 4.1, "A historic mansion on the Brahmaputra.", { ll: [24.7539, 90.4], tags: ["photography", "family", "solo"] }),
  p("mymensingh", "Zainul Abedin Museum", "c", 4.2, "A museum honouring the painter Zainul Abedin.", { ll: [24.7425, 90.4208], tags: ["family", "solo"] }),
  p("jamalpur", "Jamuna Riverfront", "n", 4.0, "A wide river with char islands.", { hidden: true }),
  p("netrakona", "Garo Hills Border Villages", "nc", 4.2, "Border villages near the Garo hills.", { hidden: true, tags: ["photography", "solo"] }),
  p("netrakona", "Dhanu River Haors", "n", 4.1, "A haor landscape along the Dhanu river.", { hidden: true }),
  p("sherpur", "Garo Hills Foothills", "nc", 4.1, "Foothill villages near the Meghalaya border.", { hidden: true, tags: ["photography", "solo"] }),

  // ── More places ──
  p("dhaka", "Star Mosque (Tara Masjid)", "hc", 4.4, "An early 20th-century mosque in Armanitola, decorated with mosaic stars of broken china tile.", { ll: [23.7144, 90.4067], tags: ["photography", "solo", "family"], budget: "Free" }),
  p("dhaka", "Dhakeshwari National Temple", "hc", 4.2, "Dhaka's most important Hindu temple, said to give the city its name.", { ll: [23.7231, 90.3853], tags: ["family", "solo"], budget: "Free" }),
  p("dhaka", "Bangladesh National Museum", "hc", 4.3, "The country's largest museum, covering natural history, art, and the Liberation War.", { ll: [23.7385, 90.3955], tags: ["family", "solo"], budget: "৳100–400" }),
  p("dhaka", "Sadarghat River Terminal", "c", 4.3, "Dhaka's busy Buriganga river port, with wooden boats and launches leaving for the south.", { ll: [23.7075, 90.4081], tags: ["photography", "solo", "budget"], budget: "Free–৳300" }),
  p("dhaka", "Curzon Hall", "h", 4.2, "A red-brick Indo-Saracenic building from 1904, now part of Dhaka University.", { ll: [23.7283, 90.4014], tags: ["photography", "solo", "budget"], budget: "Free" }),
  p("dhaka", "National Martyrs' Memorial (Savar)", "h", 4.4, "A tall, folded memorial to the 1971 Liberation War dead, set in parkland at Savar.", { ll: [23.9098, 90.2593], tags: ["family", "photography", "solo"], budget: "Free" }),
  p("dhaka", "Ramna Park", "n", 4.1, "A large green space in central Dhaka, popular for morning walks.", { ll: [23.7389, 90.4008], tags: ["family", "budget", "solo"], budget: "Free" }),
  p("gazipur", "Rajendrapur National Park", "nw", 4.0, "A sal-forest national park with walking trails and picnic spots.", { ll: [24.0833, 90.4], tags: ["family", "budget", "photography"], budget: "৳300–1,000" }),
  p("gazipur", "Joydebpur Rajbari", "h", 3.9, "The old Bhawal estate palace in Joydebpur.", { ll: [24.0, 90.42], hidden: true, tags: ["solo", "photography", "budget"] }),
  p("narayanganj", "Sonakanda Fort", "h", 4.1, "A Mughal-era river fort on the Shitalakshya, built to guard the approach to Dhaka.", { ll: [23.6118, 90.5063], tags: ["photography", "solo", "family"], budget: "Free" }),
  p("narayanganj", "Hajiganj Fort", "h", 4.0, "A Mughal river fort across the Shitalakshya from Sonakanda.", { ll: [23.6021, 90.5088], hidden: true, tags: ["photography", "solo"], budget: "Free" }),
  p("narayanganj", "Bandar Shah Suja Mosque", "h", 3.9, "A Mughal-era mosque in the old river port of Bandar.", { hidden: true, tags: ["solo", "photography"], budget: "Free" }),
  p("narsingdi", "Wari-Bateshwar", "h", 4.2, "Excavated remains of an ancient fortified trading settlement, thought to date back over two thousand years.", { ll: [24.0833, 90.7833], tags: ["solo", "family", "budget"], budget: "Free" }),
  p("manikganj", "Tewta Zamindar Bari", "h", 4.0, "A large 19th-century zamindar mansion in Tewta village.", { ll: [23.7956, 90.1297], hidden: true, tags: ["photography", "solo"] }),
  p("manikganj", "Aricha Ghat", "c", 4.0, "A major ferry terminal on the Jamuna, with riverside tea stalls and sunsets.", { ll: [23.9, 89.85], tags: ["photography", "solo", "budget"] }),
  p("munshiganj", "Bajrayogini Village", "hc", 4.0, "The ancient village associated with the Buddhist scholar Atish Dipankar.", { ll: [23.5667, 90.4667], hidden: true, tags: ["solo", "budget"] }),
  p("munshiganj", "Sonarang Jora Math", "h", 3.9, "A pair of old temples (maths) at Sonarang village.", { hidden: true, tags: ["photography", "solo"] }),
  p("tangail", "Karatia Zamindar Bari", "h", 4.1, "A grand zamindar palace at Karatia, with large gardens.", { ll: [24.2, 89.9], tags: ["photography", "family", "solo"] }),
  p("tangail", "Tangail Saree Weaving Villages", "c", 4.2, "Handloom villages that make Tangail's famed cotton and silk sarees.", { tags: ["photography", "solo", "budget"], hidden: true }),
  p("kishoreganj", "Pagla Mosque", "h", 4.0, "A 17th-century Mughal-era mosque in Kishoreganj.", { ll: [24.4333, 90.7833], hidden: true, tags: ["photography", "solo"], budget: "Free" }),
  p("kishoreganj", "Bhairab Bridge", "n", 4.0, "A long railway bridge over the Meghna at Bhairab.", { ll: [24.0522, 90.9786], tags: ["photography", "solo", "budget"] }),
  p("kishoreganj", "Jangalbari Fort", "h", 3.9, "A ruined Isha Khan-era fort in Hossainpur.", { hidden: true, tags: ["solo", "photography"] }),
  p("faridpur", "Rajendra College", "h", 3.9, "A historic college in Faridpur town.", { tags: ["solo", "photography", "budget"] }),
  p("faridpur", "Goalchamot Ghat", "c", 3.9, "A busy Padma-side river landing.", { hidden: true, tags: ["photography", "solo", "budget"] }),
  p("gopalganj", "Orakandi Thakur Bari", "hc", 4.1, "A pilgrimage site of the Matua community, centred on Harichand Thakur's birthplace.", { ll: [22.9, 89.8333], tags: ["solo", "family", "photography"], budget: "Free" }),
  p("madaripur", "Arial Khan River", "n", 3.9, "A broad delta river with ferry crossings and village landings.", { hidden: true }),
  p("rajbari", "Daulatdia Ghat", "c", 3.9, "A ferry ghat at the Padma, with bustling river trade.", { ll: [23.7667, 89.7333], hidden: true, tags: ["photography", "solo", "budget"] }),
  p("shariatpur", "Naria Padma Riverbank", "n", 3.9, "A wide sandy riverbank and char landscape on the Padma.", { hidden: true, tags: ["photography", "solo"] }),

  p("chattogram", "Bayazid Bostami Shrine", "hc", 4.2, "A revered Sufi shrine with a famous turtle pond.", { ll: [22.3892, 91.8156], tags: ["family", "solo", "photography"], budget: "Free" }),
  p("chattogram", "Ethnological Museum", "c", 4.1, "A museum of the cultures of the Chittagong Hill Tracts communities.", { ll: [22.3556, 91.8153], tags: ["family", "solo", "budget"], budget: "৳100–300" }),
  p("chattogram", "Fouzdarhat Sea Beach", "b", 4.0, "A beach north of the city, quieter than Patenga.", { ll: [22.4333, 91.7333], hidden: true, tags: ["family", "couple", "budget"] }),
  p("chattogram", "Karnaphuli River Waterfront", "nc", 4.1, "Boat rides and sunset views across the Karnaphuli, past ships and sampans.", { ll: [22.3135, 91.8], tags: ["photography", "couple", "budget"] }),
  p("coxs-bazar", "Laboni Beach", "b", 4.3, "The main, most lively stretch of the long Cox's Bazar beach.", { ll: [21.4333, 91.9744], tags: ["family", "budget", "couple"] }),
  p("coxs-bazar", "Aggmeda Khyang", "hc", 4.1, "A historic Buddhist monastery with Burmese-style architecture.", { ll: [21.4478, 91.9767], tags: ["solo", "family", "photography"], budget: "Free" }),
  p("coxs-bazar", "Burmese Market", "c", 4.0, "A bazaar selling Burmese shawls, longyis and dried goods.", { ll: [21.4381, 91.9792], tags: ["solo", "budget", "photography"], budget: "৳300–2,000" }),
  p("coxs-bazar", "Dulahazara Safari Park", "w", 4.0, "A safari park with elephants, deer and lions.", { ll: [21.6667, 92.0333], tags: ["family"], budget: "৳500–1,500" }),
  p("coxs-bazar", "Marine Drive Road", "an", 4.5, "A scenic road running along the shore from Cox's Bazar to Teknaf, between hills and sea.", { ll: [21.3, 92.0], tags: ["couple", "photography", "solo"] }),
  p("bandarban", "Keokradang", "a", 4.5, "One of the highest peaks in Bangladesh, reached by a multi-day trek.", { ll: [21.9, 92.6], tags: ["solo", "photography"], best: "Nov–Feb", budget: "৳6,000–12,000" }),
  p("bandarban", "Tajingdong (Bijoy)", "a", 4.4, "A peak of the Bandarban hill ranges, popular with trekkers.", { ll: [21.7, 92.55], tags: ["solo", "photography"], hidden: true, best: "Nov–Feb" }),
  p("bandarban", "Amiakhum Waterfall", "n", 4.4, "A wide, thundering falls on the Sangu river region.", { ll: [21.4, 92.5], tags: ["photography", "solo"], best: "Jul–Oct", hidden: true }),
  p("bandarban", "Meghla Tourism Complex", "nc", 4.0, "A hilltop park with a hanging bridge and a view over the valley.", { ll: [22.1967, 92.2133], tags: ["family", "budget"] }),
  p("bandarban", "Sangu River Boat Trip", "na", 4.4, "A boat ride through the green gorge of the Sangu river.", { ll: [22.2, 92.2], tags: ["couple", "photography", "family"] }),
  p("rangamati", "Peda Ting Ting", "fc", 4.2, "A well-known lakeside restaurant serving hill-style food.", { ll: [22.6517, 92.1731], tags: ["family", "couple", "budget"] }),
  p("rangamati", "Kaptai National Park", "nw", 4.0, "A forest park near Kaptai with wildlife and nature trails.", { ll: [22.5, 92.2], tags: ["family", "photography", "solo"] }),
  p("rangamati", "Karnaphuli Hydroelectric Dam", "n", 4.0, "The dam that created Kaptai Lake.", { ll: [22.4833, 92.2167], tags: ["family", "photography", "budget"] }),
  p("rangamati", "Tabalchari", "nc", 4.0, "A village and lakeside beauty spot in Rangamati.", { hidden: true, tags: ["photography", "solo", "couple"] }),
  p("khagrachhari", "Hajachara Waterfall", "n", 4.1, "A forested waterfall in the Khagrachhari hills.", { ll: [23.05, 91.9], hidden: true, tags: ["photography", "solo"], best: "Jul–Oct" }),
  p("noakhali", "Gandhi Ashram Trust (Joyag)", "hc", 4.0, "A memorial to Mahatma Gandhi's 1946 peace mission in Noakhali.", { ll: [22.9, 91.1], tags: ["solo", "family", "budget"] }),
  p("lakshmipur", "Meghna Estuary Sunset", "n", 4.0, "A broad estuary where the Meghna meets the sea.", { hidden: true, tags: ["photography", "solo"] }),
  p("chandpur", "Dakatia River", "n", 3.9, "A calm river that meets the Meghna in the district.", { hidden: true }),
  p("cumilla", "Mainamati Museum", "h", 4.2, "A museum of artefacts excavated from the Mainamati ruins.", { ll: [23.4333, 91.1167], tags: ["family", "solo", "budget"], budget: "৳100–300" }),
  p("cumilla", "Rupban Mura", "h", 4.0, "A Buddhist monastery site in the Lalmai hills.", { ll: [23.4167, 91.1167], hidden: true, tags: ["photography", "solo"] }),
  p("cumilla", "Charpatra Mura", "h", 4.0, "An excavated Buddhist temple mound in Mainamati.", { ll: [23.4167, 91.1], hidden: true, tags: ["photography", "solo"] }),
  p("brahmanbaria", "Arifil Mosque (Sarail)", "h", 4.0, "A 17th-century mosque in Sarail.", { hidden: true, tags: ["photography", "solo"], budget: "Free" }),
  p("brahmanbaria", "Hatirpul", "h", 3.9, "A Mughal-era bridge built for elephant passage.", { hidden: true, tags: ["photography", "solo"], budget: "Free" }),
  p("brahmanbaria", "Kharampur Mazar Sharif", "hc", 4.0, "A mausoleum complex in Akhaura, a pilgrimage site.", { hidden: true, tags: ["solo", "family"], budget: "Free" }),

  p("sylhet", "Keane Bridge", "h", 4.2, "A 1936 iron bridge over the Surma, the symbol of Sylhet city.", { ll: [24.8967, 91.8667], tags: ["photography", "solo", "budget"], budget: "Free" }),
  p("sylhet", "Shah Paran Shrine", "hc", 4.1, "The shrine of a Sufi saint on a hill near Sylhet.", { ll: [24.9167, 91.9], tags: ["solo", "family"], budget: "Free" }),
  p("sylhet", "Osmani Museum", "h", 4.0, "A museum honouring General M. A. G. Osmani.", { ll: [24.9, 91.8667], tags: ["family", "solo", "budget"], budget: "৳50–200" }),
  p("sylhet", "Tamabil", "n", 4.2, "A border crossing and scenic viewpoint near Jaflong.", { ll: [25.1833, 92.0167], tags: ["photography", "family"] }),
  p("sylhet", "Pangthumai Waterfall", "n", 4.3, "A waterfall in Jaintiapur, reached in the monsoon.", { ll: [25.15, 92.07], hidden: true, tags: ["photography", "solo"], best: "Jun–Oct" }),
  p("sylhet", "Lakkatura Tea Estate", "nc", 4.1, "One of Sylhet's oldest tea estates, near the city.", { ll: [24.9, 91.9], tags: ["family", "photography", "couple"] }),
  p("moulvibazar", "Nilkantha Tea Cabin", "f", 4.5, "The tea stall that made seven-layer tea famous.", { ll: [24.3065, 91.7296], tags: ["family", "budget", "couple"], budget: "৳100–300" }),
  p("moulvibazar", "Khasia Punji", "c", 4.0, "A Khasi village in Srimangal with betel-leaf groves.", { hidden: true, tags: ["photography", "solo"] }),
  p("moulvibazar", "Rajkandi Reserve Forest", "nw", 4.0, "A rainforest reserve with hill trails.", { hidden: true, tags: ["solo", "photography"] }),
  p("habiganj", "Rema-Kalenga Wildlife Sanctuary", "nw", 4.2, "A forested wildlife sanctuary in Chunarughat.", { ll: [24.1, 91.6], tags: ["photography", "solo", "family"] }),
  p("habiganj", "Baniachong Village", "c", 3.9, "A large village area known for its traditional life.", { hidden: true, tags: ["solo", "photography"] }),
  p("sunamganj", "Jadukata River", "n", 4.2, "A clear river through the haor country, with rocky banks.", { ll: [25.1, 91.0], tags: ["photography", "couple", "solo"] }),
  p("sunamganj", "Tekerghat Stone Quarry", "n", 4.0, "A quarry landscape with blue pools near the Meghalaya border.", { ll: [25.2, 91.2], hidden: true, tags: ["photography", "solo"] }),
  p("sunamganj", "Shanir Haor", "nw", 4.1, "A large haor wetland with birds and fisherfolk.", { hidden: true, tags: ["photography", "solo"], best: "Jul–Oct" }),

  p("rajshahi", "Shah Makhdum Dargah", "hc", 4.1, "A shrine in Rajshahi city dedicated to a 13th-century Sufi saint.", { ll: [24.3667, 88.6], tags: ["solo", "family"], budget: "Free" }),
  p("rajshahi", "Rajshahi Silk Weaving", "c", 4.2, "The city's silk weavers' workshops and shops.", { tags: ["solo", "budget", "photography"], budget: "৳500–5,000" }),
  p("rajshahi", "Puthia Govinda Temple", "h", 4.5, "A ornate terracotta temple, 1823, in Puthia.", { ll: [24.3706, 88.8486], tags: ["photography", "family", "solo"] }),
  p("rajshahi", "Rajshahi University Campus", "n", 4.0, "A large, green campus with lakes and a small museum.", { ll: [24.3667, 88.6333], tags: ["family", "budget", "photography"], budget: "Free" }),
  p("natore", "Chalan Beel", "nw", 4.2, "A huge seasonal wetland shared by Natore, Pabna and Sirajganj.", { ll: [24.4, 89.1], tags: ["photography", "solo"], best: "Jul–Oct" }),
  p("natore", "Halti Beel", "nw", 4.0, "A wetland and bird habitat in Singra.", { hidden: true, tags: ["photography", "solo"], best: "Nov–Feb" }),
  p("chapai-nawabganj", "Kotwali Darwaza (Gaur)", "h", 4.1, "A medieval gateway in the ruins of Gaur.", { ll: [24.8667, 88.1333], tags: ["photography", "solo"], budget: "৳100–300" }),
  p("chapai-nawabganj", "Firoz Minar (Gaur)", "h", 4.1, "A five-storey tower from the Sultanate period.", { ll: [24.8667, 88.1333], tags: ["photography", "solo"], budget: "৳100–300" }),
  p("chapai-nawabganj", "Darasbari Mosque", "h", 4.1, "A 15th-century mosque near Gaur.", { ll: [24.8, 88.1], hidden: true, tags: ["photography", "solo"] }),
  p("naogaon", "Jagaddala Mahavihara", "h", 4.1, "Excavated ruins of a Pala-era Buddhist monastery.", { ll: [25.0833, 88.9667], hidden: true, tags: ["solo", "photography"] }),
  p("pabna", "Tarash Bhaban", "h", 3.9, "An old palace-style building in Pabna.", { hidden: true, tags: ["photography", "solo"] }),
  p("bogura", "Gokul Medh", "h", 4.1, "A large stepped mound near Mahasthangarh, tied to Behula folklore.", { ll: [24.97, 89.35], tags: ["photography", "solo", "family"] }),
  p("bogura", "Bhasu Bihar", "h", 4.1, "A Buddhist monastery ruin site near Mahasthangarh.", { ll: [24.98, 89.33], hidden: true, tags: ["photography", "solo"] }),
  p("bogura", "Kherua Mosque", "h", 4.1, "A 16th-century mosque at Sherpur, Bogura.", { ll: [24.97, 89.55], hidden: true, tags: ["photography", "solo"] }),
  p("joypurhat", "Tulshiganga River", "n", 3.9, "A small river that flows through the district.", { hidden: true }),
  p("sirajganj", "Chalan Beel (Tarash)", "nw", 4.0, "The Sirajganj side of the vast Chalan wetland.", { hidden: true, tags: ["photography", "solo"], best: "Jul–Oct" }),

  p("khulna", "Khan Jahan Ali Bridge", "c", 4.1, "A cable-stayed bridge over the Rupsha, linking Khulna and Bagerhat.", { ll: [22.8, 89.55], tags: ["photography", "family"] }),
  p("khulna", "Hiron Point (Nilkamal)", "nw", 4.5, "A Sundarbans wildlife viewpoint, famed for deer and tigers' tracks.", { ll: [21.8167, 89.4667], tags: ["photography", "solo", "family"], best: "Nov–Feb", budget: "৳6,000–14,000" }),
  p("bagerhat", "Nine Dome Mosque", "h", 4.3, "A 15th-century mosque in the Bagerhat Mosque City complex.", { ll: [22.6667, 89.7667], tags: ["photography", "solo", "family"] }),
  p("bagerhat", "Ronvijoypur Mosque", "h", 4.1, "A large single-dome mosque of the Bagerhat complex.", { ll: [22.65, 89.78], hidden: true, tags: ["photography", "solo"] }),
  p("bagerhat", "Zinda Pir Mosque", "h", 4.0, "A small mosque of the Khan Jahan Ali era.", { hidden: true, tags: ["photography", "solo"] }),
  p("bagerhat", "Katka (Kotka) Sundarbans Beach", "nw", 4.5, "A remote Sundarbans beach and forest, reached by boat.", { ll: [21.8333, 89.6], tags: ["photography", "solo", "couple"], best: "Nov–Feb", hidden: true, budget: "৳6,000–14,000" }),
  p("satkhira", "Jashoreshwari Temple", "hc", 4.1, "A historic temple at Ishwaripur, one of the Shakti Peethas.", { ll: [22.2, 89.1], tags: ["solo", "family", "photography"], budget: "Free" }),
  p("satkhira", "Mandarbaria Beach", "nb", 4.3, "A secluded Sundarbans beach near Shyamnagar.", { ll: [21.75, 89.05], hidden: true, tags: ["photography", "solo"], best: "Nov–Feb" }),
  p("jashore", "Sagardari (Madhusudan Dutt's Home)", "hc", 4.2, "The birthplace of the poet Michael Madhusudan Dutt.", { ll: [22.9, 89.2], tags: ["solo", "family", "photography"] }),
  p("jashore", "Benapole Land Port", "c", 3.9, "The busiest land border crossing with India.", { ll: [23.04, 88.87], hidden: true, tags: ["solo"] }),
  p("narail", "Chitra River", "n", 4.0, "A river flowing through the district's villages.", { hidden: true, tags: ["photography", "solo"] }),
  p("chuadanga", "Darshana Border", "c", 3.9, "A border town on the old rail route to Kolkata.", { hidden: true, tags: ["solo", "budget"] }),
  p("kushtia", "Gorai River", "n", 4.0, "A river and branch of the Ganges (Padma), with ferry crossings.", { hidden: true, tags: ["photography", "solo"] }),
  p("meherpur", "Amjhupi Neel Kuthi", "h", 4.0, "A ruined indigo planter's house.", { hidden: true, tags: ["photography", "solo"] }),
  p("meherpur", "Mujibnagar Mango Grove (Amrakanan)", "hn", 4.2, "The mango grove where the 1971 provisional government took oath.", { ll: [23.6, 88.6], tags: ["family", "solo", "photography"], budget: "Free" }),

  p("barishal", "Guthia Mosque", "h", 4.1, "A historic mosque in Guthia, Barishal.", { hidden: true, tags: ["photography", "solo"], budget: "Free" }),
  p("barishal", "Bibi Chini Mosque", "h", 4.0, "A mosque in Barishal town with a long local history.", { hidden: true, tags: ["photography", "solo"], budget: "Free" }),
  p("bhola", "Monpura Island", "nb", 4.3, "An estuary island with beaches and a peaceful pace.", { ll: [22.2833, 90.9667], hidden: true, tags: ["photography", "solo", "couple"] }),
  p("barguna", "Rakhine Villages (Taltali)", "c", 4.1, "Villages of the Rakhine community, with their own temples and crafts.", { hidden: true, tags: ["photography", "solo"] }),
  p("barguna", "Bishkhali River", "n", 4.0, "A tidal river lined with palms and boats.", { hidden: true, tags: ["photography", "solo"] }),
  p("jhalakathi", "Kirtipasha Zamindar Bari", "h", 4.0, "A historic zamindar house in Jhalakathi.", { hidden: true, tags: ["photography", "solo"] }),
  p("jhalakathi", "Sugandha River", "n", 4.0, "A canal-fed river central to the guava markets.", { hidden: true, tags: ["photography", "solo"] }),
  p("patuakhali", "Mohipur Beach", "b", 4.2, "A quieter beach near Kuakata, with a fishing village.", { ll: [21.9, 90.2], hidden: true, tags: ["photography", "solo", "couple"] }),
  p("patuakhali", "Rakhine Buddhist Temple (Kuakata)", "hc", 4.2, "A Buddhist temple and monastery of the Rakhine community.", { ll: [21.82, 90.12], tags: ["photography", "family", "solo"] }),
  p("patuakhali", "Lebur Char", "nb", 4.2, "A sandbar and mangrove spit near Kuakata.", { hidden: true, tags: ["photography", "solo"] }),
  p("pirojpur", "Sarsina Darbar Sharif", "hc", 4.0, "A large Sufi shrine complex at Nesarabad.", { hidden: true, tags: ["solo", "family"] }),

  p("rangpur", "Carmichael College", "h", 4.0, "A historic college in Rangpur, 1916.", { tags: ["photography", "solo"] }),
  p("rangpur", "Vinno Jagat", "nc", 4.0, "A themed park near Rangpur with lake and sculptures.", { tags: ["family", "budget"] }),
  p("rangpur", "Begum Rokeya Memorial Centre", "hc", 4.2, "The memorial at Pairaband, the birthplace of Begum Rokeya.", { ll: [25.65, 89.3], tags: ["family", "solo"], budget: "Free" }),
  p("dinajpur", "Nayabad Mosque", "h", 4.2, "An 18th-century terracotta-decorated mosque in Kaharole.", { ll: [25.9, 88.5], hidden: true, tags: ["photography", "solo"] }),
  p("dinajpur", "Dinajpur Rajbari", "h", 4.1, "The old palace complex of the Dinajpur zamindars.", { ll: [25.63, 88.63], tags: ["photography", "family", "solo"] }),
  p("dinajpur", "Sitakot Vihara", "h", 4.0, "Ruins of an old Buddhist monastery in Nawabganj.", { hidden: true, tags: ["solo", "photography"] }),
  p("dinajpur", "Chehelgazi Mazar", "hc", 3.9, "A shrine in Dinajpur with a historic Sufi connection.", { hidden: true, tags: ["solo", "family"] }),
  p("thakurgaon", "Tangon River", "n", 4.0, "A clear river through the district, a birdwatching spot.", { hidden: true, tags: ["photography", "solo"] }),
  p("panchagarh", "Bhitargarh Fort", "h", 4.0, "The remains of an old fort, thought to be pre-Mughal.", { ll: [26.3, 88.5], hidden: true, tags: ["solo", "photography"] }),
  p("nilphamari", "Saidpur Railway Workshop", "h", 4.0, "A historic railway workshop of colonial Bengal.", { ll: [25.78, 88.9], hidden: true, tags: ["solo", "photography"] }),
  p("lalmonirhat", "Tin Bigha Corridor", "c", 4.0, "A small land corridor that links an enclave to Bangladesh.", { ll: [26.2, 88.85], hidden: true, tags: ["solo"] }),
  p("kurigram", "Chilmari River Port", "c", 3.9, "A Brahmaputra port with riverboat traffic.", { hidden: true, tags: ["photography", "solo"] }),
  p("gaibandha", "Gaibandha Char Villages", "n", 3.9, "Sandbar villages that shift with the Brahmaputra.", { hidden: true, tags: ["photography", "solo"] }),

  p("mymensingh", "Muktagachha Zamindar Bari", "h", 4.1, "A zamindar palace in Muktagachha.", { ll: [24.76, 90.26], tags: ["photography", "family", "solo"] }),
  p("mymensingh", "Bangladesh Agricultural University Campus", "n", 4.0, "A large, green campus along the Brahmaputra.", { ll: [24.72, 90.43], tags: ["family", "budget"], budget: "Free" }),
  p("jamalpur", "Jamalpur Char Villages", "n", 3.9, "Sandbar villages on the Jamuna.", { hidden: true, tags: ["photography", "solo"] }),
  p("netrakona", "Birisiri Chinamati Lake", "nc", 4.1, "A blue lake in a former clay-pit near the Garo hills.", { hidden: true, tags: ["photography", "solo", "couple"] }),
  p("netrakona", "Someshwari River", "n", 4.0, "A clear river flowing from the Garo hills.", { hidden: true, tags: ["photography", "solo"] }),
  p("sherpur", "Gajni Tourist Spot (Jhenaigati)", "nc", 4.0, "A forested hill spot near the Garo hills.", { hidden: true, tags: ["photography", "solo", "family"] }),

  p("feni", "Feni River Banks", "n", 3.9, "A broad river that marks the border with India, with sandy banks and boat crossings.", { hidden: true, tags: ["photography", "solo"] }),
  p("feni", "Sonagazi Coastline", "n", 3.9, "A quiet, muddy coast on the Bay of Bengal.", { hidden: true, tags: ["photography", "solo"] }),
  p("jhenaidah", "Nabaganga River (Jhenaidah)", "n", 3.9, "A river that winds through the district's farmland.", { hidden: true, tags: ["photography", "solo"] }),
  p("jhenaidah", "Kobadak River", "n", 3.9, "A village river with ferry crossings.", { hidden: true, tags: ["photography", "solo"] }),
  p("magura", "Kumar River", "n", 3.9, "A small river that flows through the district.", { hidden: true, tags: ["photography", "solo"] }),

  p("kurigram", "Dharla River", "n", 3.9, "A braided river through the district's char country.", { hidden: true, tags: ["photography", "solo"] }),
  p("gaibandha", "Ghaghat River", "n", 3.9, "A river flowing through the district, with village landings.", { hidden: true, tags: ["photography", "solo"] }),
  p("lalmonirhat", "Dahagram–Angarpota Enclave", "c", 3.9, "A small enclave linked to Bangladesh by the Tin Bigha corridor.", { hidden: true, tags: ["solo"] }),
  p("nilphamari", "Teesta Barrage at Dalia", "n", 4.0, "The Dalia end of the Teesta Barrage, with river views.", { hidden: true, tags: ["photography", "family"] }),
  p("bhola", "Tentulia River", "n", 3.9, "A broad estuary river at the island's edge.", { hidden: true, tags: ["photography", "solo"] }),
  p("pirojpur", "Baleshwar River", "n", 3.9, "A wide river along the district's edge, with boats and landings.", { hidden: true, tags: ["photography", "solo"] }),
  p("sherpur", "Bhogai River", "n", 3.9, "A river flowing from the Garo hills.", { hidden: true, tags: ["photography", "solo"] }),
  p("jamalpur", "Old Brahmaputra River (Jamalpur)", "n", 3.9, "The old channel of the Brahmaputra, with river towns.", { hidden: true, tags: ["photography", "solo"] }),
];
