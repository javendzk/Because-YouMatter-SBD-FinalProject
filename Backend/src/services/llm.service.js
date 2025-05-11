const axios = require('axios');
require('dotenv').config();


exports.generateFeedback = async (dayDescription, mood) => {
    try {
        let promptTemplate = '';
        
        if (mood === 'awesome' || mood === 'good') {
            promptTemplate = `
            User's day description: ${dayDescription}
            User's mood: ${mood}
            
            Based on the above information, provide the following:
            1. A short, cheerful, and encouraging response celebrating their positive mood (1-2 sentences)
            2. A brief affirmation that reinforces their positive state and encourages them to keep it up (1 sentence)
            
            Make your response upbeat and happy, focusing on maintaining their positive emotional state.
            
            Format your response as a JSON object with these exact keys:
            {
                "webMessage": "Your cheerful response here", 
                "telegramMessage": "Your positive affirmation here"
            }
            `;
        } else {
            promptTemplate = `
            User's day description: ${dayDescription}
            User's mood: ${mood}
            
            Based on the above information, provide the following:
            1. A short, supportive, and empathetic response to the user that acknowledges their feelings (1-2 sentences)
            2. A brief constructive suggestion or coping strategy to help improve their wellbeing (1 sentence)
            
            Make your response warm, caring and supportive. Provide practical advice if their mood is 'bad' or 'terrible'.
            
            Format your response as a JSON object with these exact keys:
            {
                "webMessage": "Your supportive response here", 
                "telegramMessage": "Your suggestion or coping strategy here"
            }
            `;
        }

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: promptTemplate }],
                temperature: 0.7,
                max_tokens: 150
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            }
        );

        const content = response.data.choices[0].message.content;
        let parsedResponse;
        
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedResponse = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('Error parsing LLM response:', parseError);
            
            if (mood === 'awesome' || mood === 'good') {
                parsedResponse = {
                    webMessage: "That's fantastic! We're thrilled to see you're having a great day!",
                    telegramMessage: "Keep riding this positive wave and spread the joy!"
                };
            } else {
                parsedResponse = {
                    webMessage: "Thank you for sharing your feelings with us. It's okay to have days like this.",
                    telegramMessage: "Remember to be kind to yourself and take one step at a time."
                };
            }
        }
        
        return {
            message: JSON.stringify({ dayDescription, mood }),
            response: JSON.stringify(parsedResponse)
        };    } catch (error) {
        console.error('Error in generateFeedback service:', error);
        return {
            message: JSON.stringify({ dayDescription, mood }),
            response: JSON.stringify({
                webMessage: "Thank you for sharing your day with us. Keep up the good work!",
                telegramMessage: "Remember to take care of yourself and stay positive!"
            })
        };
    }
};
