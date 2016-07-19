var app = angular.module('bucketApp',['ngRoute', 'firebase']);
app.factory('facebookService', function() {

});

app.run(["$rootScope", "$location", function($rootScope, $location) {
  $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
    // We can catch the error thrown when the $requireSignIn promise is rejected
    // and redirect the user back to the home page
    if (error === "AUTH_REQUIRED") {
       $location.path("/login");
   }
});
}]);

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
	$routeProvider.when('/visitorProfile/:profileId', {
		controller: 'VistorProfileCtrl',
		templateUrl: 'templates/visitorprofile.html',
	})
	$routeProvider.when('/myProfile/:profileId', {
		controller: 'ProfileCtrl',
		templateUrl: 'templates/profile.html',
		 resolve: {
          // controller will not be loaded until $requireSignIn resolves
          // Auth refers to our $firebaseAuth wrapper in the example above
          "currentAuth": function($firebaseAuth) {
                // $requireSignIn returns a promise so the resolve waits for it to complete
                // If the promise is rejected, it will throw a $stateChangeError (see above)
                return $firebaseAuth().$requireSignIn();
            }
        }
	})
	$routeProvider.when('/list/:listId', {
		controller: 'ListCtrl',
		templateUrl: 'templates/list.html',
		 resolve: {
          // controller will not be loaded until $requireSignIn resolves
          // Auth refers to our $firebaseAuth wrapper in the example above
          "currentAuth": function($firebaseAuth) {
                // $requireSignIn returns a promise so the resolve waits for it to complete
                // If the promise is rejected, it will throw a $stateChangeError (see above)
                return $firebaseAuth().$requireSignIn();
            }
        }
	})
});

app.controller('HomeCtrl', function($scope, $firebaseArray, currentAuth){
	var ref = firebase.database().ref().child('lists');
		$scope.lists = $firebaseArray(ref);
	
});
app.controller('NavCtrl', function($scope, $firebaseObject, $firebaseArray, currentAuth){
	// console.log(currentAuth);
	// var currUser = currentAuth.uid;
	// console.log(currentAuth.uid);

});
app.controller('VisitorProfileCtrl', function($scope, $routeParams){

});
app.controller('SignUpCtrl', function($scope, $firebaseAuth, $firebaseObject, $location){
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
			// window.location.assign('#/list');
			$location.path("/");   
		}).catch(function(error) {
			console.error("Error: ", error);
			$scope.error = error;
		}); 
	} 	
});

app.controller('LogInCtrl', function($scope, $firebaseAuth, $routeParams, $location, $firebaseObject){
	$scope.error = "";
	$scope.facebookLogIn = function(){
		console.log("log in with facebook");
	}
	
	$scope.login = function() {
		console.log($scope.email);
		console.log($scope.password);
	
	$scope.authObj = $firebaseAuth();

    $scope.authObj.$signInWithEmailAndPassword($scope.email, $scope.password)
    .then(function(firebaseUser) {
        console.log("Signed in as:", firebaseUser.uid);
        $location.path("/");
    }).catch(function(error) {
        console.error("Authentication failed:", error);
        $scope.errorMessage= error.message;
    });
}
});

app.controller('ProfileCtrl', function($scope, $firebaseArray, $firebaseAuth, $routeParams, currentAuth){
	var profile_Id = $routeParams.profileId;
	profile_Id = currentAuth.uid;
	console.log(profile_Id);
	// var profile_Id = currentAuth.uid;
 // 	// $routeParams.profileId = profile_Id;
	var ref = firebase.database().ref().child('lists');
	$scope.authObj = $firebaseAuth();
	console.log(currentAuth.uid);

	$scope.lists = $firebaseArray(ref);
		$scope.newList = function(){
	$scope.lists.$add({
		'title': $scope.title,
		'description': $scope.description,
		'user': currentAuth.uid,
	}) 
	$scope.title = '';
	$scope.description = '';
	};


});

app.controller('ListCtrl', function($scope, $routeParams, $firebaseObject,$firebaseArray){
	console.log($routeParams);
	var list_Id = $routeParams.listId;
	console.log(list_Id);
	var ref= firebase.database().ref().child('lists').child(list_Id);
	$scope.list = $firebaseObject(ref);
	console.log($scope.list);
	$scope.createEvent = function(){
		var ref= firebase.database().ref().child('lists').child(list_Id).child('events');
		var events = $firebaseArray(ref);
		events.$add({
			'title': $scope.eventName,
			'created_at': Date.now(),
			'isCompleted': false,
		})
		$scope.eventName='';

	};
	$scope.successMessage = "";

	$scope.completed = function(event_key){
		console.log("task completed!");
		$scope.successMessage = "Congrats on finishing your task!";

		var eventsRef= firebase.database().ref().child('lists').child(list_Id).child('events').child(event_key);
		var events = $firebaseObject(eventsRef);
		console.log(events);
	}


});
