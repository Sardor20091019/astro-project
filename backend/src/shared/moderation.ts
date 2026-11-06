"use server";
import axios from 'axios';

export async function moderateImageUrl(url: string) {
  try {
    if (!url || typeof url !== 'string') {
      return { isSafe: false, reason: "INVALID_URL" };
    }

    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      return { isSafe: false, reason: "INVALID_PROTOCOL" };
    }

    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('172.16.') ||
      host.startsWith('172.17.') ||
      host.startsWith('172.18.') ||
      host.startsWith('172.19.') ||
      host.startsWith('172.2') ||
      host.startsWith('172.3') ||
      host === '169.254.169.254' ||
      host.endsWith('.internal') ||
      host.endsWith('.local')
    ) {
      return { isSafe: false, reason: "INVALID_HOST" };
    }

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
      console.error("SightEngine API returned a failure status:", response.data);
      return { isSafe: false, reason: "API_FAILURE" };
    }

    const { nudity } = response.data;
    if (!nudity) {
      return { isSafe: false, reason: "INVALID_RESPONSE" };
    }

    const isSafe = (nudity.none ?? 0) > 0.5;
    
    if (!isSafe) {
      console.warn(`[SightEngine Moderation] Photo rejected. Nudity detected. None confidence score: ${nudity.none}`);
      return { isSafe: false, reason: "NUDITY_DETECTED" };
    }
    
    return { isSafe: true };
    
  } catch (error) {
    console.error("Moderation engine network/runtime exception handler:", error);
    return { isSafe: false, reason: "NETWORK_ERROR" };
  }
}