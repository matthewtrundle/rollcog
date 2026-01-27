#!/usr/bin/env node
/**
 * Generate blog post images using OpenRouter API
 */

const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
for (const line of envLines) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim();
  }
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '../public/images/blog');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const blogImages = [
  {
    filename: 'tpo-vs-epdm-hero.jpg',
    prompt: 'Professional photograph of a commercial flat roof showing white TPO membrane on one side and black EPDM rubber roofing on the other side, split view comparison, industrial building rooftop, bright daylight, high quality architectural photography, no text or labels'
  },
  {
    filename: 'roof-damage-signs-hero.jpg',
    prompt: 'Professional photograph of a commercial flat roof showing visible damage signs including ponding water, blistering membrane, and worn areas, industrial rooftop inspection scene, overcast sky, realistic commercial roofing photography, no text'
  },
  {
    filename: 'roof-maintenance-checklist-hero.jpg',
    prompt: 'Professional photograph of a roofing contractor in safety gear inspecting a commercial flat roof with a clipboard, checking drains and membrane condition, industrial building rooftop, blue sky, high quality commercial photography, no text'
  },
  {
    filename: 'roof-lifespan-hero.jpg',
    prompt: 'Professional photograph showing multiple commercial buildings with different types of flat roofing systems, aerial perspective, urban industrial area, variety of roof ages and conditions visible, bright daylight, architectural photography, no text'
  },
  {
    filename: 'warranty-guide-hero.jpg',
    prompt: 'Professional photograph of a commercial roofing contractor shaking hands with a building owner on a rooftop, warranty documents visible, completed roof installation in background, professional business setting, bright daylight, no text'
  },
  {
    filename: 'cool-roof-hero.jpg',
    prompt: 'Professional photograph of a bright white reflective commercial roof membrane installation, energy efficient TPO or PVC roofing, sunlight reflecting off the white surface, industrial building, blue sky, high quality roofing photography, no text'
  },
  {
    filename: 'roof-replacement-process-hero.jpg',
    prompt: 'Professional photograph of commercial roof replacement in progress, workers installing new roofing membrane, old roof partially removed showing layers, crane or equipment visible, active construction site on rooftop, no text'
  },
  {
    filename: 'mod-bit-chicago-hero.jpg',
    prompt: 'Professional photograph of modified bitumen roofing installation on a Chicago commercial building, torch-applied membrane work, Chicago skyline visible in background, industrial roofing crew at work, overcast Midwest weather, no text'
  },
  {
    filename: 'choose-contractor-hero.jpg',
    prompt: 'Professional photograph of a commercial roofing contractor team in uniform standing in front of their work truck with company branding, professional appearance, commercial building in background, confident and trustworthy look, no text on image'
  },
  {
    filename: 'emergency-repair-hero.jpg',
    prompt: 'Professional photograph of emergency commercial roof repair work, contractor patching a leak on a flat roof during or after rain, wet conditions, urgent repair scene, tarps and repair materials visible, dramatic lighting, no text'
  }
];

async function generateImage(prompt, filename) {
  console.log(`Generating: ${filename}...`);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://rollcogroofing.com',
        'X-Title': 'Rollcog Blog Image Generator'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text'],
        image_config: {
          aspect_ratio: '16:9'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Extract image from response - handle multiple formats
    const message = data.choices?.[0]?.message;

    // Check for images array (Google/OpenRouter format)
    if (message?.images && Array.isArray(message.images) && message.images.length > 0) {
      const imageData = message.images[0];
      let base64Data = null;

      // Handle nested image_url.url format (Google via OpenRouter)
      if (imageData.type === 'image_url' && imageData.image_url?.url) {
        base64Data = imageData.image_url.url.replace(/^data:image\/\w+;base64,/, '');
      } else if (typeof imageData === 'string') {
        base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      } else if (imageData.url) {
        base64Data = imageData.url.replace(/^data:image\/\w+;base64,/, '');
      } else if (imageData.data) {
        base64Data = imageData.data;
      } else if (imageData.base64) {
        base64Data = imageData.base64;
      }

      if (base64Data) {
        const buffer = Buffer.from(base64Data, 'base64');
        const outputPath = path.join(OUTPUT_DIR, filename);
        fs.writeFileSync(outputPath, buffer);
        console.log(`  Saved: ${outputPath}`);
        return true;
      }
    }

    // Check for content array format (OpenAI format)
    const content = message?.content;
    if (Array.isArray(content)) {
      for (const part of content) {
        if (part.type === 'image_url' && part.image_url?.url) {
          const base64Data = part.image_url.url.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const outputPath = path.join(OUTPUT_DIR, filename);
          fs.writeFileSync(outputPath, buffer);
          console.log(`  Saved: ${outputPath}`);
          return true;
        }
      }
    }

    console.log(`  Warning: No image found in response for ${filename}`);
    console.log('  Full response:', JSON.stringify(data, null, 2).substring(0, 1000));
    return false;

  } catch (error) {
    console.error(`  Error generating ${filename}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('Starting blog image generation...\n');

  if (!OPENROUTER_API_KEY) {
    console.error('Error: OPENROUTER_API_KEY not found in .env.local');
    process.exit(1);
  }

  let successCount = 0;

  for (const image of blogImages) {
    const success = await generateImage(image.prompt, image.filename);
    if (success) successCount++;
    // Add delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\nComplete! Generated ${successCount}/${blogImages.length} images.`);
}

main();
