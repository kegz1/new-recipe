// Recipe Generator Implementation - Browser Version

// Function to generate a recipe based on user inputs
async function generateRecipe(ingredients, dietaryPreference, fitnessGoal, options = {}) {
  // Show loading animation
  document.getElementById('recipe-output').innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">Deep Senzu Thinking</div>
    </div>
  `;

  // Check if there are enough ingredients
  if (!ingredients || ingredients.trim().split(',').length < 2) {
    return document.getElementById('recipe-output').innerHTML = `
      <div class="error-message">
        <h2>Insufficient Ingredients</h2>
        <p>Please provide at least two ingredients for a better recipe suggestion.</p>
      </div>
    `;
  }

  // Get your OpenAI API key - in a real app, you would handle this more securely
  let apiKey = localStorage.getItem('openai_api_key');
  if (!apiKey) {
    apiKey = prompt("Please enter your OpenAI API key (it will be saved for future use):");
    if (!apiKey) {
      return document.getElementById('recipe-output').innerHTML = `
        <div class="error-message">
          <h2>API Key Required</h2>
          <p>An OpenAI API key is required to generate recipes.</p>
        </div>
      `;
    }
    localStorage.setItem('openai_api_key', apiKey);
  }

  // Build base prompt
  const basePrompt = `You are a world-class performance nutritionist and elite chef operating inside the Hyperbolic Time Chamber. You specialize in fitness-optimized cuisine, blending evidence-based sports nutrition with culinary excellence. Your recipes perfectly balance scientific nutritional principles with gourmet cooking techniques to create meals that are both functional and delicious.

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

  // Add optional sections based on user selection
  let fullPrompt = basePrompt;
  
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

  const userInput = `
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

  try {
    console.log("Generate button clicked"); // Log button click
    console.log("Generating recipe with the following inputs:", {
        ingredients,
        dietaryPreference,
        fitnessGoal,
        options
    });

    // Use the fetch API to call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: fullPrompt },
          { role: "user", content: userInput }
        ],
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API response received:", data);

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No recipe generated. Please try again with different ingredients.");
    }

    // Display the generated recipe
    document.getElementById('recipe-output').innerHTML = data.choices[0].message.content;
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating recipe:', error);
    document.getElementById('recipe-output').innerHTML = `
      <div class="error-message">
        <h2>Error Generating Recipe</h2>
        <p>${error.message || 'There was a problem creating your recipe. Please try again with different ingredients.'}</p>
      </div>
    `;
  }
}

// Set up event listeners when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Set up the optional buttons to toggle selected class when clicked
  const optionalButtons = document.querySelectorAll('.optional-buttons button');
  optionalButtons.forEach(button => {
    button.addEventListener('click', function() {
      this.classList.toggle('selected');
      console.log(`Button ${this.id} toggled to ${this.classList.contains('selected') ? 'selected' : 'unselected'}`);
    });
  });
  
  // Set up the generate button click handler
  const generateButton = document.getElementById('generate-button');
  if (generateButton) {
    generateButton.addEventListener('click', async function() {
      const ingredients = document.getElementById('ingredients-input').value;
      
      const dietaryPreferenceDropdown = document.getElementById('dietary-preference');
      const dietaryPreference = dietaryPreferenceDropdown.options[dietaryPreferenceDropdown.selectedIndex].text;
      
      const fitnessGoalDropdown = document.getElementById('fitness-goal');
      const fitnessGoal = fitnessGoalDropdown.options[fitnessGoalDropdown.selectedIndex].text;
      
      // Get optional toggles - check if they have the 'selected' class
      const options = {
        nutritionalInformation: document.getElementById('nutrition-toggle').classList.contains('selected'),
        requiredEquipment: document.getElementById('equipment-toggle').classList.contains('selected'),
        tipsAndVariations: document.getElementById('tips-toggle').classList.contains('selected'),
        storageInstructions: document.getElementById('storage-toggle').classList.contains('selected')
      };
      
      console.log("Options selected:", options);
      await generateRecipe(ingredients, dietaryPreference, fitnessGoal, options);
    });
  }
});