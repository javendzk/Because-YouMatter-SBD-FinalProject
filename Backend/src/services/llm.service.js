const axios = require('axios');
require('dotenv').config();

exports.analyzeMood = async (activity, dayDescription) => {
    try {
        const prompt = `
        Analyze the following daily activity and description and determine the user's mood based on the content.
        User's activity: ${activity}
        User's day description: ${dayDescription}
        
        Classify the mood as one of the following options ONLY:
        - "awesome" (for very positive mood)
        - "good" (for positive mood)
        - "okay" (for neutral mood)
        - "bad" (for negative mood)
        - "terrible" (for very negative mood)
        
        Respond with ONLY one of these five words, no additional text.
        `;

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 10
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            }
        );

        let mood = response.data.choices[0].message.content.trim().toLowerCase();
        
        const validMoods = ['awesome', 'good', 'okay', 'bad', 'terrible'];
        if (!validMoods.includes(mood)) {
            mood = 'okay';
        }
        
        return mood;
    } catch (error) {
        console.error('Error in analyzeMood service:', error);
        return 'okay';
    }
};

exports.generateFeedback = async (activity, dayDescription, mood) => {
    try {
        const prompt = `
        User's activity: ${activity}
        User's day description: ${dayDescription}
        User's mood: ${mood}
        
        Based on the above information, provide the following:
        1. A short, supportive, and empathetic response to the user (1-2 sentences)
        2. A brief affirmation or suggestion to help improve their wellbeing (1 sentence)
        
        Format your response as a JSON object with these exact keys:
        {
            "webMessage": "Your supportive response here", 
            "telegramMessage": "Your affirmation or suggestion here"
        }
        `;

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
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
            parsedResponse = {
                webMessage: "Thank you for sharing your day with us. Keep up the good work!",
                telegramMessage: "Remember to take care of yourself and stay positive!"
            };
        }
        
        return {
            message: JSON.stringify({ activity, dayDescription, mood }),
            response: JSON.stringify(parsedResponse)
        };
    } catch (error) {
        console.error('Error in generateFeedback service:', error);
        return {
            message: JSON.stringify({ activity, dayDescription, mood }),
            response: JSON.stringify({
                webMessage: "Thank you for sharing your day with us. Keep up the good work!",
                telegramMessage: "Remember to take care of yourself and stay positive!"
            })
        };
    }
};
