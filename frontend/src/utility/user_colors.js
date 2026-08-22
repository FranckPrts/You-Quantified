export const USER_COLORS = [
  "#F4A6A6", // soft red
  "#F6C28B", // peach
  "#F7E08C", // butter yellow
  "#B6E0A6", // mint green
  "#9CD7C8", // seafoam
  "#A6D4F4", // sky blue
  "#A6B6F4", // periwinkle
  "#C9A6F4", // lavender
  "#EBA6E0", // orchid
  "#F4A6C2", // rose
  "#D4C2A6", // sand
  "#A6E0DA", // aqua
];

export function userColor(id) {
  let hash = 0;
  for (const char of String(id)) {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
}
