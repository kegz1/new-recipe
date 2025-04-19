const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure OpenAI with your API key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Create the recipe generation endpoint
app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { ingredients, dietaryPreference, fitnessGoal, options } = req.body;
    
    // Build the system prompt
    const systemPrompt = `You are a world-class performance nutritionist and elite chef operating inside the Hyperbolic Time Chamber. You specialize in fitness-optimized cuisine, blending evidence-based sports nutrition with culinary excellence. Your recipes perfectly balance scientific nutritional principles with gourmet cooking techniques to create meals that are both functional and delicious.

Create a detailed recipe based on ONLY the ingredients provided, considering the dietary preference and fitness goal. Format your response with HTML as follows:

<div class="recipe-container">
  <h1 class="recipe-title">[Recipe Name]</h1>
  
  <div class="recipe-meta">
    <p class="recipe-description">[Brief, enticing description of the dish and its benefits]</p>
    
    <div class="recipe-details">
      <span class="detail"><strong>Servings:</strong> [Number]</span>
      <span class="detail"><strong>Prep Time:</strong> [Time in minutes]</span>
      <span class="detail"><strong>Cook Time:</strong> [Time in minutes]</span>
      <span class="detail"><strong>Total Time:</strong> [Time in minutes]</span>
      <span class="detail"><strong>Difficulty:</strong> [Easy/Medium/Hard]</span>
    </div>
  </div>

  <div class="recipe-content">
    <div class="ingredients-section">
      <h2>Ingredients</h2>
      <ul class="ingredients-list">
        [List each ingredient with precise measurements]
      </ul>
    </div>`;
    
    // Add optional sections
    let fullPrompt = systemPrompt;
    
    if (options.requiredEquipment) {
      fullPrompt += `
      <div class="equipment-section">
        <h2>Required Equipment</h2>
        <ul class="equipment-list">
          [List necessary cooking equipment]
        </ul>
      </div>`;
    }
    
    // Add instructions section
    fullPrompt += `
      <div class="instructions-section">
        <h2>Instructions</h2>
        <ol class="instructions-list">
          [Numbered, detailed step-by-step instructions]
        </ol>
      </div>
    </div>`;
    
    // Add nutritional info if selected
    if (options.nutritionalInformation) {
      fullPrompt += `
    <div class="nutrition-section">
      <h2>Nutritional Information (per serving)</h2>
      <ul class="nutrition-list">
        <li><strong>Calories:</strong> [Number]</li>
        <li><strong>Protein:</strong> [Number]g</li>
        <li><strong>Carbohydrates:</strong> [Number]g</li>
        <li><strong>Fat:</strong> [Number]g</li>
        <li><strong>Fiber:</strong> [Number]g</li>
      </ul>
    </div>`;
    }
    
    // Add fitness alignment section
    fullPrompt += `
    <div class="fitness-section">
      <h2>Fitness Goal Alignment</h2>
      <p>[Explain how this recipe specifically supports the selected fitness goal with scientific rationale]</p>
    </div>`;
    
    // Add tips if selected
    if (options.tipsAndVariations) {
      fullPrompt += `
    <div class="tips-section">
      <h2>Chef's Tips & Variations</h2>
      <ul class="tips-list">
        [List 2-3 cooking tips, potential substitutions, or variations]
      </ul>
    </div>`;
    }
    
    // Add storage instructions if selected
    if (options.storageInstructions) {
      fullPrompt += `
    <div class="storage-section">
      <h2>Storage Instructions</h2>
      <p>[How to store leftovers and for how long]</p>
    </div>`;
    }
    
    // Close the container div
    fullPrompt += `
</div>`;
    
    // Create user prompt
    const userPrompt = `
User Input:
- Available Ingredients: ${ingredients}
- Dietary Preference: ${dietaryPreference}
- Fitness Goal: ${fitnessGoal}
- Optional Sections: ${Object.keys(options).filter(key => options[key] === true).join(', ')}

Dietary Guidelines:
- High-Protein: Emphasize protein sources (30-40% of calories)
- Vegetarian: No meat/fish/poultry, may include dairy and eggs
- Vegan: No animal products whatsoever
- Keto: Very low carb (5-10% of calories), high fat (70-80%), moderate protein
- Paleo: Whole foods, no grains/dairy/legumes/processed foods
- High-Carb: Higher complex carbohydrate content (55-65% of calories)
- Low-Carb: Limited carbohydrates (under 25% of calories)
- Dairy-Free: No milk, cheese, butter, or other dairy products

Fitness Goal Guidelines:
- Endurance: Higher complex carbs (55-65%), moderate protein, lower fat
- Muscle Building: Higher protein (1.6-2.2g/kg), adequate carbs, strategic fats
- Fat Loss: Moderate caloric deficit, higher protein, fiber-rich ingredients
- Performance: Carbohydrate-focused for energy, strategic protein timing
- General Health: Balanced macros, nutrient-dense whole foods

Only use the ingredients provided by the user. Be creative but realistic.
`;
    
    // Call OpenAI API
    const response = await openai.createChatCompletion({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: fullPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
    });
    
    res.json({ recipe: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({ error: 'Failed to generate recipe' });
  }
});

// Add a simple home route
app.get('/', (req, res) => {
  res.send('Recipe Generator API is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});