// Variables
let currentRound = 1;
let score = 0;
let currentMeal = null;
let discoveredMeals = [];

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const startScreen = document.getElementById('start-screen');
    const loadingScreen = document.getElementById('loading-screen');
    const gameScreen = document.getElementById('game-screen');
    const feedbackScreen = document.getElementById('feedback-screen');
    const endScreen = document.getElementById('end-screen');

    const startButton = document.getElementById('start-button');
    const guessForm = document.getElementById('guess-form');
    const nextRoundButton = document.getElementById('next-round-button');
    const restartButton = document.getElementById('restart-button');

    const currentRoundDisplay = document.getElementById('current-round');
    const currentScoreDisplay = document.getElementById('current-score');
    const finalScoreDisplay = document.getElementById('final-score');
    const mealsSummaryList = document.getElementById('meals-summary-list');
    const mealImg = document.getElementById('meal-img');
    const ingredientsList = document.getElementById('ingredients-list');
    const instructionsText = document.getElementById('instructions-text');
    const feedbackContent = document.getElementById('feedback-content');
    const revealedMealName = document.getElementById('revealed-meal-name');
    const revealedCuisine = document.getElementById('revealed-cuisine');
    const revealedCategory = document.getElementById('revealed-category');

    // Event listeners
    startButton.addEventListener('click', startGame);
    guessForm.addEventListener('submit', handleGuess);
    nextRoundButton.addEventListener('click', nextRound);
    restartButton.addEventListener('click', restartGame);

    function showScreen(screen) {
        [startScreen, loadingScreen, gameScreen, feedbackScreen, endScreen].forEach(s => {
            s.classList.remove('active');
        });
        screen.classList.add('active');
        window.scrollTo(0, 0);
    }

    function startGame() {
        currentRound = 1;
        score = 0;
        discoveredMeals = [];
        updateGameInfo();
        showScreen(loadingScreen);
        fetchRandomMeal();
    }

    // Fetching a random meal from TheMealDB API
    async function fetchRandomMeal() {
        try {
            const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.meals && data.meals.length > 0) {
                currentMeal = data.meals[0];
                displayMeal(currentMeal);
                showScreen(gameScreen);
            } else {
                throw new Error('No meal found');
            }
        } catch (error) {
            console.error('Error fetching meal:', error);
            setTimeout(fetchRandomMeal, 1000);
        }
    }

    function getIngredients(meal) {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            
            if (ingredient && ingredient.trim() !== '') {
                ingredients.push({
                    name: ingredient,
                    measure: measure || ''
                });
            }
        }
        
        return ingredients;
    }

    function displayMeal(meal) {
        mealImg.src = meal.strMealThumb;
        mealImg.alt = "Mystery Meal";
        const ingredients = getIngredients(meal);
        ingredientsList.innerHTML = '';
        
        ingredients.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.measure} ${item.name}`.trim();
            ingredientsList.appendChild(li);
        });
        instructionsText.textContent = meal.strInstructions;
        updateGameInfo();
    }

    function updateGameInfo() {
        currentRoundDisplay.textContent = currentRound;
        currentScoreDisplay.textContent = score;
    }

    function handleGuess(event) {
        event.preventDefault();
        
        const guessInput = document.getElementById('guess-input');
        const userGuess = guessInput.value.trim();
        
        if (!userGuess) {
            alert('Please select your guess!');
            return;
        }
        
        const isCorrect = checkGuess(userGuess);
        discoveredMeals.push({
            name: currentMeal.strMeal,
            cuisine: currentMeal.strArea || 'Unknown',
            category: currentMeal.strCategory || 'Unknown',
            image: currentMeal.strMealThumb,
            userGuessedCorrectly: isCorrect
        });
        displayFeedback(isCorrect);
        guessForm.reset();
    }

    function checkGuess(guess) {
        return (
            (currentMeal.strArea && guess.toLowerCase() === currentMeal.strArea.toLowerCase()) ||
            (currentMeal.strCategory && guess.toLowerCase() === currentMeal.strCategory.toLowerCase())
        );
    }

    function displayFeedback(isCorrect) {
        if (isCorrect) {
            feedbackContent.textContent = "Correct! Well done! 🎉";
            feedbackContent.className = "feedback-correct";
            score++;
        } else {
            feedbackContent.textContent = "Sorry, that's not correct! 😕";
            feedbackContent.className = "feedback-incorrect";
        }
        
        revealedMealName.textContent = currentMeal.strMeal;
        revealedCuisine.textContent = currentMeal.strArea || 'Unknown';
        revealedCategory.textContent = currentMeal.strCategory || 'Unknown';
        updateGameInfo();
        showScreen(feedbackScreen);
        if (currentRound === 3) {
            nextRoundButton.textContent = "See Final Results";
        }
    }

    function nextRound() {
        if (currentRound < 3) {
            currentRound++;
            showScreen(loadingScreen);
            fetchRandomMeal();
        } else {
            endGame();
        }
    }

    function endGame() {
        finalScoreDisplay.textContent = score;
        mealsSummaryList.innerHTML = '';
        discoveredMeals.forEach((meal, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${index + 1}. ${meal.name}</strong>
                <br>Cuisine: ${meal.cuisine}
                <br>Category: ${meal.category}
                <br>${meal.userGuessedCorrectly ? '✅ You guessed correctly!' : '❌ You missed this one!'}
            `;
            mealsSummaryList.appendChild(li);
        });
        showScreen(endScreen);
    }

    function restartGame() {
        nextRoundButton.textContent = "Next Round";
        startGame();
    }
});