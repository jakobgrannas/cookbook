/**
 * RecipeController
 *
 * @module      :: Controller
 * @description    :: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var _phantom = require('phantom'),
    _ = require('underscore'),
    Q = require('q');

function scanPhantomPage(url) {
	var deferred = Q.defer();
	_phantom.create("--web-security=no", "--ignore-ssl-errors=yes", { port: 12345 }, function (ph) {
		ph.createPage(function(page) {
			page.open(url, function (status) {
				if (status == "success") {
					deferred.resolve(page);
				}
				else {
					deferred.reject('Could not open page');
				}
			});
		});
	});

	return deferred.promise;
}

function getReceptNuRecipe (page) {
	var deferred = Q.defer();
	page.evaluate(
		function (selector) {
			// TOOO: How to execute these in right scope?
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
				instructions = document.querySelectorAll('.step-by-step li > span');
			var resultObj = {
					title: document.querySelector('.basic-info h1').firstChild.textContent.trim(),
					cookingTime: document.querySelector('.basic-info .time').innerText.trim(),
					amountOfPersons: document.querySelector('.basic-info .amount').innerText.trim(),
					instructions: getInstructions(instructions),
					ingredients: getIngredients(ingredients)
				};

			return resultObj;
		},
		function (result) {
			//this log will be printed in the Node console
			console.log("Result: ", result);
			deferred.resolve(result);
		}
	);
	page.close();
	return deferred.promise;
}

function getRecipe (url) {
	var getterFn;
	if (url.indexOf('recept.nu') > -1) {
		getterFn = getReceptNuRecipe;
	}
	else if(url.indexOf('coop.se') > -1) {
		getterFn = getCoopRecipe;
	}
	else if(url.indexOf('alltommat.se') > -1) {
		getterFn = getAlltOmMatRecipe;
	}

	if(getterFn) {
		return scanPhantomPage(url)
			.then(getterFn);
	}
}

module.exports = {

	/**
	 * Imports a recipe from the given url. Currently supports Recept.nu, Coop.se and Alltommat
	 * @param request
	 * @param response
	 */
	import: function (request, response) {
		getRecipe("http://www.recept.nu/paolo-roberto/varmratter/fisk-och-skaldjur/pasta-med-vitloksfrasta-rakor-och-vitt-vin/") // Test url
			//.then()
		.then(function (result) {
			response.send(result);
		});
	},

	/**
	 * Overrides for the settings in `config/controllers.js`
	 * (specific to RecipeController)
	 */
	_config: {}


};
