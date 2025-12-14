const GA_ENDPOINT = 'https://www.google-analytics.com/g/collect';
const MEASUREMENT_ID = 'G-4KDGP0L8KT';
const DEFAULT_ENGAGEMENT_TIME_MSEC = 100;
const SESSION_EXPIRATION_IN_MIN = 30;

class Analytics {
  constructor() {
    this.debug = true;
  }

  async getOrCreateClientId() {
    const result = await chrome.storage.local.get('clientId');
    let clientId = result.clientId;
    if (!clientId) {
      clientId = self.crypto.randomUUID();
      await chrome.storage.local.set({ clientId });
    }
    return clientId;
  }

  async getOrCreateSessionId() {
    let { sessionId } = await chrome.storage.local.get('sessionId');
    let { lastSessionAccess } = await chrome.storage.local.get('lastSessionAccess');
    const now = Date.now();

    if (!sessionId || !lastSessionAccess || (now - lastSessionAccess) > (SESSION_EXPIRATION_IN_MIN * 60 * 1000)) {
        sessionId = now.toString();
    }
    
    await chrome.storage.local.set({ sessionId, lastSessionAccess: now });
    return sessionId;
  }

  async fireEvent(name, params = {}) {
    const clientId = await this.getOrCreateClientId();
    const sessionId = await this.getOrCreateSessionId();

    // Construct URL parameters for the pixel request
    const urlParams = new URLSearchParams({
      v: '2', // Protocol Version
      tid: MEASUREMENT_ID, // Tracking ID
      cid: clientId, // Client ID
      sid: sessionId, // Session ID
      en: name, // Event Name
      _p: Math.floor(Math.random() * 1000000000), // Random number for cache busting
      seg: '1', // Session engagement
    });

    // Add custom parameters
    Object.keys(params).forEach(key => {
      urlParams.append(`ep.${key}`, params[key]);
    });

    // Add engagement time if not present
    if (!params.engagement_time_msec) {
      urlParams.append('ep.engagement_time_msec', DEFAULT_ENGAGEMENT_TIME_MSEC);
    }

    try {
      // Use the pixel endpoint instead of the API endpoint
      const response = await fetch(`${GA_ENDPOINT}?${urlParams.toString()}`, {
        method: 'POST',
        // No body needed for this endpoint, parameters are in URL
      });
      
      if (this.debug) {
        console.log('Analytics event sent (Pixel):', name);
      }
    } catch (e) {
      console.error('Analytics error:', e);
    }
  }
}

// Expose globally
self.analytics = new Analytics();
