import parser from 'lambda-multipart-parser';
import OpenAI from 'openai';

export const handler = async (event, context) => {
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // Parse the multipart form data
        const result = await parser.parse(event);
        const file = result.files[0];
        
        if (!file) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'No bill file uploaded.' })
            };
        }

        const base64Image = file.content.toString('base64');
        const mimeType = file.contentType;

        // Initialize OpenAI using Netlify environment variables
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const response = await openai.beta.chat.completions.parse({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        { 
                            type: "text", 
                            text: "Analyze this receipt or bill image. Extract the vendor name, date of issue, transaction total amount (specifically in Indian Rupees, INR), and classify it into one of these categories: Food, Utilities, Shopping, or Others. Ensure the extracted amount is a numeric value representing the total price in INR." 
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType};base64,${base64Image}`
                            }
                        }
                    ],
                },
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "bill_extraction",
                    strict: true,
                    schema: {
                        type: "object",
                        properties: {
                            vendor: { type: "string" },
                            amount: { type: "number" },
                            date: { type: "string", description: "Format: YYYY-MM-DD" },
                            category: { type: "string", enum: ["Food", "Utilities", "Shopping", "Others"] }
                        },
                        required: ["vendor", "amount", "date", "category"],
                        additionalProperties: false
                    }
                }
            }
        });

        const extractedData = response.choices[0].message.parsed;

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ success: true, data: extractedData })
        };

    } catch (error) {
        console.error("OCR Pipeline Error:", error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: "Failed to parse receipt data.", details: error.message })
        };
    }
};
