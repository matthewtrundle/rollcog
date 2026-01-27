/**
 * Image Generation Script for Rollcog Website
 * Uses OpenRouter API with Gemini 2.5 Flash Image model
 *
 * Run: node scripts/generate-images.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables manually (since this is a standalone script)
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const OPENROUTER_API_KEY = envVars.OPENROUTER_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images');

if (!OPENROUTER_API_KEY) {
  console.error('Error: OPENROUTER_API_KEY not found in .env.local');
  process.exit(1);
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Image prompts for each page
 * Following organic design philosophy - authentic, industrial, human-centered
 */
const IMAGE_PROMPTS = [
  {
    filename: 'hero-roofing-team.png',
    prompt: `Professional commercial roofing crew working on a large flat roof during golden hour.
    Workers wearing safety gear (hard hats, harnesses) installing white TPO membrane.
    Industrial urban backdrop with Chicago skyline visible in distance.
    Authentic documentary photography style, warm natural lighting,
    shows teamwork and professionalism. Shot from slightly elevated angle.
    NO text, logos, or watermarks. Photorealistic.`,
  },
  {
    filename: 'tpo-roofing-installation.png',
    prompt: `Close-up of professional roofer heat-welding white TPO roofing membrane seams on commercial building.
    Worker using hot air welder tool, wearing safety gloves and protective gear.
    Clean white reflective TPO surface visible, showing proper installation technique.
    Bright daylight, blue sky with some clouds in background.
    Authentic industrial photography, documentary style.
    NO text, logos, or watermarks. Photorealistic.`,
  },
  {
    filename: 'mod-bit-torch-applied.png',
    prompt: `Commercial roofer applying modified bitumen roofing with propane torch on flat roof.
    Flame visible as worker carefully heats the membrane to create waterproof seal.
    Worker wearing full safety equipment including fire-resistant clothing.
    Industrial rooftop setting with HVAC equipment visible in background.
    Dramatic lighting from torch flame, professional craftsmanship.
    NO text, logos, or watermarks. Photorealistic.`,
  },
  {
    filename: 'flat-roof-repair.png',
    prompt: `Two commercial roofing workers inspecting and repairing damage on flat roof.
    One worker pointing to problem area while another prepares repair materials.
    Damaged section of roof visible with ponding water nearby.
    Overcast sky suggesting urgency of repair work.
    Authentic work documentation style, realistic industrial setting.
    NO text, logos, or watermarks. Photorealistic.`,
  },
  {
    filename: 'commercial-warehouse-roofing.png',
    prompt: `Aerial view of large industrial warehouse with newly installed commercial flat roof.
    White reflective roofing membrane covering entire building.
    Loading docks and trucks visible at ground level.
    Suburban industrial park setting with other commercial buildings nearby.
    Clear sunny day, architectural photography style.
    NO text, logos, or watermarks. Photorealistic.`,
  },
  {
    filename: 'roofing-inspection.png',
    prompt: `Professional roof inspector in hard hat and safety vest examining flat commercial roof.
    Inspector using tablet or clipboard to document findings.
    Background shows rooftop with HVAC units, vents, and skylights.
    Professional business setting, clean and organized appearance.
    Natural daylight, documentary photography style.
    NO text, logos, or watermarks. Photorealistic.`,
  },
];

/**
 * Generate an image using OpenRouter API
 */
async function generateImage(prompt, filename) {
  console.log(`\nGenerating: ${filename}`);
  console.log(`Prompt: ${prompt.substring(0, 100)}...`);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://rollcogroofing.com',
        'X-Title': 'Rollcog Website Image Generation',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        modalities: ['text', 'image'],
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Extract the image from the response
    const assistantMessage = data.choices?.[0]?.message;

    // Handle different response formats
    let imageBase64 = null;

    // Format 1: images array with image_url objects (OpenRouter Gemini format)
    if (assistantMessage?.images && assistantMessage.images.length > 0) {
      const img = assistantMessage.images[0];
      if (typeof img === 'string') {
        imageBase64 = img;
      } else if (img?.image_url?.url) {
        // OpenRouter Gemini format: { type: "image_url", image_url: { url: "data:..." } }
        imageBase64 = img.image_url.url;
      } else if (img?.data) {
        imageBase64 = img.data;
      } else if (img?.url) {
        imageBase64 = img.url;
      }
    }

    // Format 2: content array with image_url type
    if (!imageBase64 && Array.isArray(assistantMessage?.content)) {
      for (const part of assistantMessage.content) {
        if (part.type === 'image_url' && part.image_url?.url) {
          imageBase64 = part.image_url.url;
          break;
        }
        if (part.type === 'image' && part.source?.data) {
          imageBase64 = `data:${part.source.media_type || 'image/png'};base64,${part.source.data}`;
          break;
        }
      }
    }

    // Format 3: inline_data in content parts
    if (!imageBase64 && Array.isArray(assistantMessage?.content)) {
      for (const part of assistantMessage.content) {
        if (part.inline_data?.data) {
          imageBase64 = `data:${part.inline_data.mime_type || 'image/png'};base64,${part.inline_data.data}`;
          break;
        }
      }
    }

    // Format 4: string content with embedded base64
    if (!imageBase64 && typeof assistantMessage?.content === 'string') {
      const match = assistantMessage.content.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
      if (match) {
        imageBase64 = match[0];
      }
    }

    if (!imageBase64) {
      console.log('Response structure:', JSON.stringify(assistantMessage, null, 2).substring(0, 500));
      throw new Error('No image found in response');
    }

    // Extract raw base64 data
    let base64Data = imageBase64;
    if (base64Data.includes('base64,')) {
      base64Data = base64Data.split('base64,')[1];
    }

    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Save the image
    const outputPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`✓ Saved: ${outputPath} (${imageBuffer.length} bytes)`);
    return true;

  } catch (error) {
    console.error(`✗ Error generating ${filename}:`, error.message);
    return false;
  }
}

/**
 * Main function - generate all images
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Rollcog Website Image Generation');
  console.log('Using OpenRouter API with Gemini 2.5 Flash Image');
  console.log('='.repeat(60));
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Images to generate: ${IMAGE_PROMPTS.length}`);

  let successCount = 0;
  let failCount = 0;

  for (const { filename, prompt } of IMAGE_PROMPTS) {
    // Add a small delay between requests to avoid rate limiting
    if (successCount + failCount > 0) {
      console.log('\nWaiting 2 seconds before next request...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const success = await generateImage(prompt, filename);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Generation Complete');
  console.log(`Success: ${successCount}/${IMAGE_PROMPTS.length}`);
  console.log(`Failed: ${failCount}/${IMAGE_PROMPTS.length}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
