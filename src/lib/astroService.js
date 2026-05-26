function getLocalAstroFallback(type, data) {
  if (type === 'match') {
    const score = data.score || 24;
    return {
      summary: `🌌 Celestial Compatibility: Both souls exhibit beautiful harmony matching at ${score}/36 Gunas. The moon placement in Venus showcases highly reciprocal planetary alignments. You possess a rare cosmic connection built on mutual trust, emotional depth, and stardust alignment.`,
      manglikAdvice: "✅ Auspicious Harmony: No major Manglik or Saturn Dosha (friction) detected under current planetary orbits. Highly positive cosmic alignment.",
      blessing: "✨ Blessed Union: May Guru (Jupiter) and Shukra (Venus) shine their divine light upon your path. May your love grow as eternal as the constellations."
    };
  } else {
    return {
      advice: "🪐 Celestial auspiciousness is extremely high for dates selected under Pushya Nakshatra and Rohini Nakshatra. Perfect for starting the magical journey of marriage.",
      wisdom: "✨ Pushya Nakshatra is known as the King of all constellations, bringing supreme stability, divine protection, and abundant fortune to new unions."
    };
  }
}

export async function generateAstroReading(type, data) {
  try {
    const response = await fetch("/api/gemini/astro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data }),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Failed astro analysis");
    }
    return await response.json();
  } catch (error) {
    console.error("Gemini Astro Error, reverting to local wisdom:", error);
    return getLocalAstroFallback(type, data);
  }
}
