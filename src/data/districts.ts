import type { District, Division } from "@/lib/types";

type Row = [slug: string, name: string, bn: string, division: Division, lat: number, lng: number, tagline: string, about: string];

const rows: Row[] = [
  // Dhaka division
  ["dhaka", "Dhaka", "ঢাকা", "Dhaka", 23.81, 90.41, "The city of a thousand rickshaws", "Bangladesh's capital is a Mughal-era riverside city layered with old mansions, bustling bazaars and some of the country's best street food."],
  ["gazipur", "Gazipur", "গাজীপুর", "Dhaka", 24.0, 90.42, "Sal forest just north of the capital", "A green belt of sal forest, safari parks and lakes that Dhaka residents escape to for the day."],
  ["narayanganj", "Narayanganj", "নারায়ণগঞ্জ", "Dhaka", 23.62, 90.5, "River port and the old capital Sonargaon", "A Shitalakshya river port town beside Sonargaon, the medieval capital of Bengal."],
  ["narsingdi", "Narsingdi", "নরসিংদী", "Dhaka", 23.92, 90.72, "Weavers, bazaars and the Meghna plain", "A handloom-and-trade district east of Dhaka, with a thriving textile tradition."],
  ["manikganj", "Manikganj", "মানিকগঞ্জ", "Dhaka", 23.86, 90.0, "Padma and Jamuna country", "A riverine district of char villages and countryside west of Dhaka."],
  ["munshiganj", "Munshiganj", "মুন্সীগঞ্জ", "Dhaka", 23.55, 90.53, "Bikrampur, the cradle of Bengali scholarship", "The ancient Bikrampur region, where Padma meets the Meghna, and home of the Mawa end of the Padma Bridge."],
  ["tangail", "Tangail", "টাঙ্গাইল", "Dhaka", 24.25, 89.92, "Sarees, sweets and the Madhupur forest", "Known for its handloom sarees, Porabari sweets and the sal woodlands of Madhupur."],
  ["kishoreganj", "Kishoreganj", "কিশোরগঞ্জ", "Dhaka", 24.43, 90.78, "Gateway to the haor wetlands", "A district of seasonal wetlands, with a famous Eid congregation ground and Mughal-era mosques."],
  ["faridpur", "Faridpur", "ফরিদপুর", "Dhaka", 23.6, 89.84, "Date-palm jaggery country", "Winter brings date-palm sap and jaggery to this Padma-side district."],
  ["gopalganj", "Gopalganj", "গোপালগঞ্জ", "Dhaka", 23.0, 89.83, "Tungipara and the Madhumati", "Home to Tungipara, birthplace of Sheikh Mujibur Rahman, set among Madhumati river villages."],
  ["madaripur", "Madaripur", "মাদারীপুর", "Dhaka", 23.17, 90.19, "Lakes and river crossings", "A flat delta district with the tranquil Shakuni Lake at its heart."],
  ["rajbari", "Rajbari", "রাজবাড়ী", "Dhaka", 23.76, 89.64, "Where the Padma bends", "Home of the historic Goalanda ferry ghat on the Padma-Jamuna confluence."],
  ["shariatpur", "Shariatpur", "শরীয়তপুর", "Dhaka", 23.22, 90.35, "The Zajira end of the Padma Bridge", "Padma river villages, ferry ghats and the southern landing of the Padma Bridge."],

  // Chattogram division
  ["chattogram", "Chattogram", "চট্টগ্রাম", "Chattogram", 22.34, 91.83, "Port city of hills, sea and ships", "Bangladesh's commercial capital, sitting between the Bay of Bengal and green hill ranges, with a food culture all its own."],
  ["coxs-bazar", "Cox's Bazar", "কক্সবাজার", "Chattogram", 21.45, 91.97, "The world's longest natural sea beach", "A 120 km unbroken stretch of sand, with hill-backed beaches, islands and a thriving seafood scene."],
  ["bandarban", "Bandarban", "বান্দরবান", "Chattogram", 22.19, 92.22, "Hills, clouds and the highest peaks", "Bangladesh's wildest hill district: sea-of-cloud viewpoints, remote lakes and Indigenous villages."],
  ["rangamati", "Rangamati", "রাঙ্গামাটি", "Chattogram", 22.65, 92.17, "The lake district", "Built around the Kaptai reservoir, with hanging bridges, hill villages and Chakma culture."],
  ["khagrachhari", "Khagrachhari", "খাগড়াছড়ি", "Chattogram", 23.12, 91.98, "Hill streams and waterfalls", "A quieter hill district of caves, falls and Chakma, Marma and Tripura villages."],
  ["feni", "Feni", "ফেনী", "Chattogram", 23.02, 91.4, "Gateway to Chattogram", "The border district on the Dhaka-Chattogram highway, with the Muhuri river and Muhuri Project."],
  ["noakhali", "Noakhali", "নোয়াখালী", "Chattogram", 22.82, 91.1, "Estuary islands of the Meghna", "Includes Hatiya and Nijhum Dwip, wild delta islands at the Meghna's mouth."],
  ["lakshmipur", "Lakshmipur", "লক্ষ্মীপুর", "Chattogram", 22.94, 90.84, "Meghna shores and coconut groves", "A coastal district at the Meghna estuary with growing char land."],
  ["chandpur", "Chandpur", "চাঁদপুর", "Chattogram", 23.23, 90.65, "The hilsa capital", "Where the Padma and Meghna meet, and the heart of Bangladesh's hilsa trade."],
  ["cumilla", "Cumilla", "কুমিল্লা", "Chattogram", 23.46, 91.18, "Ancient Buddhist ruins and rasmalai", "Home of the Mainamati Buddhist sites and the beloved Cumilla rasmalai."],
  ["brahmanbaria", "Brahmanbaria", "ব্রাহ্মণবাড়িয়া", "Chattogram", 23.96, 91.11, "Titas river and a classical music heritage", "A river-town district on the Titas, long a centre of Bengali classical music."],

  // Sylhet division
  ["sylhet", "Sylhet", "সিলেট", "Sylhet", 24.89, 91.87, "Tea gardens, swamp forest and border hills", "A green, rain-fed district with the Khasi hills on its horizon and a famed food tradition."],
  ["moulvibazar", "Moulvibazar", "মৌলভীবাজার", "Sylhet", 24.48, 91.77, "The tea capital of Bangladesh", "Home of Srimangal, with rolling tea estates, rainforest and seven-layer tea."],
  ["habiganj", "Habiganj", "হবিগঞ্জ", "Sylhet", 24.38, 91.42, "Rainforest and tea hills", "A district of tea estates and Satchari National Park."],
  ["sunamganj", "Sunamganj", "সুনামগঞ্জ", "Sylhet", 25.07, 91.4, "A vast haor country", "A monsoon-flooded wetland district with Tanguar Haor, a Ramsar site."],

  // Rajshahi division
  ["rajshahi", "Rajshahi", "রাজশাহী", "Rajshahi", 24.37, 88.6, "The silk and mango city", "A tidy university city on the Padma with silk, mangoes and Puthia's terracotta temples."],
  ["natore", "Natore", "নাটোর", "Rajshahi", 24.42, 89.0, "Rajbari and kacha golla", "Home of the Natore Rajbari complex and sweet kacha golla."],
  ["chapai-nawabganj", "Chapai Nawabganj", "চাঁপাইনবাবগঞ্জ", "Rajshahi", 24.59, 88.28, "Mango orchards and ruined Gour", "The country's mango belt, beside the medieval ruins of Gour and Pandua."],
  ["naogaon", "Naogaon", "নওগাঁ", "Rajshahi", 24.8, 88.94, "Paharpur and the rice bowl", "Home of Paharpur, Bangladesh's UNESCO-listed Buddhist monastery."],
  ["pabna", "Pabna", "পাবনা", "Rajshahi", 24.0, 89.23, "Bridges across the Padma", "A Padma-side district with the Hardinge and Lalon Shah bridges."],
  ["bogura", "Bogura", "বগুড়া", "Rajshahi", 24.85, 89.37, "Ancient Pundranagar and sweet doi", "Home of the Mahasthangarh ruins and the world-famous Bogura doi."],
  ["joypurhat", "Joypurhat", "জয়পুরহাট", "Rajshahi", 25.1, 89.02, "Quiet northern farmland", "A small agricultural district in the far north-west of Rajshahi division."],
  ["sirajganj", "Sirajganj", "সিরাজগঞ্জ", "Rajshahi", 24.45, 89.7, "On the banks of the Jamuna", "A Jamuna river district, home of the Bangabandhu Bridge and Rabindranath Tagore's Shahzadpur."],

  // Khulna division
  ["khulna", "Khulna", "খুলনা", "Khulna", 22.82, 89.55, "Gateway to the Sundarbans", "The industrial city and starting point for Sundarbans boat trips."],
  ["bagerhat", "Bagerhat", "বাগেরহাট", "Khulna", 22.66, 89.79, "Sixty Dome Mosque and mangroves", "Home of the UNESCO-listed Mosque City of Bagerhat and the Sundarbans' eastern edge."],
  ["satkhira", "Satkhira", "সাতক্ষীরা", "Khulna", 22.72, 89.07, "Coastal wetlands and shrimp farms", "A southwest district with Sundarbans access and a tidal landscape."],
  ["jashore", "Jashore", "যশোর", "Khulna", 23.17, 89.21, "Date-palm sap and border trade", "A trading district with a thriving sap-and-jaggery winter."],
  ["jhenaidah", "Jhenaidah", "ঝিনাইদহ", "Khulna", 23.54, 89.17, "Date-palm jaggery and flat farmland", "A district in Bangladesh's date-palm belt."],
  ["magura", "Magura", "মাগুরা", "Khulna", 23.49, 89.42, "Quiet Nabaganga river villages", "A small river district between Jashore and Faridpur."],
  ["narail", "Narail", "নড়াইল", "Khulna", 23.17, 89.5, "Home of the artist S. M. Sultan", "A district on the Chitra river, known for the painter S. M. Sultan."],
  ["chuadanga", "Chuadanga", "চুয়াডাঙ্গা", "Khulna", 23.64, 88.85, "Bordering West Bengal", "A western border district of farmland and rivers."],
  ["kushtia", "Kushtia", "কুষ্টিয়া", "Khulna", 23.9, 89.12, "The land of Lalon Fakir", "Home of the Baul poet Lalon Shah and Rabindranath Tagore's Shilaidaha."],
  ["meherpur", "Meherpur", "মেহেরপুর", "Khulna", 23.76, 88.63, "Mujibnagar, birthplace of the nation's first government", "Home of Mujibnagar, where Bangladesh's provisional government took its oath in 1971."],

  // Barishal division
  ["barishal", "Barishal", "বরিশাল", "Barishal", 22.7, 90.37, "Venice of the East", "A riverine delta city, famed for its canals, floating guava markets and the Kirtankhola."],
  ["bhola", "Bhola", "ভোলা", "Barishal", 22.69, 90.65, "Bangladesh's largest island district", "A Meghna-delta island district with a growing gas-field economy."],
  ["barguna", "Barguna", "বরগুনা", "Barishal", 22.16, 90.12, "Southern coast and Sonakata", "A southern coastal district of rivers and mangroves."],
  ["jhalakathi", "Jhalakathi", "ঝালকাঠি", "Barishal", 22.64, 90.2, "Guava markets", "A canal-laced district known for its floating guava markets."],
  ["patuakhali", "Patuakhali", "পটুয়াখালী", "Barishal", 22.36, 90.33, "Kuakata, the daughter of the sea", "Home of Kuakata, where you can watch both sunrise and sunset over the sea."],
  ["pirojpur", "Pirojpur", "পিরোজপুর", "Barishal", 22.58, 89.97, "Floating markets and river villages", "A canal-and-river district bordering Barishal and Bagerhat."],

  // Rangpur division
  ["rangpur", "Rangpur", "রংপুর", "Rangpur", 25.74, 89.25, "Gateway to the north", "The northern hub, with the Tajhat Palace and northern flavour."],
  ["dinajpur", "Dinajpur", "দিনাজপুর", "Rangpur", 25.63, 88.64, "Kantaji Temple and Katarivog rice", "A historic district with a famed terracotta temple and aromatic rice."],
  ["thakurgaon", "Thakurgaon", "ঠাকুরগাঁও", "Rangpur", 26.03, 88.46, "Tea at the border", "A northern district at the Indian border, with newer tea cultivation."],
  ["panchagarh", "Panchagarh", "পঞ্চগড়", "Rangpur", 26.34, 88.55, "Tetulia and Kanchenjunga views", "Bangladesh's northernmost district, with tea and, on clear days, a view of Kanchenjunga."],
  ["nilphamari", "Nilphamari", "নীলফামারী", "Rangpur", 25.93, 88.86, "Teesta river and Syedpur", "A northern district through which the Teesta river flows."],
  ["lalmonirhat", "Lalmonirhat", "লালমনিরহাট", "Rangpur", 25.99, 89.45, "Teesta char lands", "A north Bengal river district at the Teesta."],
  ["kurigram", "Kurigram", "কুড়িগ্রাম", "Rangpur", 25.81, 89.64, "Brahmaputra char islands", "A district of Brahmaputra sandbars and islands."],
  ["gaibandha", "Gaibandha", "গাইবান্ধা", "Rangpur", 25.33, 89.53, "Jamuna and Brahmaputra chars", "A north-central district bound by the Brahmaputra."],

  // Mymensingh division
  ["mymensingh", "Mymensingh", "ময়মনসিংহ", "Mymensingh", 24.75, 90.4, "Ballad country on the Brahmaputra", "A university city on the old Brahmaputra, with a rich folk-ballad tradition."],
  ["jamalpur", "Jamalpur", "জামালপুর", "Mymensingh", 24.92, 89.95, "Jamuna riverside district", "A Jamuna-side district known for jute and river chars."],
  ["netrakona", "Netrakona", "নেত্রকোণা", "Mymensingh", 24.87, 90.73, "Garo hills and haors", "A northern district that touches the Garo hills and haor wetlands."],
  ["sherpur", "Sherpur", "শেরপুর", "Mymensingh", 25.02, 90.02, "Foothills of Meghalaya", "A northern border district with hills and the Garo-hill foothills."],
];

export const districts: District[] = rows.map(([slug, name, bn, division, lat, lng, tagline, about]) => ({
  slug, name, bn, division, lat, lng, tagline, about,
}));
