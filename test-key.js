
import { GoogleGenAI } from "@google/genai";

const apiKey = "AIzaSyArZO0PRFdaw25rg4Qqa-8hedq_e8VESzA";

async function testKey() {
    console.log("Testing API Key...");
    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: "Say 'Hello' if you can hear me."
        });

        console.log("SUCCESS! API Responded:");
        console.log(response.text());
    } catch (error) {
        console.error("ERROR! API Failed:");
        console.error(error.message);
        if (error.status) console.error("Status:", error.status);
    }
}

testKey();
