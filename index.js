var express = require('express');
var Promise = require('bluebird');
var app = express();
var config = require('./temp.json');
var http = require('http').Server(app);
var tn;
var bandwidth = require("node-bandwidth");
var Application = Promise.promisifyAll(bandwidth.Application);
var PhoneNumber = Promise.promisifyAll(bandwidth.PhoneNumber);
var AvailableNumber = Promise.promisifyAll(bandwidth.AvailableNumber);

var appName = "Auto-Reply-Webinar";
var client = new bandwidth.Client(
	config.userId,
	config.apiToken,
	config.apiSecret);

var xml = "";

//Checks the current Applications to see if we have one.
var configureApplication = function () {
	return Application.listAsync(client, {
		size: 1000
	})
	.then(function (applications) {
		var applicationId = searchForApplication(applications, appName);
		if(applicationId !== false) {
			return fetchTNByAppId(applicationId);
		}
		else {
			return newApplication();
		}
	});
};

// Searches through application names and returns ID if matched
var searchForApplication = function (applications, name) {
	for (var i = 0; i < applications.length; i++) {
			if ( applications[i].name === name) {
				return applications[i].id;
			}
		}
	return false;
};

// Gets the first number associated with an application
var fetchTNByAppId = function (applicationId) {
	return PhoneNumber.listAsync(client, {
		applicationId: applicationId
	})
	.then(function (numbers) {
		tn = numbers[0].number;
	});
};

// Creates a new application then orders a number and assigns it to application
var newApplication =function () {
	var applicationId;
	return Application.createAsync(client, {
			name: appName,
			incomingMessageUrl: config.baseUrl + "/autoreply/",
			callbackHttpMethod: "get",
			autoAnswer: false
		})
		.then(function(application) {
			//search an available number
			applicationId = application.id;
			return AvailableNumber.searchLocalAsync(client, {
				areaCode: "415",
				quantity: 1
			});
		})
		.then(function(numbers) {
			// and reserve it
			tn = numbers[0].number;
			return PhoneNumber.createAsync(client, {
				number: tn,
				applicationId: applicationId
			});
		});
};

app.set('port', (process.env.PORT || 5000));

//three sets of each number
app.get('/autoreply', function(req, res) {
	var bxml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<Response>\n' +
 			'<SendMessage from="'+tn+'" to="'+req.query.from+'">AutoReply Message</SendMessage>\n' +
		'</Response>';
		console.log(bxml);
	res.send(bxml);
});

configureApplication()
.then(function () {
	http.listen(app.get('port'), function(){
		console.log('listening on *:' + app.get('port'));
		console.log('Text #: '+ tn);
	});
});



