using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace VeggieScanWorker
{
    public class LMStudioService
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;
        private readonly string _model;

        public LMStudioService(string baseUrl = "http://localhost:1234", string model = "google/gemma-3-4b")
        {
            _httpClient = new HttpClient();
            _baseUrl = baseUrl;
            _model = model;
        }

        public async Task<bool> IsAvailable()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_baseUrl}/v1/models");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public async Task<string[]> GetAvailableModels()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_baseUrl}/v1/models");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var json = JObject.Parse(content);
                    var models = json["data"].Select(m => m["id"].ToString()).ToArray();
                    return models;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting models: {ex.Message}");
            }

            return Array.Empty<string>();
        }

        public async Task<VegetableAnalysisResult> AnalyzeImage(string base64Image, string prompt, string modelOverride = null)
        {
            try
            {
                Console.WriteLine("Sending image to LM Studio for analysis...");
                
                // Prepare the request body
                var requestBody = new
                {
                    model = modelOverride ?? _model,
                    messages = new[]
                    {
                        new
                        {
                            role = "user",
                            content = new object[]
                            {
                                new
                                {
                                    type = "text",
                                    text = prompt
                                },
                                new
                                {
                                    type = "image_url",
                                    image_url = new
                                    {
                                        url = $"data:image/jpeg;base64,{base64Image}"
                                    }
                                }
                            }
                        }
                    },
                    temperature = 0.7,
                    max_tokens = 500
                };

                var json = JsonConvert.SerializeObject(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                // Send the request
                var response = await _httpClient.PostAsync($"{_baseUrl}/v1/chat/completions", content);
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"LM Studio API error: {response.StatusCode} {response.ReasonPhrase}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseJson = JObject.Parse(responseContent);
                
                // Extract the LLM response
                var llmResponse = responseJson["choices"][0]["message"]["content"].ToString();
                
                Console.WriteLine("Raw LLM response received");
                
                // Parse the JSON response from the LLM
                // The LLM might return a formatted response, so we need to extract just the JSON part
                var jsonMatch = System.Text.RegularExpressions.Regex.Match(llmResponse, @"\{[\s\S]*\}");
                
                if (!jsonMatch.Success)
                {
                    Console.WriteLine("No JSON found in response, trying to extract data from text");
                    return ExtractDataFromText(llmResponse);
                }
                
                try
                {
                    var parsedResponse = JObject.Parse(jsonMatch.Value);
                    Console.WriteLine("Successfully parsed JSON response");
                    
                    // Format the response with case-insensitive field matching
                    return new VegetableAnalysisResult
                    {
                        VegetableName = GetStringValue(parsedResponse, new[] { "vegetableName", "Vegetable Name", "VegetableName" }, "Unknown"),
                        SafeToEat = GetBoolValue(parsedResponse, new[] { "safeToEat", "Safe to Eat", "SafeToEat" }, false),
                        DiseaseName = GetStringValue(parsedResponse, new[] { "diseaseName", "Disease Name", "DiseaseName" }, null),
                        Recommendation = GetStringValue(parsedResponse, new[] { "recommendation", "Recommendation" }, "No recommendation available.")
                    };
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error parsing LLM JSON response: {ex.Message}");
                    // Try to extract the data manually if JSON parsing fails
                    return ExtractDataFromText(llmResponse);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error analyzing image: {ex.Message}");
                throw;
            }
        }

        private VegetableAnalysisResult ExtractDataFromText(string text)
        {
            var result = new VegetableAnalysisResult();
            
            // Extract vegetable name
            var vegetableNameMatch = System.Text.RegularExpressions.Regex.Match(text, @"Vegetable Name:?\s*([^\n]+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            if (vegetableNameMatch.Success)
            {
                result.VegetableName = vegetableNameMatch.Groups[1].Value.Trim();
            }
            
            // Extract safe to eat
            var safeToEatMatch = System.Text.RegularExpressions.Regex.Match(text, @"Safe to Eat:?\s*(true|false|yes|no)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            if (safeToEatMatch.Success)
            {
                var safeValue = safeToEatMatch.Groups[1].Value.ToLower();
                result.SafeToEat = safeValue == "true" || safeValue == "yes";
            }
            
            // Extract disease name
            var diseaseNameMatch = System.Text.RegularExpressions.Regex.Match(text, @"Disease Name:?\s*([^\n]+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            if (diseaseNameMatch.Success)
            {
                result.DiseaseName = diseaseNameMatch.Groups[1].Value.Trim();
                // Check if it's "none" or empty
                if (result.DiseaseName.ToLower() == "none" || string.IsNullOrEmpty(result.DiseaseName))
                {
                    result.DiseaseName = null;
                }
            }
            
            // Extract recommendation
            var recommendationMatch = System.Text.RegularExpressions.Regex.Match(text, @"Recommendation:?\s*([^\n]+(?:\n[^\n]+)*)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            if (recommendationMatch.Success)
            {
                result.Recommendation = recommendationMatch.Groups[1].Value.Trim();
            }
            
            return result;
        }

        private string GetStringValue(JObject json, string[] possibleKeys, string defaultValue)
        {
            foreach (var key in possibleKeys)
            {
                if (json[key] != null)
                {
                    return json[key].ToString();
                }
            }
            return defaultValue;
        }

        private bool GetBoolValue(JObject json, string[] possibleKeys, bool defaultValue)
        {
            foreach (var key in possibleKeys)
            {
                if (json[key] != null)
                {
                    if (json[key].Type == JTokenType.Boolean)
                    {
                        return json[key].Value<bool>();
                    }
                    else
                    {
                        var stringValue = json[key].ToString().ToLower();
                        if (stringValue == "true" || stringValue == "yes")
                        {
                            return true;
                        }
                        else if (stringValue == "false" || stringValue == "no")
                        {
                            return false;
                        }
                    }
                }
            }
            return defaultValue;
        }
    }

    public class VegetableAnalysisResult
    {
        [JsonProperty("vegetableName")]
        public string VegetableName { get; set; } = "Unknown";
        
        [JsonProperty("safeToEat")]
        public bool SafeToEat { get; set; } = false;
        
        [JsonProperty("diseaseName")]
        public string? DiseaseName { get; set; } = null;
        
        [JsonProperty("recommendation")]
        public string Recommendation { get; set; } = "No recommendation available.";
    }
}
