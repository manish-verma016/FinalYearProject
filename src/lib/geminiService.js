import toast from 'react-hot-toast';

// Local Fallback for Invitations
function getLocalInvitationFallback(prompt) {
  let groom = "Shaurya";
  let bride = "Ananya";
  
  // Try to parse groom and bride names from prompt
  const namesMatch = prompt.match(/message for\s+([^&,]+)\s+and\s+([^&,.]+)/i) || 
                     prompt.match(/for\s+([^&,]+)\s+and\s+([^&,.]+)/i);
  if (namesMatch) {
    groom = namesMatch[1].trim();
    bride = namesMatch[2].trim();
  }

  return [
    `🕉️ Formal Selection \n\nTogether with their families, ${bride} and ${groom} request the honour of your presence as they swear eternal vows. Join us under the sacred planetary alignment on this auspicious day.`,
    `✨ Modern Chic \n\nWritten in the stars, celebrated on Earth! ${bride} & ${groom} are starting their greatest chapter yet. Grab your dancing shoes and join us for a cosmic celebration of love, laughter, and stardust memories.`,
    `🌸 Poetic Grace \n\n"Two souls, one destiny." As the heavens align, ${bride} and ${groom} invite you to bless their sacred union. May your presence be the most valuable seed of our future blossoms.`
  ];
}

// Local Fallback for Itineraries
function getLocalItineraryFallback(config) {
  const style = config.style || 'Royal Heritage';
  const guestCount = config.guestCount || 'Under 100';
  const budget = config.budgetRange || 'Premium';

  return `
# 🌟 The ${style} Dream Wedding Plan
*Crafted perfectly for an intimate gathering of **${guestCount} Guests**, configured on a **${budget} Budget**.*

---

## 📅 DAY 1: THE SACRED BEGINNING & INVOCATION
*Theme: Radiant Marigolds & Traditional Warmth*

### 🌅 12:00 PM – The Regal Welcome & Check-In
- Guests arrive to traditional dhol beats, rose-petal rain, and refreshing tender coconut water.
- Personal welcome kits featuring a custom planetary chart of the wedding week and bespoke souvenirs.

### ☀️ 04:00 PM – Celestial Shanti Pooja & Ganesha Vandana
- A peaceful, spiritual gathering to invoke the blessings of Ganesha, ensuring smooth planetary transitions and stellar protection.
- Minimalist floral mandap adorned with yellow chrysanthemums and sacred mango leaves.

### 🌙 07:30 PM – Mystic Sangeet & Starry Cocktails
- A spectacular night of celestial choreography, star-gazing telescope stations, and gourmet fusion appetizers.
- **Special Highlight:** An open-air feast with live Sufi performers playing under the midnight canopy.

---

## 📅 DAY 2: THE SACRED VOWS & SHUBH VIVAH
*Theme: Royal Vermillion & Golden Stardust*

### 🌸 09:30 AM – Shubh Haldi and Flower Holi
- Playful yellow vermillion celebration. Family members apply refreshing sandalwood and turmeric paste.
- Shower of fresh marigold petals and energetic folk music circles.

### 🕊️ 04:30 PM – The Baraat Arrival & Jaimala Under the Cosmos
- The groom arrives on a beautifully adorned vehicle / chariot accompanied by a live brass band.
- **The Jaimala:** Elegant exchange of floral garlands surrounded by cold-fire sparks and ancestral Vedic hymns.

### 🕉️ 06:30 PM – Lagna Muhurut (The Seven Sacred Vows)
- The core Kundali vivah ceremony under a breathtaking glass mandap reflecting the stars.
- Sacred Agni (fire) circumambulation (Saath Phere) invoking eternal celestial blessings of Venus & Jupiter.
- Traditional silver dinner served on heritage platters.

---

## 📅 DAY 3: THE GRAND FINALE & ECLIPSE FEAST
*Theme: Cosmic Elegance & Modern Luxe*

### ☀️ 11:30 AM – High-Tea & Farewell Brunch
- Touch of warmth with live crepe and authentic masala chai station, letting guests mingle and share stories.
- Professional photo booth setup with instant polaroids for guests to keep.

### 🌙 08:00 PM – The Starry Reception & Grand Banquet
- A black-tie reception gala featuring a tiered celebratory cake, starlight violin solos, and custom elder toasts.
- **The Feast:** A five-course dynamic signature menu paired with interactive molecular gastronomy stations.
- Dancing and celestial celebrations extending late into the night.

---

###  Planner Notes for ${style} (${budget} Configuration)
- **Logistics:** Highly recommended to prioritize secure transport for the ${guestCount} attendees.
- **Lighting:** Enhance the space with floating candles and fairy-lights to maximize the celestial warmth.
`;
}

// Local Fallback for AI Chat Planner
function getLocalChatPlannerFallback(userInput, history) {
  const input = userInput.toLowerCase();
  
  if (input.includes("theme") || input.includes("style") || input.includes("decor") || input.includes("look")) {
    return `Choosing a wedding theme sets the entire tone of your celebration! Based on luxury trends, here are 3 timeless options Gathbandhan planners highly recommend:

1. **Royal Heritage**: Dominated by deep vermillion, gold accents, heavy marigolds, and historic palace architecture. Best for multi-day traditional weddings.
2. **Modern Minimalist**: Focuses on clean whitespace, pastel roses, elegant glass mandaps, and serene warm-white lighting.
3. **Boho Celestial**: Utilizes pampas grass, warm rustic copper frames, floating candles, and star-constellation backdrops.

Which aesthetic resonates most with your personal love story?

Try asking:
1. What style fits best for an outdoor lawn wedding?
2. Tell me more about the modern minimalist palette.
3. How can I blend traditional rituals with modern decor?`;
  }

  if (input.includes("budget") || input.includes("cost") || input.includes("price") || input.includes("money")) {
    return `Smart budget allocation is the key to a stress-free wedding! To optimize your budget without compromising on elegance, follow our premium planner playbook:

- **The Rule of Halves**: Allocate 45-50% for the venue and catering. These define 90% of your guest experience.
- **Priority Booking**: Put 20% into photography and entertainment. These yield the longest-lasting memories.
- **Surgical Decor**: Put 15% into high-impact spots like the Jaimala stage and entrance. Don't waste money decorating hidden corners!
- **Digital First**: Save up to 8% by utilizing our gorgeous Celestial Digital Invitations instead of heavy premium paper cards.

Would you like me to suggest specific vendor negotiations or ways to cut costs for catering?

Try asking:
1. How do I negotiate catering costs with premium resorts?
2. What are the major hidden charges in wedding venues?
3. Where can I safely save on wedding decorations?`;
  }

  if (input.includes("location") || input.includes("destination") || input.includes("venue") || input.includes("place") || input.includes("goa") || input.includes("jaipur")) {
    return `Finding the perfect coordinates for your union is magical! Here are Gathbandhan's top-rated options for weddings in India:

1. **The Palatial Charm (Jaipur / Udaipur)**: Palaces like the Chomu Palace, Shiv Niwas, or specialized luxury farms provide incredible heritage backdrops perfect for Royal themes.
2. **The Coastal Serenade (Goa / Kerala)**: Perfect for sunset cliffside pheras, beach Sangeets, and casual seaside brunch celebrations.
3. **The Scenic Mountain Retreat (Mussoorie / Shimla)**: Dreamy pine-tree settings with gorgeous mist and high altitude blessings.

I can help customize the logistics and lodging strategies for any of these. Do any of these match your vision?

Try asking:
1. What is the average cost of a Goa beach wedding?
2. Recommend heritage hotels in Jaipur for a medium family size.
3. How to manage transportation for outdoor destination weddings?`;
  }

  if (input.includes("dress") || input.includes("outfit") || input.includes("sherwani") || input.includes("lehenga") || input.includes("wear")) {
    return `Bridal and Groom silhouettes are the ultimate visual highlight! Here are top styling trends of the season:

- **For the Bride**: Pastel shades (blush pink, ivory-gold, lavender mint) with lightweight organza and heavy zardozi borders are highly trending over traditional crimson-red.
- **For the Groom**: Handcrafted raw silk sherwanis in powder-peach or off-white, paired with customized safas and heritage emerald-bead necklaces.
- **Synchronized Theme**: Coordinate small color accents (e.g., matching the groom's pocket square / safa to the bride's lehenga details) for breathtaking couple photographs.

Would you like advice on trusted couture shops or matching color themes?

Try asking:
1. What colors look best under warm outdoor twilight lighting?
2. Coordinate groom safa with a lilac/pastel outfit.
3. How should bridesmaids coordinate dress colors?`;
  }

  if (input.includes("food") || input.includes("catering") || input.includes("menu")) {
    return `Catering is the heart of Indian wedding celebrations! The Gathbandhan Gastronomy Guideline recommends:

- **Dynamic Food Stations**: Instead of single-line traditional buffets, use live culinary bars (e.g., interactive coal-fired chaat counters, live woodfired pizza, molecular dessert lounges).
- **Celestial Mocktails**: Offer signature curated drinks named after planetary bodies, e.g., 'The Mars Sunrise', or 'Jupiter's Elixir'.
- **Thoughtful Customizations**: Always include high-variety vegan, gluten-free, and traditional satvik plates for family elders.

Would you like to build a draft 3-course menu together?

Try asking:
1. Draw up a high-end veg-only menu with fusion twist.
2. What are the best interactive dessert station ideas?
3. How many live counters should we have for 300 guests?`;
  }

  // Fallback default
  return `Welcome to Gathbandhan, your celestial wedding planner! I am here to assist with every phase of your journey—from planetary alignment dates and sacred vows to venue layouts, budgeting portfolios, and styling ideas.

How can I help you design your dream union today?

Try asking:
1. How do I start planning my timeline for a 3-day wedding?
2. Recommend decoration ideas for a traditional Vedic theme.
3. How can I manage the guest list and RSVP process smoothly?`;
}

export async function generateInvitationContent(prompt) {
  try {
    const response = await fetch("/api/gemini/invitation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      // Check for blocked/leaked key specifically to alert user nicely
      if (errData.error && errData.error.includes("leaked")) {
        toast.error("Using local premium model: GEMINI_API_KEY needs updating in platform settings.", { id: "api-alert", duration: 6000 });
      }
      throw new Error(errData.error || "Failed to generate invitation content");
    }
    const data = await response.json();
    return data.options;
  } catch (error) {
    console.error("Error generating invitation content, falling back:", error);
    return getLocalInvitationFallback(prompt);
  }
}

export async function generateWeddingItinerary(config) {
  try {
    const response = await fetch("/api/gemini/itinerary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config }),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (errData.error && errData.error.includes("leaked")) {
        toast.error("Using local premium model: GEMINI_API_KEY needs updating in platform settings.", { id: "api-alert", duration: 6000 });
      }
      throw new Error(errData.error || "Failed to generate wedding itinerary");
    }
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error generating itinerary, falling back:", error);
    // Show a helpful friendly toast
    toast.success("Divine Union Itinerary synthesized offline!", { icon: "✨" });
    return getLocalItineraryFallback(config);
  }
}

export async function chatWithPlanner(userInput, history = []) {
  try {
    const response = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userInput, history }),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (errData.error && errData.error.includes("leaked")) {
        toast.error("Offline Mode: GEMINI_API_KEY needs updating in Settings > Secrets.", { id: "api-alert", duration: 4000 });
      }
      throw new Error(errData.error || "Failed to get AI planning response");
    }
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error in AI chat, falling back:", error);
    return getLocalChatPlannerFallback(userInput, history);
  }
}
