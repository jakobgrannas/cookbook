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

module.exports = {

	/**
	 * Imports a recipe from the given url. Currently supports Recept.nu, Coop.se and Alltommat
	 * @param request
	 * @param response
	 */
	import: function (request, response) {
		RecipeService.getRecipe("http://www.recept.nu/paolo-roberto/varmratter/fisk-och-skaldjur/pasta-med-vitloksfrasta-rakor-och-vitt-vin/") // Test url
		.done(function (utils) {
			console.log(utils.lastReturn);
			response.send(utils.lastReturn);
		})
		.onError(function (utils) {
			response.send({
				errorMessage: utils.lastReturn
			});
		});
		/*.then(
			function (result) {
				response.send(result);
			},
			function (rejectReason) {
				response.send({
					errorMessage: rejectReason
				});
			}
		);*/
	},

	/**
	 * Overrides for the settings in `config/controllers.js`
	 * (specific to RecipeController)
	 */
	_config: {}


};
