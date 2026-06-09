"use server";
import axios from 'axios';

export async function moderateImageUrl(url: string) {
  try {
    const response = await axios.get('https://api.sightengine.com/1.0/check.json', {
      timeout: 7000,
      params: {
        url: url,
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

    const isSafe = (nudity.none ?? 0) > 0.5;
    
    return { isSafe };
    
  } catch (error) {
    console.error("Moderation engine network/runtime exception handler:", error);

    return { isSafe: false };
  }
}