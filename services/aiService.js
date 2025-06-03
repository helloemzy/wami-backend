async extractWineData(imageBase64) {
  const startTime = Date.now();
  
  // DEBUG: Log what API key we're using
  console.log('🔍 DEBUG: API Key exists?', !!this.apiKey);
  console.log('🔍 DEBUG: API Key starts with:', this.apiKey ? this.apiKey.substring(0, 20) + '...' : 'NONE');
  console.log('🔍 DEBUG: Using URL:', this.baseURL);
  
  try {
    const response = await axios.post(this.baseURL, {
      model: "gpt-4o",
      // ... rest of your code stays the same
