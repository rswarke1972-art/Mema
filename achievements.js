// achievements.js – Premium SVG achievement definitions

export const ACHIEVEMENTS = [
  {
    id: "first_dance",
    name: "First Dance",
    description: "You danced your first ball with confidence.",
    icon: "assets/svg/first_dance.svg",
    unlocked: false,
  },
  {
    id: "broken_heart",
    name: "Broken Heart",
    description: "A painful misunderstanding left you bruised.",
    icon: "assets/svg/broken_heart.svg",
    unlocked: false,
  },
  {
    id: "wise_lady",
    name: "Wise Lady",
    description: "Your wisdom guided the town through a scandal.",
    icon: "assets/svg/wise_lady.svg",
    unlocked: false,
  },
  {
    id: "matchmaker",
    name: "Matchmaker",
    description: "You helped multiple friends find love.",
    icon: "assets/svg/matchmaker.svg",
    unlocked: false,
  },
  {
    id: "reputation_queen",
    name: "Reputation Queen",
    description: "Your social standing reached the pinnacle.",
    icon: "assets/svg/reputation_queen.svg",
    unlocked: false,
  },
  {
    id: "true_love",
    name: "True Love",
    description: "You achieved a lasting, healthy romance.",
    icon: "assets/svg/true_love.svg",
    unlocked: false,
  },
  {
    id: "social_disaster",
    name: "Social Disaster",
    description: "Your pride caused a scandal that rocked the town.",
    icon: "assets/svg/social_disaster.svg",
    unlocked: false,
  },
];

/**
 * Unlock an achievement and trigger a brief animation.
 * @param {string} id - Achievement id.
 */
export function unlockAchievement(id) {
  const ach = ACHIEVEMENTS.find((a) => a.id === id);
  if (!ach || ach.unlocked) return;
  ach.unlocked = true;

  // Simple toast animation – the HTML must contain a container with id "achievement-toast".
  const toast = document.createElement("div");
  toast.className = "achievement-toast";
  toast.innerHTML = `
    <img src="${ach.icon}" alt="${ach.name}" class="ach-icon"/>
    <span class="ach-text">${ach.name}</span>
  `;
  document.body.appendChild(toast);
  // Fade in/out via CSS animation (defined in styles.css)
  setTimeout(() => toast.remove(), 3500);
}
