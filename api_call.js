const express = require('express');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

const openai = new OpenAI({
  apiKey: process.env.GOOGLE_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
});

const systemPrompt = `
here's picture of a restaurant check (probably in Hebrew).
Extract items from Hebrew restaurant receipt image. Return a list of dictionaries with:
name:(string), try to find the most possible item menu based on the OCR...
`;

app.post('/analyze', async (req, res) => {
  const { image } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: 'gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'what are the items in this restaurant bill?' },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${image}` } }
          ]
        }
      ]
    });

    const cleaned = response.choices[0].message.content.trim().replace(/^`json\n?|`$/g, '');
    res.json(JSON.parse(cleaned));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error analyzing image');
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));