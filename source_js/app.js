var app = angular.module('mp4', ['ngRoute', 'mp4Controllers', 'mp4Services']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/userList', {
    templateUrl: 'partials/userList.html',
    controller: 'userListController'
  }).
  when('/taskList', {
    templateUrl: 'partials/taskList.html',
    controller: 'taskListController'
  }).
  when('/userDetail/:id', {
    templateUrl: 'partials/userDetail.html',
    controller: 'userDetailController'
  }).
  when('/taskDetail/:id', {
    templateUrl: 'partials/taskDetail.html',
    controller: 'taskDetailController'
  }).
  when('/addUser', {
    templateUrl: 'partials/addUser.html',
    controller: 'addUserController'
  }).    
    when('/addTask', {
    templateUrl: 'partials/addTask.html',
    controller: 'addTaskController'
  }).    
    when('/editTask/:id', {
    templateUrl: 'partials/editTask.html',
    controller: 'editTaskController'
  }).    
  when('/settings', {
    templateUrl: 'partials/settings.html',
    controller: 'SettingsController'
  }).
  when('/llamalist', {
    templateUrl: 'partials/llamalist.html',
    controller: 'LlamaListController'
  }).
  otherwise({
    redirectTo: '/settings'
  });
}]);


app.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});