// services/recommendationService.ts

interface Appointment {
    vehicleType: string;
    selectedPlan: string;
    extraFeatures: string[];
    date: string;
    vehicleMake: string;
    vehicleModel: string;
  }
  
  interface UserHistory {
    email: string;
    previousAppointments: Appointment[];
  }
  
  interface Recommendation {
    recommendedPlan: string;
    recommendedFeatures: string[];
    explanation: string;
  }
  
  const CONFIG = {
    API_KEY: "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",
    API_ENDPOINT: "https://api.groq.com/openai/v1/chat/completions",
    MODEL: "llama3-70b-8192",
    TIMEOUT: 20000 // 20 seconds timeout
  };
  
  export async function getFreshRecommendations(userEmail: string): Promise<Recommendation> {
    try {
      // 1. Always fetch fresh user history from MongoDB
      const userHistory = await fetchCompleteHistory(userEmail);
      
      // 2. Perform real-time analysis of booking patterns
      const { planDistribution, featureFrequency, vehiclePatterns } = analyzeBookingPatterns(userHistory);
      
      // 3. Create detailed AI prompt with current data
      const aiPrompt = createAIPrompt(userHistory, planDistribution, featureFrequency, vehiclePatterns);
      
      // 4. Get new AI recommendations
      const aiResponse = await callGroqAPI(aiPrompt);
      
      // 5. Validate and return recommendations
      return validateAndFormatRecommendations(aiResponse, planDistribution, featureFrequency);
  
    } catch (error) {
      console.error('Error in getFreshRecommendations:', error);
      // Fallback to calculated recommendations if AI fails
      return generateCalculatedRecommendations(userEmail);
    }
  }
  
  async function fetchCompleteHistory(userEmail: string): Promise<UserHistory> {
    // Always bypass cache with timestamp
    const response = await fetch(`/api/user-history?email=${encodeURIComponent(userEmail)}&timestamp=${Date.now()}`);
    if (!response.ok) throw new Error(`Failed to fetch history: ${response.status}`);
    return await response.json();
  }
  
  function analyzeBookingPatterns(history: UserHistory) {
    const planDistribution = {
      basic: 0, // 500-999
      full: 0,  // 1000-1999
      general: 0 // 2000+
    };
  
    const featureFrequency: Record<string, number> = {};
    const vehiclePatterns: Record<string, number> = {};
  
    history.previousAppointments.forEach(appt => {
      // Categorize plan by price
      const price = parseInt(appt.selectedPlan);
      if (price >= 2000) planDistribution.general++;
      else if (price >= 1000) planDistribution.full++;
      else planDistribution.basic++;
  
      // Count feature usage
      appt.extraFeatures.forEach(feature => {
        featureFrequency[feature] = (featureFrequency[feature] || 0) + 1;
      });
  
      // Track vehicle patterns
      const vehicleKey = `${appt.vehicleMake} ${appt.vehicleModel}`;
      vehiclePatterns[vehicleKey] = (vehiclePatterns[vehicleKey] || 0) + 1;
    });
  
    return { planDistribution, featureFrequency, vehiclePatterns };
  }
  
  function createAIPrompt(
    history: UserHistory,
    planStats: { basic: number; full: number; general: number },
    featureStats: Record<string, number>,
    vehicleStats: Record<string, number>
  ): string {
    const totalBookings = history.previousAppointments.length;
    const topFeatures = getTopFeatures(featureStats, 3);
    const topVehicles = Object.entries(vehicleStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);
  
    return `As a car wash recommendation AI, analyze this customer's COMPLETE booking history in real-time:
  
    Customer: ${history.email}
    Total Bookings: ${totalBookings}
    
    Plan Preferences:
    - General Wash (2000+): ${planStats.general} bookings (${Math.round(planStats.general/totalBookings*100)}%)
    - Full Wash (1000-1999): ${planStats.full} bookings (${Math.round(planStats.full/totalBookings*100)}%)
    - Basic Wash (500-999): ${planStats.basic} bookings (${Math.round(planStats.basic/totalBookings*100)}%)
  
    Vehicle Preferences:
    ${topVehicles.map(([vehicle, count]) => 
      `- ${vehicle}: ${count} bookings (${Math.round(count/totalBookings*100)}%)`
    ).join('\n')}
  
    Feature Preferences:
    ${topFeatures.map(([feature, count]) =>
      `- ${feature}: ${count} uses (${Math.round(count/totalBookings*100)}%)`
    ).join('\n')}
  
    Recent Bookings (Last 3):
    ${history.previousAppointments.slice(0, 3).map(appt => `
      ${appt.date}: ${appt.selectedPlan} plan
      Vehicle: ${appt.vehicleMake} ${appt.vehicleModel}
      Features: ${appt.extraFeatures.join(', ')}`
    ).join('\n')}
  
    STRICT Recommendation Rules:
    1. PRIMARY recommendation MUST match their MOST FREQUENTLY used plan category
    2. MUST include at least ONE of their TOP 3 most used features
    3. Can suggest ONE new feature if it complements their vehicle/history
    4. Explanation MUST reference:
       - Exact booking counts
       - Usage percentages
       - Recent service choices
  
    Respond with JSON:
    {
      "recommendedPlan": "Basic/Full/General Wash",
      "recommendedFeatures": ["feature1", "feature2"],
      "explanation": "You've chosen [plan] [x] times ([y]%) and frequently use [features]..."
    }`;
  }
  
  async function callGroqAPI(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
  
    try {
      const response = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.API_KEY}`
        },
        body: JSON.stringify({
          model: CONFIG.MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.4, // Balanced consistency/creativity
          max_tokens: 600,
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      });
  
      clearTimeout(timeout);
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`GROQ API error: ${response.status} - ${errorBody}`);
      }
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
  
    } finally {
      clearTimeout(timeout);
    }
  }
  
  function validateAndFormatRecommendations(
    aiContent: string,
    planStats: { basic: number; full: number; general: number },
    featureStats: Record<string, number>
  ): Recommendation {
    try {
      const result = JSON.parse(aiContent);
      const totalBookings = planStats.basic + planStats.full + planStats.general;
      const topFeatures = getTopFeatures(featureStats, 3);
  
      // Validate plan recommendation
      const mostUsedPlan = getMostUsedPlan(planStats);
      const recommendedPlan = 
        ["Basic Wash", "Full Wash", "General Wash"].includes(result.recommendedPlan)
          ? result.recommendedPlan
          : mostUsedPlan;
  
      // Validate and format features
      const recommendedFeatures = validateFeatureSelection(
        result.recommendedFeatures,
        topFeatures
      );
  
      return {
        recommendedPlan,
        recommendedFeatures,
        explanation: createExplanation(
          recommendedPlan, 
          recommendedFeatures,
          planStats,
          featureStats,
          totalBookings
        )
      };
  
    } catch (error) {
      console.error('Invalid AI response:', error);
      throw new Error('Failed to process recommendations');
    }
  }
  
  // Helper functions
  function getTopFeatures(featureStats: Record<string, number>, count: number): [string, number][] {
    return Object.entries(featureStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count);
  }
  
  function getMostUsedPlan(planStats: { basic: number; full: number; general: number }): string {
    if (planStats.general >= planStats.full && planStats.general >= planStats.basic) {
      return "General Wash";
    }
    if (planStats.full >= planStats.basic) {
      return "Full Wash";
    }
    return "Basic Wash";
  }
  
  function validateFeatureSelection(
    aiFeatures: unknown,
    topFeatures: [string, number][]
  ): string[] {
    if (!Array.isArray(aiFeatures)) {
      return [topFeatures[0][0], topFeatures[1][0]];
    }
  
    const validFeatures = aiFeatures
      .filter((f): f is string => typeof f === 'string')
      .slice(0, 2);
  
    // Ensure at least one top feature is included
    if (!validFeatures.some(f => topFeatures.some(([topF]) => topF === f))) {
      validFeatures[0] = topFeatures[0][0];
    }
  
    return validFeatures.length >= 2 
      ? validFeatures 
      : [...validFeatures, ...topFeatures.map(([f]) => f).slice(0, 2 - validFeatures.length)];
  }
  
  function createExplanation(
    plan: string,
    features: string[],
    planStats: { basic: number; full: number; general: number },
    featureStats: Record<string, number>,
    totalBookings: number
  ): string {
    const planCount = 
      plan === "General Wash" ? planStats.general :
      plan === "Full Wash" ? planStats.full : planStats.basic;
  
    const featureText = features.map(f => 
      `${f} (${featureStats[f] || 0}/${totalBookings} bookings)`
    ).join(' and ');
  
    return `Based on your ${totalBookings} visits: Recommended ${plan} ` +
           `(chosen ${planCount} times) with ${featureText}`;
  }
  
  async function generateCalculatedRecommendations(userEmail: string): Promise<Recommendation> {
    try {
      const history = await fetchCompleteHistory(userEmail);
      const { planDistribution, featureFrequency } = analyzeBookingPatterns(history);
      const totalBookings = history.previousAppointments.length;
  
      if (totalBookings === 0) {
        return {
          recommendedPlan: "Full Wash",
          recommendedFeatures: ["Tire Shine", "Interior Vacuum"],
          explanation: "Recommended starter package for new customers"
        };
      }
  
      const recommendedPlan = getMostUsedPlan(planDistribution);
      const recommendedFeatures = getTopFeatures(featureFrequency, 2).map(([f]) => f);
  
      return {
        recommendedPlan,
        recommendedFeatures,
        explanation: `System recommendation based on ${totalBookings} bookings`
      };
    } catch (error) {
      console.error('Fallback recommendation failed:', error);
      return {
        recommendedPlan: "Full Wash",
        recommendedFeatures: ["Tire Shine", "Interior Vacuum"],
        explanation: "Default recommendation"
      };
    }
  }