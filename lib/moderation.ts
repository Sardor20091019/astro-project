"use server";
import axios from 'axios';

export async function moderateImageUrl(url: string) {
  try {
    const response = await axios.get('https://api.sightengine.com/1.0/check.json', {
      timeout: 7000,
      params: {
        url: url,
        // Removed gore-2.0 to halve processing costs
        models: 'nudity-2.1', 
        api_user: process.env.SIGHTENGINE_API_USER,
        api_secret: process.env.SIGHTENGINE_API_SECRET,
      }
    });

    if (!response.data || response.data.status === "failure") {
      return { isSafe: false };
    }

    const { nudity } = response.data;
    if (!nudity) return { isSafe: false };

    // Standard safety check: If "none" is high, it is likely safe.
    // If "none" is low, it suggests nudity was detected.
    const isSafe = (nudity.none ?? 0) > 0.5; // Adjusted threshold to 0.5 for safer filtering
    
    return { isSafe };
    
  } catch (error) {
    console.error("Moderation engine network/runtime exception handler:", error);
    // Default to 'false' (safe-fail) to ensure nothing bad gets through if the API is down
    return { isSafe: false };
  }
}