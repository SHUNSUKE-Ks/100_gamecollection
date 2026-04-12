
import fs from 'fs';
import path from 'path';

// Simple script to fetch models using the key from .env
async function checkModels() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (!fs.existsSync(envPath)) {
            console.error('.env file not found');
            return;
        }

        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/VITE_GEMINI_API_KEY=["']?([^"'\s]+)["']?/);

        if (!match) {
            console.error('API KEY not found in .env');
            return;
        }

        const apiKey = match[1];
        console.log('Using API Key starts with:', apiKey.substring(0, 5) + '...');

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText}`);
            console.error(await response.text());
            return;
        }

        const data = await response.json();
        console.log('Available Models:');
        const models = data.models || [];
        models.forEach(m => {
            if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                console.log(`- ${m.name.replace('models/', '')} (${m.version})`);
            }
        });

    } catch (e) {
        console.error('Script failed:', e);
    }
}

checkModels();
