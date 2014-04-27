var _phantom = require('phantom'),
	Q = require('q');

function scanPhantomPage(url, callback) {
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

function getPageData (page, callback) {
	var deferred = Q.defer();
	page.evaluate(
		callback,
		function (result) {
			//this log will be printed in the Node console
			console.log("Result: ", result);
			deferred.resolve(result);
		}
	);
	page.close();
	return deferred.promise;
}

exports.getRecipe = function (url) {
	var callback;

	if (url.indexOf('recept.nu') > -1) {
		callback = ReceptNuService.getRecipeData;
	}
	else if(url.indexOf('coop.se') > -1) {
		callback = CoopService.getRecipeData;
	}
	else if(url.indexOf('alltommat.se') > -1) {
		callback = AlltOmMatService.getRecipeData;
	}
	else if(url.indexOf('tasteline.com') > -1) {
		callback = TasteLineService.getRecipeData;
	}
	else {
		var deferred = Q.defer().reject('Could not import recipe. Site not supported. Please try another site');
		return deferred.promise();
	}

	if(getterFn) {
		return scanPhantomPage(url)
			.then(function (page) {
				return getPageData(page, callback);
			});
	}
};