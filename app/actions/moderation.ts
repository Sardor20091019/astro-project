"use server";
import axios from 'axios';

export async function moderateImageUrl(url: string) {
  try {
    const response = await axios.get('https://api.sightengine.com/1.0/check.json', {
      params: {
        'url': url,
        'models': 'nudity-2.1,gore-2.0',
        'api_user': process.env.SIGHTENGINE_API_USER,
        'api_secret': process.env.SIGHTENGINE_API_SECRET,
      }
    });
    return response.data;
  } catch (error) {
    console.error("Moderation error:", error);
    return { error: "Moderation service unavailable" };
  }
}