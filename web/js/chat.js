/*
TODO:
- srediti ovaj fajl, grozna organizacija
	- naci bolje rjesnje za getChatID() i getUserID()
	- ...
- obavjestenje o novoj poruci u title
- dodati opciju seen
- dodati opciju ko je online
- dodati opciju pise poruku
- srediti prelamanje teksta u textboxu
- srediti automasku dodjelu usernamea
- srediti meta tagove
- *** srediti desni tab meni, sa svim opcijama...
*/

var app = angular.module('chat', ['ngSanitize', 'ui.bootstrap']);

app.factory('MainService', function() {
	var rd = {};
	
	rd.titlePrefix = '';
	
	return rd;
});

app.factory('MessageService', function() {
	var rd = {};
	
	rd.messages = [];
	rd.lastMessageId = 0;
	//messageService
	
	rd.getChatID = function() {
		// OBAV
		return chatID;
	}
	
	rd.getUserID = function() {
		// OBAV
		return userID;
	}
	
	return rd;
});

app.controller('MainController', function($scope, MainService) {
	$scope.titlePrefix = MainService.titlePrefix;
	MainService.titlePrefix = '(1) New message - ';
});

app.controller('MessageFormController', function($scope, $location, $anchorScroll, MessageService, MainService) {
	var socket = io.connect();
	
	socket.on('viewMessage_' + MessageService.getChatID(), function(data) {
		MessageService.messages.push(data);
		$scope.$apply();
		
		//if (data.author.id == MessageService.getUserID())
			MainService.titlePrefix = '(1) New Message - ';
		
		// Scroll to bottom
		$location.hash('bottom');
		$anchorScroll();
	});
	
	$scope.sendMessage = function() {
		var messageText = $scope.message;
		$scope.message = '';
	
		if (!checkMessage(messageText))
			return;
			
		var data = {};
		data.id = ++MessageService.lastMessageId;
		data.message = messageText;
		data.time = (new Date()).getTime();
		data.seen = true;
		data.author = { id:MessageService.getUserID() };
		
		socket.emit('sendMessage_' + MessageService.getChatID(), data);		
	}
	
	checkMessage = function(message) {
		if (message.length > 0)
			return true;
		else return false;
	}
});

app.controller('MessagesController', function($scope, MessageService) {
	$scope.messages = MessageService.messages;
	
	$scope.getName = function(author) {
		if (typeof author.name == 'undefined') {
			if (author.id == MessageService.getUserID())
				return 'You';
			else {
				return 'Partner';
			}
		}
	}
	
	$scope.viewableMessage = function(message) {
		// Replace links
		message = Autolinker.link(message);
		message = unescape(message);
		
		// Replace smiles
		smiles = [{code:':)', image:'smile'}, {code:':(', image:'sad'}, 
				{code:':P', image:'tongue'}, {code:';)', image:'wink'},
				{code:':D', image:'biggrin'}];
		for (var i = 0; i < smiles.length; i++)
			message = message.replace(smiles[i].code, '<img src="/web/images/smiles/' + smiles[i].image + '.png" />');
		
		return message;
	}
});