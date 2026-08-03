/**
 * Data for the live demos embedded in the case studies.
 *
 * The dish list is a **sample**, not Diavo's corpus. The real product searches
 * 870 dishes; shipping a fabricated 870-row dataset here to make the number
 * match would be inventing product data, so the demo says plainly what it is.
 * The matching algorithm is the real one.
 */
export const SAMPLE_DISHES = [
  "Masala dosa",
  "Idli sambar",
  "Medu vada",
  "Upma",
  "Pongal",
  "Rava kesari",
  "Bisi bele bath",
  "Curd rice",
  "Lemon rice",
  "Puliyogare",
  "Chapati",
  "Aloo paratha",
  "Rajma chawal",
  "Chole bhature",
  "Paneer butter masala",
  "Palak paneer",
  "Dal tadka",
  "Dal makhani",
  "Vegetable biryani",
  "Chicken biryani",
  "Butter chicken",
  "Chicken curry",
  "Fish curry",
  "Egg curry",
  "Sambar",
  "Rasam",
  "Avial",
  "Thoran",
  "Appam",
  "Puttu and kadala",
  "Poha",
  "Dhokla",
  "Pav bhaji",
  "Vada pav",
  "Misal pav",
  "Samosa",
  "Pakora",
  "Kachori",
  "Gulab jamun",
  "Rasgulla",
  "Jalebi",
  "Payasam",
] as const;

export const DISH_SAMPLE_NOTE =
  "A sample of the corpus. The live build searches 870 dishes with this same matcher.";

/**
 * The plaintext the cipher demo falls back to when the field is empty, so the
 * panel is never blank on first view.
 */
export const CIPHER_PLACEHOLDER = "meet at six, the key is safe";
