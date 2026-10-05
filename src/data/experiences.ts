import type { Category, Experience } from "@/lib/types";
import { slugify } from "@/lib/utils";

function e(districtSlug: string, title: string, blurb: string, category: Category): Experience {
  return { id: `${districtSlug}--${slugify(title)}`, districtSlug, title, blurb, category };
}

export const experiences: Experience[] = [
  e("dhaka", "Rickshaw ride through Old Dhaka", "Hop on a hand-painted rickshaw and weave through Shankhari Bazar and Chawkbazar.", "culture"),
  e("dhaka", "Buriganga boat ride at sunset", "Take a wooden boat from Sadarghat and watch the old river port at dusk.", "culture"),
  e("dhaka", "Old Dhaka food crawl", "Eat your way from bakarkhani to kebab to lassi in a single evening.", "food"),

  e("narayanganj", "Sonargaon heritage walk", "Wander Panam Nagar's crumbling merchant houses with a guide.", "history"),
  e("munshiganj", "Padma Bridge sunset", "Watch the sun set behind the country's biggest bridge from the Mawa riverbank.", "nature"),
  e("tangail", "Chomchom tasting in Porabari", "Buy fresh from the source and compare the different shops.", "food"),
  e("kishoreganj", "Haor boat trip in the monsoon", "Glide through flooded fields and bird-filled wetlands.", "nature"),

  e("chattogram", "Sunset at Patenga", "Watch container ships pass the river mouth as the sun sets.", "beach"),
  e("chattogram", "Mezbani feast", "Try the traditional Chattogram beef feast at a local restaurant.", "food"),
  e("chattogram", "Sitakunda hike", "Climb Chandranath Hill through forest and temples.", "adventure"),

  e("coxs-bazar", "Sunset on Laboni beach", "A classic evening walk with fresh seafood to follow.", "beach"),
  e("coxs-bazar", "Marine Drive motorbike ride", "Ride the coastal road between hills and sea, stopping at Himchari and Inani.", "adventure"),
  e("coxs-bazar", "Saint Martin's snorkelling", "Swim in clear water around the coral reef at Chera Dwip.", "adventure"),
  e("coxs-bazar", "Shutki market visit", "Walk the dried-fish markets and meet the vendors.", "culture"),
  e("coxs-bazar", "Maheshkhali boat trip", "Cross by speedboat and visit the Adinath temple hillside.", "culture"),
  e("coxs-bazar", "Sonadia mangrove cruise", "Explore the island's mangroves and birdlife.", "wildlife"),

  e("bandarban", "Nilgiri sunrise above the clouds", "Be up before dawn for a sea-of-clouds sunrise.", "nature"),
  e("bandarban", "Boga Lake trek", "A two-day trek with a hill guide and an overnight camp.", "adventure"),
  e("bandarban", "Hill village homestay", "Stay with an Indigenous family and share their cooking.", "culture"),
  e("bandarban", "Sangu river boat ride", "Float through a gorge of green hills.", "nature"),

  e("rangamati", "Kaptai Lake boat tour", "A full-day boat trip across the lake to island villages.", "nature"),
  e("rangamati", "Sajek sunrise camp", "Stay in a hilltop cottage and wake above the clouds.", "nature"),
  e("rangamati", "Chakma weaving visit", "Meet weavers and see handloom techniques.", "culture"),

  e("cumilla", "Mainamati ruins tour", "Trace the Buddhist ruins across the Lalmai hills.", "history"),
  e("chandpur", "Hilsa market at dawn", "Watch the morning catch come in at the river port.", "culture"),

  e("sylhet", "Ratargul boat ride", "A quiet trip through the flooded swamp forest.", "nature"),
  e("sylhet", "Jaflong stone-river visit", "See stone-collecting boats on the Piyain river.", "culture"),
  e("sylhet", "Tea estate walk", "Walk through Malnicherra and taste fresh tea.", "nature"),
  e("moulvibazar", "Seven-layer tea tasting", "Order the famous layered tea at Nilkantha Tea Cabin.", "food"),
  e("moulvibazar", "Lawachara gibbon spotting", "Trek the forest trail at dawn.", "wildlife"),
  e("moulvibazar", "Baikka Beel birdwatching", "Visit in winter to see migratory birds.", "wildlife"),
  e("sunamganj", "Tanguar Haor houseboat stay", "Spend a night on the water in the monsoon.", "nature"),

  e("rajshahi", "Puthia temple walk", "Explore terracotta temple art on foot.", "history"),
  e("rajshahi", "Mango orchard visit", "Taste fresh mangoes straight from the tree in June.", "food"),
  e("naogaon", "Paharpur ruins tour", "Walk through the UNESCO-listed Buddhist monastery.", "history"),
  e("bogura", "Mahasthangarh tour", "Walk the 2,300-year-old fortified city.", "history"),
  e("bogura", "Doi tasting trail", "Compare clay-pot doi from different shops.", "food"),

  e("khulna", "Sundarbans boat expedition", "Multi-day trip with forest guides and a chance to see tigers.", "wildlife"),
  e("bagerhat", "Mosque City walk", "Visit the Sixty Dome Mosque and surrounding monuments.", "history"),
  e("kushtia", "Baul music evening", "Listen to folk songs at Lalon's shrine.", "culture"),

  e("barishal", "Kirtankhola boat trip", "Take a country boat along the river.", "nature"),
  e("jhalakathi", "Floating guava market", "Join a boat for the early-morning market.", "culture"),
  e("patuakhali", "Kuakata sunrise and sunset", "See both from the same beach.", "beach"),

  e("rangpur", "Tajhat Palace visit", "Tour the zamindar mansion and its grounds.", "history"),
  e("dinajpur", "Kantaji Temple visit", "See the finest terracotta temple in the country.", "history"),
  e("panchagarh", "Tetulia tea at sunrise", "Watch the sun rise over the tea gardens.", "nature"),

  e("mymensingh", "Brahmaputra riverside walk", "A quiet evening walk along the river.", "nature"),
  e("mymensingh", "Muktagachha monda tasting", "Try the area's famous sweet.", "food"),
];
