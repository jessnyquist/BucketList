var app = angular.module('bucketApp',['ngRoute', 'firebase']);

app.config(function($routeProvider) {
	$routeProvider.when('/', {
		controller: 'HomeCtrl',
		templateUrl: 'templates/home.html',
	})
	$routeProvider.when('/signup', {
		controller: 'SignUpCtrl',
		templateUrl: 'templates/signup.html',
	})
	$routeProvider.when('/login', {
		controller: 'LogInCtrl',
		templateUrl: 'templates/logon.html',
	})
	$routeProvider.when('/profile', {
		controller: 'ProfileCtrl',
		templateUrl: 'templates/profile.html',
	})
});

app.controller('HomeCtrl', function($scope){

});
app.controller('NavCtrl', function($scope){
	$scope.newList = function(){
		console.log("create new list pop up");
	};

});
app.controller('SignUpCtrl', function($scope){

});
app.controller('LogInCtrl', function($scope){

});
app.controller('ProfileCtrl', function($scope){

});
