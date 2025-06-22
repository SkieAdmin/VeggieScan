import fetch from 'node-fetch';
import { prisma } from '../index.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// LM Studio API endpoints
const LM_STUDIO_BASE_URL = process.env.LM_STUDIO_BASE_URL;
const LM_STUDIO_CHAT_ENDPOINT = process.env.LM_STUDIO_CHAT_ENDPOINT;

/**
 * Check if LM Studio server is available
 * @returns {Promise<boolean>} Whether the server is available
 */
export const isLLMAvailable = async () => {
  try {
    const response = await fetch(`${LM_STUDIO_BASE_URL}/v1/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000 // 5 second timeout
    });
    
    return response.ok;
  } catch (error) {
    console.error('LLM availability check failed:', error);
    return false;
  }
};

/**
 * Analyze a vegetable image using LLM
 * @param {string} imageUrl - URL of the image to analyze
 * @returns {Promise<Object>} Analysis result
 */
export const analyzeVegetableImage = async (imageUrl) => {
  try {
    // Check if LLM is available
    const llmAvailable = await isLLMAvailable();
    
    if (!llmAvailable) {
      console.warn('LLM is not available. Using dataset for fallback analysis.');
      return await fallbackAnalysis(imageUrl);
    }
    
    // Prepare the prompt for LLM
    const prompt = `You're a VeggieScan: Visual Diagnosis of Vegetable Freshness and Contamination AI Assistant. Analyze the provided image and identify if it contains vegetables. Always return your response in JSON format.

If the image contains vegetables, provide:
- Vegetable Name
- Safe to Eat: true or false
- Disease Name (if applicable, or null)
- Recommendation

If the image is damaged/cut, add "(Proned to Bacteria)" to the vegetable name.

If the image is NOT a vegetable, set "vegetableName" to "invalid_image" and explain why it's not a vegetable.`;

    // Debug log to track the process
    console.log('Starting LLM analysis for image:', imageUrl);
    
    // Extract the image filename from the URL
    const imageFilename = imageUrl.split('/').pop();
    
    // Get current file directory (ES module equivalent of __dirname)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Construct the path to the uploads directory (2 levels up from services directory)
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    const imagePath = path.join(uploadsDir, imageFilename);
    
    console.log('Looking for image at path:', imagePath);
    
    // Read the image file and convert to base64
    let base64Image;
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      base64Image = imageBuffer.toString('base64');
      console.log('Successfully read image and converted to base64');
    } catch (error) {
      console.error('Error reading image file:', error);
      throw new Error(`Could not read image file: ${error.message}`);
    }
    
    // Make request to LLM Studio with base64 encoded image
    const response = await fetch(`${LM_STUDIO_BASE_URL}${LM_STUDIO_CHAT_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemma-3-4b',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });
    
    console.log('LLM request sent with base64 encoded image');

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the LLM response
    const llmResponse = data.choices[0].message.content;
    
    // Log the raw response for debugging
    console.log('Raw LLM response:', llmResponse);
    
    // Parse the JSON response from the LLM
    // The LLM might return a formatted response, so we need to extract just the JSON part
    const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error('No JSON found in response:', llmResponse);
      throw new Error('Failed to extract JSON from LLM response');
    }
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonMatch[0]);
      console.log('Successfully parsed JSON response:', parsedResponse);
    } catch (error) {
      console.error('Error parsing LLM JSON response:', error);
      // Try to extract the data manually if JSON parsing fails
      parsedResponse = extractDataFromText(llmResponse);
      console.log('Extracted data from text:', parsedResponse);
    }

    // Log the parsed response for debugging
    console.log('Parsed response before formatting:', parsedResponse);
    
    // Format the response with case-insensitive field matching
    const result = {
      vegetableName: parsedResponse.vegetableName || 
                    parsedResponse['Vegetable Name'] || 
                    parsedResponse['vegetableName'] || 
                    parsedResponse['VegetableName'] || 
                    'Unknown',
      safeToEat: parsedResponse.safeToEat === true || 
                parsedResponse['Safe to Eat'] === true || 
                parsedResponse['SafeToEat'] === true || 
                parsedResponse['safeToEat'] === true || 
                String(parsedResponse.SafeToEat).toLowerCase() === 'true' ||
                String(parsedResponse['Safe to Eat']).toLowerCase() === 'true',
      diseaseName: parsedResponse.diseaseName || 
                  parsedResponse['Disease Name'] || 
                  parsedResponse['DiseaseName'] || 
                  parsedResponse['diseaseName'] || 
                  null,
      recommendation: parsedResponse.recommendation || 
                     parsedResponse['Recommendation'] || 
                     parsedResponse['recommendation'] || 
                     'No recommendation available.'
    };
    
    // Log the final formatted result
    console.log('Formatted result:', result);

    // Save the result to the dataset for future use
    await saveToDataset(result);

    return result;
  } catch (error) {
    console.error('Error analyzing vegetable image:', error);
    return await fallbackAnalysis(imageUrl);
  }
};

/**
 * Extract data from text when JSON parsing fails
 * @param {string} text - LLM response text
 * @returns {Object} Extracted data
 */
const extractDataFromText = (text) => {
  const result = {};
  
  // Extract vegetable name
  const vegetableNameMatch = text.match(/Vegetable Name:?\s*([^\n]+)/i);
  if (vegetableNameMatch) {
    result.vegetableName = vegetableNameMatch[1].trim();
  }
  
  // Extract safe to eat
  const safeToEatMatch = text.match(/Safe to Eat:?\s*(true|false|yes|no)/i);
  if (safeToEatMatch) {
    const safeValue = safeToEatMatch[1].toLowerCase();
    result.safeToEat = safeValue === 'true' || safeValue === 'yes';
  }
  
  // Extract disease name
  const diseaseNameMatch = text.match(/Disease Name:?\s*([^\n]+)/i);
  if (diseaseNameMatch) {
    result.diseaseName = diseaseNameMatch[1].trim();
    // Check if it's "none" or empty
    if (result.diseaseName.toLowerCase() === 'none' || result.diseaseName === '') {
      result.diseaseName = null;
    }
  }
  
  // Extract recommendation
  const recommendationMatch = text.match(/Recommendation:?\s*([^\n]+(?:\n[^\n]+)*)/i);
  if (recommendationMatch) {
    result.recommendation = recommendationMatch[1].trim();
  }
  
  return result;
};

/**
 * Save analysis result to dataset
 * @param {Object} result - Analysis result
 */
const saveToDataset = async (result) => {
  try {
    await prisma.dataset.create({
      data: {
        vegetableName: result.vegetableName,
        isSafe: result.safeToEat,
        diseaseName: result.diseaseName,
        recommendation: result.recommendation,
        imagePath: null // We don't have the image path here
      }
    });
  } catch (error) {
    console.error('Error saving to dataset:', error);
  }
};

/**
 * Fallback analysis when LLM is not available
 * @param {string} imageUrl - URL of the image to analyze
 * @returns {Promise<Object>} Analysis result from dataset
 */
const fallbackAnalysis = async (imageUrl) => {
  try {
    console.warn('Using fallback analysis - this should only happen if LLM is unavailable');
    
    // Return a clear error message instead of guessing
    return {
      vegetableName: 'Analysis Failed',
      safeToEat: false,
      diseaseName: null,
      recommendation: 'Unable to analyze image with LLM. Please try again later or contact support.'
    };
    
    /* Disabling random dataset selection as it's causing confusion
    // Try to find a similar vegetable in the dataset
    // This is a very simple implementation - in a real system, you might use image features or embeddings
    
    // Get the most common vegetable from the dataset
    const mostCommonVegetable = await prisma.dataset.groupBy({
      by: ['vegetableName'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 1
    });
    
    if (mostCommonVegetable.length === 0) {
      // If dataset is empty, return a default response
      return {
        vegetableName: 'Unknown',
        safeToEat: false,
        diseaseName: null,
        recommendation: 'Unable to analyze image. LLM is unavailable and no dataset exists for fallback.'
      };
    }
    
    // Get a random entry for this vegetable type
    const vegetableName = mostCommonVegetable[0].vegetableName;
    const vegetableEntries = await prisma.dataset.findMany({
      where: {
        vegetableName
      }
    });
    
    const randomEntry = vegetableEntries[Math.floor(Math.random() * vegetableEntries.length)];
    
    return {
      vegetableName: randomEntry.vegetableName,
      safeToEat: randomEntry.isSafe,
      diseaseName: randomEntry.diseaseName,
      recommendation: randomEntry.recommendation + ' (NOTE: LLM is unavailable. This analysis is based on historical data and may not be accurate for your specific image.)'
    };
    */
  } catch (error) {
    console.error('Error in fallback analysis:', error);
    return {
      vegetableName: 'Error',
      safeToEat: false,
      diseaseName: null,
      recommendation: 'Unable to analyze image. LLM is unavailable and fallback analysis failed.'
    };
  }
};
