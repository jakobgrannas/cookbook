exports.getRecipeData = function domOperator (selector) {
	function getInstructions (instructions) {
		var result = [];

		for (var i=0; i < instructions.length; i++) {
			result.push(instructions[i].innerText.trim());
		}

		return result;
	}

	// TODO: Move to receptnu class or w/e
	function getIngredients (ingredients) {
		var result = [], ingredient;

		for (var i=0; i < ingredients.length; i++) {
			ingredient = ingredients[i];
			result.push({
				amount: ingredient.innerText.trim(),
				name: ingredient.nextElementSibling.innerText.trim()
			});
		}
		return result;
	}

	var ingredients = document.querySelectorAll('#ingredients .ingredient'),
		instructions = document.querySelectorAll('.step-by-step li > span'),
		resultObj = {
			title: document.querySelector('.basic-info h1').firstChild.textContent.trim(),
			cookingTime: document.querySelector('.basic-info .time').innerText.trim(),
			amountOfPersons: document.querySelector('.basic-info .amount').innerText.trim(),
			instructions: getInstructions(instructions),
			ingredients: getIngredients(ingredients)
		};

	return resultObj;
};