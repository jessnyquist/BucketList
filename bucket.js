var app = angular.module('bucketApp',['ngRoute', 'firebase']);
app.factory('facebookService', function() {

});
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
	$routeProvider.when('/profile/', {
		controller: 'ProfileCtrl',
		templateUrl: 'templates/profile.html',
	})
	$routeProvider.when('/list/:listId', {
		controller: 'ListCtrl',
		templateUrl: 'templates/list.html',
	})
});

app.controller('HomeCtrl', function($scope){


});
app.controller('NavCtrl', function($scope, $firebaseObject, $firebaseArray){

	$scope.newList = function(){
		console.log("create new list pop up");
	var ref = firebase.database().ref().child('lists');
	$scope.lists = $firebaseArray(ref);
	$scope.lists.$add({
		'title': $scope.title,
		'description': $scope.description,
	})
	
	};

});
app.controller('SignUpCtrl', function($scope, $firebaseAuth, $firebaseObject){
	$scope.signUp = function(){
		console.log($scope.name);
		console.log($scope.password);
		console.log($scope.email);
		$scope.error = "";
		$scope.isSuccess= false;
		$scope.authObj = $firebaseAuth();
		$scope.authObj.$createUserWithEmailAndPassword($scope.email, $scope.password)
		.then(function(firebaseUser){
			console.log("User " + firebaseUser.uid + " created successfully!");
			var ref = firebase.database().ref().child('users').child(firebaseUser.uid);
			$scope.user= $firebaseObject(ref);
			$scope.user.name = $scope.name;
			$scope.user.email = $scope.email;
			$scope.user.$save();
			$scope.isSuccess= true;	
			window.location.assign('#/list');   
		}).catch(function(error) {
			console.error("Error: ", error);
			$scope.error = error;
		});
	}
});
app.controller('LogInCtrl', function($scope){
	$scope.facebookLogIn = function(){
		console.log("log in with facebook");
	}

});
app.controller('ProfileCtrl', function($scope, $firebaseArray){
		console.log("create new list pop up");
	var ref = firebase.database().ref().child('lists');
	$scope.lists = $firebaseArray(ref);
		$scope.newList = function(){
	$scope.lists.$add({
		'title': $scope.title,
		'description': $scope.description,
	})
	
	};


});

app.controller('ListCtrl', function($scope, $routeParams, $firebaseObject){
	console.log($routeParams);
	var number = $routeParams.listId;
	console.log(number);
	var ref= firebase.database().ref().child('lists').child(number);
	$scope.list = $firebaseObject(ref);
	console.log($scope.list);


});
