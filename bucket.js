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
	$routeProvider.when('/myList/:listId', {
		controller: 'MyListCtrl',
		templateUrl: 'templates/myList.html',
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
	$routeProvider.when('/myProfile/', {
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
                return $firebaseAuth().$waitForSignIn();
            }
        }

	})
});

app.controller('HomeCtrl', function($scope, $firebaseArray){
	var ref = firebase.database().ref().child('lists');
		$scope.lists = $firebaseArray(ref);
		console.log($scope.lists);
});

app.controller('NavCtrl', function($scope, $firebaseObject, $firebaseArray, $firebaseAuth){
	$scope.authObj = $firebaseAuth();
	var firebaseUser = $scope.authObj.$getAuth();
	$scope.firebaseUser = firebaseUser;
});
app.controller('VisitorProfileCtrl', function($scope, $routeParams){
	console.log($routeParams);
	var profile_Id = $routeParams.profileId;
	console.log(profile_Id);
	var ref= firebase.database().ref().child('users').child(profile_Id);
});

app.controller('SignUpCtrl', function($scope, $firebaseAuth, $firebaseObject, $location){
	$scope.signUpWithEmail = function(){
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
	$scope.successLogin= "";

	$scope.authObj = $firebaseAuth();
	var provider = new firebase.auth.FacebookAuthProvider();

	$scope.loginWithFb = function() {

		$scope.authObj.$signInWithPopup("facebook").then(function(result) {
			console.log("Signed in as:", result.user.uid);
			$scope.successLogin = "Signed in through Facebook";
			$location.path("/");
		}).catch(function(error) {
			console.error("Authentication failed:", error);
		});

		$scope.successLogin= "";

	}

	
	$scope.login = function() {
		console.log($scope.email);
		console.log($scope.password);


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

app.controller('ProfileCtrl', function($scope, $firebaseArray, $firebaseAuth, $routeParams, currentAuth, $firebaseObject){
	$scope.authObj = $firebaseAuth();
	console.log(currentAuth.uid);
	$scope.current_user_id = currentAuth.uid;

	var ref = firebase.database().ref().child('lists');
	var allLists = $firebaseArray(ref);
	
	
	var myLists = [];
	console.log(allLists);
	for(item in allLists){
		console.log(item);
	}

	console.log('email', currentAuth.uid);

	$scope.lists = $firebaseArray(ref);
	$scope.newList = function(){
		$scope.lists.$add({
			'title': $scope.title,
			'description': $scope.description,
			'user': currentAuth.uid,
		}) 
		$scope.title = '';
		$scope.description = '';
	// window.location.assign('#/myList/') it would be cool to redirect to
	// new list page to add tasks
};
var eventRef = firebase.database().ref().child('lists');
var lists = $firebaseObject(eventRef);
lists.$loaded(function(){
	var myLists= [];
	console.log(lists);
	$scope.myCompleted = [];

	angular.forEach(lists, function(listKey, values){


	if(listKey.user === $scope.current_user_id){
		console.log(listKey.events);
			for(eventId in listKey.events){
				console.log(listKey.events[eventId]);
				if(listKey.events[eventId].isCompleted){
					$scope.myCompleted.push(listKey.events[eventId]);
				}
			}
		}

	})
	console.log($scope.myCompleted);
});


});
app.controller('MyListCtrl', function($scope, $routeParams, $firebaseObject,$firebaseArray, $firebaseAuth){
	$scope.authObj = $firebaseAuth();
	$scope.firebaseUser = $scope.authObj.$getAuth();


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

	$scope.remove = function($index) {
    	$scope[event.title].splice($index,1);
 	 };
// This isn't working! - fix remove function


	$scope.completed = function(event_key){
		console.log("task completed!");

		var eventsRef= firebase.database().ref().child('lists').child(list_Id).child('events').child(event_key);
		var event = $firebaseObject(eventsRef);
		console.log(event);


		event.$loaded(function() {
			event.isCompleted = true;
			event.$save();

		}).then(function(ref) {
	  	eventsRef.key === event.$id; // true
	 	 });
	}

	$scope.edit = function() {
		console.log("edited!");
		
	}
});

app.controller('ListCtrl', function($scope, $routeParams, $firebaseObject,$firebaseArray, $firebaseAuth){
	$scope.authObj = $firebaseAuth();
	$scope.firebaseUser = $scope.authObj.$getAuth();

	console.log("routeParams", $routeParams);

	var list_Id = $routeParams.listId;
	console.log(list_Id);
	console.log("firebaseUser", $scope.firebaseUser);
	var Userref = firebase.database().ref().child('users').child($scope.firebaseUser.uid).child("email");
	console.log(Userref);

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
var userRef = firebase.database().ref().child('users');
var users = $firebaseObject(userRef);



var listRef = firebase.database().ref().child('lists');
var lists = $firebaseObject(listRef);
lists.$loaded(function(){
	$scope.myListArray= {};
	console.log(lists);

	angular.forEach(lists, function(values, listKey){
		console.log("test");


		if(values.user === $scope.firebaseUser['uid']){
			$scope.myListArray[listKey] = values;
		}
		console.log("array", $scope.myListArray);
	})


	});
$scope.data = {};
	$scope.addTo = function(eventName){
		console.log("add to a listkj", $scope.data.selectedList);
		var listRef = firebase.database().ref().child('lists').child($scope.data.selectedList).child('events');
		var list=$firebaseArray(listRef);
		console.log(list);
		console.log(eventName);
		list.$loaded(function(){
			list.$add({
				'title': eventName,
				'created_at': Date.now(),
				'isCompleted': false
			});
			list.$save();
		});
	}

});
