var mp4Controllers = angular.module('mp4Controllers', []);

mp4Controllers.controller('FirstController', ['$scope', 'CommonData'  , function($scope, CommonData) {
  $scope.data = "";
   $scope.displayText = ""

  $scope.setData = function(){
    CommonData.setData($scope.data);
    $scope.displayText = "Data set"

  };

}]);

mp4Controllers.controller('SecondController', ['$scope', 'CommonData' , function($scope, CommonData) {
  $scope.data = "";

  $scope.getData = function(){
    $scope.data = CommonData.getData();

  };

}]);


mp4Controllers.controller('userListController', ['$scope', '$http', 'Users', 'Tasks', '$window' , function($scope, $http,  Users, Tasks, $window) {
  $scope.users=[];
  Users.get().success(function(data){
    $scope.users = data.data;
    //$scope.$digest();
    //console.log(data);
  });

  $scope.deleteUser = function(id_to_delete){

 $scope.detailTasks=[];
  Tasks.getTasksByUserID(id_to_delete).success(function(data){
    $scope.detailTasks = data.data;
    for(var i=0; i<$scope.detailTasks.length; i++){
      Tasks.updateTask($scope.detailTasks[i].name, $scope.detailTasks[i].description, $scope.detailTasks[i].deadline, $scope.detailTasks[i].completed, undefined ,$scope.detailTasks[i]);
    }
    console.log("done removing user association with tasks");
  });
    //console.log(id_to_delete);
    Users.deleteUser(id_to_delete).success(function(data){
      //console.log(data);
        Users.get().success(function(data){
          $scope.users = data.data;
        });
    });
  
  };

}]);

mp4Controllers.controller('taskListController', ['$scope', '$filter', '$http', '$timeout', 'Tasks', 'Users', '$window' , function($scope, $filter, $http, $timeout, Tasks, Users, $window) {
  $scope.tasks=[];
  $scope.currentPage = 0;
  $scope.pageSize = 10;
  $scope.q = '';

  Tasks.get().success(function(data){
    $scope.tasks = data.data;
    console.log($scope.tasks.length);
  });

 $scope.getData = function () {
      // needed for the pagination calc
      // https://docs.angularjs.org/api/ng/filter/filter
      return $filter('filter')($scope.tasks, $scope.q)
     /* 
       // manual filter
       // if u used this, remove the filter from html, remove above line and replace data with getData()
       
        var arr = [];
        if($scope.q == '') {
            arr = $scope.data;
        } else {
            for(var ea in $scope.data) {
                if($scope.data[ea].indexOf($scope.q) > -1) {
                    arr.push( $scope.data[ea] );
                }
            }
        }
        return arr;
       */
    }
     $scope.numberOfPages=function(){
        return Math.ceil($scope.getData().length/$scope.pageSize);                
    }
    


 $scope.detailTask=[];
  $scope.deleteTask = function(id_to_delete){
   Tasks.getTaskByTaskID(id_to_delete).success(function(data){
      $scope.detailTask=data.data;
      if($scope.detailTask.assignedUser!=""){
        Users.updateUserTasks($scope.detailTask.assignedUser, id_to_delete, "remove");
      }
      Tasks.deleteTask(id_to_delete).success(function(data){
        console.log("deleted task");
       Tasks.get().success(function(data){
          console.log("reloading tasks...");
          $timeout(function() {
             $scope.tasks = data.data;
             console.log("data reset");
             console.log($scope.tasks.length);
          }, 100);   
      });
       
       // $scope.tasks = data.data;
         // $scope.$apply();
      });
    });
  // $scope.$apply();
    //onsole.log(id_to_delete);
  }
  //$scope.$apply();
}]);


mp4Controllers.controller('taskDetailController', ['$scope', '$http', '$routeParams', 'Tasks', '$window' , function($scope, $http, $routeParams, Tasks, $window) {
  $scope.params = $routeParams;
  var myID = $scope.params.id;
  console.log(myID);
  $scope.detailTask={};
  Tasks.getTaskByTaskID(myID).success(function(data){
    $scope.detailTask=data.data;
  });

}]);


mp4Controllers.controller('editTaskController', ['$scope', '$http', '$routeParams', 'Tasks', 'Users', '$window' , function($scope, $http, $routeParams, Tasks, Users, $window) {
  $scope.params = $routeParams;
  var myID = $scope.params.id;
  console.log(myID);

  $scope.displayText="";

  $scope.users=[];
  $scope.displayText="Awaiting your task edit..."
  Users.get().success(function(data){
    $scope.users = data.data;
  });

  $scope.detailTask={};
  $scope.name="";
  $scope.description="";
  $scope.deadline=[];
  $scope.assignedUser={};
  $scope.completed="";


  Tasks.getTaskByTaskID(myID).success(function(data){
    $scope.detailTask=data.data;
    $scope.name= $scope.detailTask.name;
    $scope.description=$scope.detailTask.description;
    $scope.deadline=new Date($scope.detailTask.deadline);
    $scope.assignedUserName=$scope.detailTask.assignedUserName;
    $scope.assignedUserId=$scope.detailTask.assignedUser;
    $scope.completed=$scope.detailTask.completed;


        Users.getUserByID($scope.assignedUserId).success(function(data){
          $scope.assignedUser=data.data;
         // $scope.assignedUser=data.data.name;
        });
  });

  $scope.editTheTask = function(){
    if($scope.completed){ //completed chosen
      if($scope.detailTask.completed==true){
        //just update the task, no users are affected
        Tasks.updateTask($scope.name,  $scope.description,  $scope.deadline, $scope.completed, $scope.assignedUser, $scope.detailTask).success(function(data){
          $scope.displayText= "Task has been edited! Success!";
        });
      }
      else{
        //pending to complete so remove this task from the old user's pending task list
        Users.updateUserTasks($scope.detailTask.assignedUser, $scope.detailTask._id, "remove").success(function(data){
          $scope.displayText("Task has been removed from old user's pending tasks...");
          Tasks.updateTask($scope.name,  $scope.description,  $scope.deadline, $scope.completed, $scope.assignedUser, $scope.detailTask).success(function(data){
            $scope.displayText="Task has been edited! Success!";
          });
        });
      }
    } 
    else{  //pending chosen
      if($scope.detailTask.completed==true){
        //complete to pending so add this task to the assigned users pending tasks
        Users.updateUserTasks($scope.assignedUser._id, $scope.detailTask._id, "add").success(function(data){
          $scope.displayText="Task has been added to user's pending tasks...";
          Tasks.updateTask($scope.name,  $scope.description,  $scope.deadline, $scope.completed,  $scope.assignedUser, $scope.detailTask).success(function(data){
            $scope.displayText="Task has been edited! Success!";
          });
        });
      }
      else{ //pending to pending ...

        if($scope.assignedUser._id!=$scope.detailTask.assignedUser){  //if user changes then remove task from old user's pending Tasks and add to new users
          console.log("assigning task to a new user, still a pending task");
          Users.updateUserTasks($scope.detailTask.assignedUser, $scope.detailTask._id, "remove").success(function(data){
            $scope.displayText="Task has been removed from old user's pending tasks...";
            console.log("Task has been removed from old user's pending tasks...");
            Users.updateUserTasks($scope.assignedUser._id, $scope.detailTask._id, "add").success(function(data){
              $scope.displayText="Task has been added to user's pending tasks...";
              console.log("Task has been added to user's pending tasks...");
              Tasks.updateTask($scope.name,  $scope.description,  $scope.deadline, $scope.completed, $scope.assignedUser, $scope.detailTask).success(function(data){
                 console.log("Task has been edited! Success!");
                $scope.displayText="Task has been edited! Success!";
            });
          });
        }).error(function (data) {
                        console.log("very BAD");
                        console.log("data");
        });
        } else{   //just update the task
          //just update the task, no users are affected
          Tasks.updateTask($scope.name,  $scope.description,  $scope.deadline, $scope.completed, $scope.assignedUser, $scope.detailTask).success(function(data){
          $scope.displayText="Task has been edited! Success!";
          });
        }
      }
    }
  };





}]);

mp4Controllers.controller('addTaskController', ['$scope', '$http', 'Tasks', 'Users', '$window' , function($scope, $http,  Tasks, Users, $window) {
  $scope.users=[];
  $scope.displayText="Awaiting your task addition..."
  Users.get().success(function(data){
    $scope.users = data.data;
  });

 $scope.addTask = function(){

  if($scope.deadline==undefined){
    return;
  }
  if($scope.name==undefined){
    return;
  }
  //console.log("in add task");
    $scope.displayText = "Task added...maybe"
    //console.log($scope.name, $scope.description, $scope.deadline, $scope.assignedUser);
    Tasks.addTask($scope.name, $scope.description, $scope.deadline, $scope.assignedUser).success(function(data){
      //console.log(data);
        $scope.displayText = "Task added, to list of tasks";
        var t_id=data.data._id;
        Users.updateUserTasks($scope.assignedUser._id, t_id, "add").success(function(data){
          $scope.displayText =  "Task added, to user, success!!";
        });

    });
  };

}]);


mp4Controllers.controller('userDetailController', ['$scope', '$http', '$routeParams','Users', 'Tasks', '$window' , function($scope, $http, $routeParams, Users, Tasks, $window) {
  $scope.params = $routeParams;
  var myID = $scope.params.id;
  console.log(myID);
  $scope.detailUser={};
  Users.getUserByID(myID).success(function(data){
    $scope.detailUser=data.data;
  });
  console.log($scope.detailUser.name);

  $scope.detailTasks=[];
  Tasks.getTasksByUserID(myID).success(function(data){
    $scope.detailTasks = data.data;
    //console.log("hey wtf");
    console.log($scope.detailTasks);

  $scope.completedTasks=[];
  $scope.pendingTasks=[];
  for(var i=0; i<$scope.detailTasks.length; i++){
    if($scope.detailTasks[i].completed==true){
      $scope.completedTasks.push($scope.detailTasks[i]);
    }
    else{
      $scope.pendingTasks.push($scope.detailTasks[i]);
    }
  }

  console.log( $scope.pendingTasks.length);
    console.log( $scope.completedTasks.length);
    console.log($scope.detailTasks.length);



  });


  $scope.toggleCompleted = function(){
    jQuery('#hideshow').toggle('show');
  }

  $scope.markComplete = function(t_id){
    console.log(t_id);
    Tasks.getTaskByTaskID(t_id).success(function(data){
      $scope.detailTasks = data.data;
      Tasks.updateTask($scope.detailTasks.name, $scope.detailTasks.description, $scope.detailTasks.deadline, true, $scope.detailUser ,$scope.detailTasks).success(function(data){
        console.log("yay, the task has been completed");

        Tasks.getTasksByUserID(myID).success(function(data){
            $scope.detailTasks = data.data;
            //console.log("hey wtf");
            console.log($scope.detailTasks);
          $scope.completedTasks=[];
          $scope.pendingTasks=[];
          for(var i=0; i<$scope.detailTasks.length; i++){
            if($scope.detailTasks[i].completed==true){
              $scope.completedTasks.push($scope.detailTasks[i]);
            }
            else{
              $scope.pendingTasks.push($scope.detailTasks[i]);
            }
          }
          });

      });

    });

  }


}]);





mp4Controllers.controller('addUserController', ['$scope', '$http', 'Users', '$window' , function($scope, $http,  Users, $window) {
  $scope.addUser = function(){
    $scope.displayText = "User added...maybe"

    Users.addUser($scope.name, $scope.email).success(function(data){
      console.log(data);
        $scope.displayText = "User added, Success!!"
    });
  };

}]);

mp4Controllers.controller('LlamaListController', ['$scope', '$http', 'Llamas', '$window' , function($scope, $http,  Llamas, $window) {

  Llamas.get().success(function(data){
    $scope.llamas = data;
  });


}]);

mp4Controllers.controller('SettingsController', ['$scope' , '$window' , function($scope, $window) {
  $scope.url = $window.sessionStorage.baseurl;

  $scope.setUrl = function(){
    $window.sessionStorage.baseurl = $scope.url;
    $scope.displayText = "URL set";

  };

}]);
