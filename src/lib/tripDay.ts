import { foodsOf, getDistrict, getPlace } from "./data";
import type { Food } from "./types";
import type { Trip } from "./store";
import { buildLegs, haversineBetween, hqOf, type Leg } from "./travel";
import { levelOf, money, roomPrice } from "./tripBudget";

export interface Stay {
  district: string;
  text: string;
  note?: string;
}

export interface DayNarrative {
  district: string;
  arrive?: Leg;
  foods: Food[];
  stay?: Stay;
  ret?: Leg;
  home?: string;
}

const HOT = new Set(["coxs-bazar", "bandarban", "rangamati", "sylhet", "moulvibazar", "patuakhali"]);

/** What to show around each day's activities: the trip in, local food, where to sleep, the trip home. */
export function dayNarrative(trip: Trip): DayNarrative[] {
  const level = levelOf(trip);
  const pref = trip.pref ?? "budget";
  const travelers = trip.travelers ?? 1;
  const n = trip.days.length;

  return trip.days.map((day, i) => {
    const prev = i === 0 ? trip.origin : trip.days[i - 1].districtSlug;
    const moved = !!prev && prev !== day.districtSlug;
    const out: DayNarrative = { district: day.districtSlug, foods: [] };
    if (moved) out.arrive = buildLegs([prev!, day.districtSlug], pref, travelers)[0];
    if (moved || i === 0) out.foods = [...foodsOf(day.districtSlug)].sort((a, b) => b.rating - a.rating).slice(0, 3);
    const last = i === n - 1;
    if (!last) {
      out.stay = {
        district: day.districtSlug,
        text: `${level.stayText}, around ${money(roomPrice(day.districtSlug, level))} per room`,
        note: HOT.has(day.districtSlug) ? "A popular area. Book ahead, especially in winter." : undefined,
      };
    } else if (trip.returnToStart && trip.origin) {
      out.home = trip.origin;
      if (trip.origin !== day.districtSlug) out.ret = buildLegs([day.districtSlug, trip.origin], pref, travelers)[0];
    }
    return out;
  });
}

const TIME: { [cat: string]: string } = {
  nature: "1.5 to 3 hours",
  wildlife: "Half a day (3 to 5 hours)",
  adventure: "Half to a full day",
  beach: "2 to 3 hours",
  history: "1 to 2 hours",
  culture: "1 to 2 hours",
  food: "About 1 hour",
};

export interface PlaceFacts {
  time: string;
  budget: string;
  access?: string;
}

export function placeFacts(placeId: string): PlaceFacts | null {
  const p = getPlace(placeId);
  if (!p) return null;
  const budget = /^free/i.test(p.budget) ? "Entry free" : `Typical budget ${p.budget} per person`;
  let access: string | undefined;
  const hq = hqOf(p.districtSlug);
  if (p.exact && hq) {
    const km = Math.round((haversineBetween([p.lat, p.lng], hq) * 1.3) / 5) * 5;
    const town = getDistrict(p.districtSlug)?.name;
    if (km >= 5 && km <= 150) access = `About ${km} km from ${town} town`;
    else if (km < 5) access = `In or next to ${town} town`;
  }
  return { time: TIME[p.categories[0]] ?? "1 to 2 hours", budget, access };
}
