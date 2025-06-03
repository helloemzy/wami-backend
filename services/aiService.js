const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY; // Change this
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
  }

  async extractWineData(imageBase64) {
    const startTime = Date.now();
    
    try {
      const response = await axios.post(this.baseURL, {
        model: "gpt-4o", // OpenAI's vision model
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this wine bottle label and extract the following information. Return ONLY a valid JSON object with these exact fields:
              {
                "name": "wine name",
                "winemaker": "producer/winery name", 
                "vintage": year as number,
                "country": "country of origin",
                "region": "wine region if visible",
                "wineType": "red/white/rosé/sparkling/fortified/dessert",
                "alcoholContent": percentage as number if visible,
                "grapeVariety": ["grape varieties if listed"],
                "confidence": confidence score 0-1
              }
              
              If any field is not clearly visible, use null for that field. Be conservative with confidence - only use >0.8 if you're very certain.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }],
        max_tokens: 500
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const content = response.data.choices[0].message.content;
      const processingTime = Date.now() - startTime;
      
      const cleanedContent = content.replace(/```json|```/g, '').trim();
      const parsedData = JSON.parse(cleanedContent);
      
      return {
        ...parsedData,
        processingTime,
        extractedText: content
      };

    } catch (error) {
      console.error('AI extraction failed:', error.message);
      
      return {
        name: null,
        winemaker: null,
        vintage: null,
        country: null,
        region: null,
        wineType: null,
        alcoholContent: null,
        grapeVariety: null,
        confidence: 0,
        processingTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  // ... rest of the code stays the same
}

module.exports = AIService;
