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
			var text = document.querySelector(selector).innerText;
			return text;
		},
		function (result) {
			//this log will be printed in the Node console
			console.log("The element contains the following text: ", result);
			deferred.resolve(result);
		},
		"title"
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
		getRecipe("http://www.recept.nu")
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
