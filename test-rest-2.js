
const apiKey = "AIzaSyArZO0PRFdaw25rg4Qqa-8hedq_e8VESzA";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

async function testRest() {
    console.log("Testing API Key with gemini-pro...");
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "Hello" }]
                }]
            })
        });

        if (!response.ok) {
            console.error("REST Error Status:", response.status);
            const text = await response.text();
            console.error("Response:", text);
        } else {
            const data = await response.json();
            console.log("SUCCESS! REST Response:");
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testRest();
