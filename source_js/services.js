var mp4Services = angular.module('mp4Services', []);

mp4Services.factory('CommonData', function(){
    var data = "";
    return{
        getData : function(){
            return data;
        },
        setData : function(newData){
            data = newData;
        }
    }
});

mp4Services.factory('Llamas', function($http, $window) {
    return {
        get : function() {
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.get(baseUrl+'/api/llamas');
        }
    }
});

mp4Services.factory('Users', function($http, $window) {
    return {
        get : function() {
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.get(baseUrl+'/api/users');
        },

        getUserByID : function(u_id){
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.get(baseUrl+'/api/users/'+u_id);
        },

        deleteUser: function(u_id){
            //console.log(u_id);
            //console.log("^id above");
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.delete(baseUrl+'/api/users/'+u_id);
        },
        addUser: function(name, email){
            console.log("received: "+ name);
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.post(baseUrl+'/api/users/', {'name':name, 'email':email, 'pendingTasks': []});
        },
        updateUserTasks: function(u_id, t_id, remove_or_add){
            console.log("in update user task");
            var baseUrl = $window.sessionStorage.baseurl;
            if(remove_or_add=="remove"){  //remove this t_id from pending tasks for this user
                console.log("removing task");
                return $http.get(baseUrl+'/api/users/'+u_id).success(function(data){
                    var curr_user= data.data;
                    console.log(curr_user.pendingTasks);
                    var new_tasks=curr_user.pendingTasks;
                    var index=new_tasks.indexOf(t_id);

                    if(index>-1) {
                        new_tasks.splice(index, 1);
                    }
                    else{
                        console.log("User doesn't have this task!!!!");
                        //return;
                    }
                    console.log(new_tasks);
                     var userUpdateData_2 = {
                        "_id":curr_user._id,
                        "name":curr_user.name,
                        "email":curr_user.email,
                        "pendingTasks": new_tasks
                    };
                    var req = {
                     method: 'PUT',
                     url: baseUrl+'/api/users/'+u_id,
                     headers: {
                       'Content-Type': 'application/json'
                     },
                     data: userUpdateData_2
                    };
                    $http(req).success(function (data, response) {
                        console.log(data);
                        console.log(response);
                        console.log("go to bed");
                        return response;
                    }).error(function (data) {
                        console.log("Bad!!");
                        console.log(data);
                    });

                });
               
            } else{  //add this t_id to pending tasks for this user. just don't ever add the same t_id twice (call this carefully)
                return $http.get(baseUrl+'/api/users/'+u_id).success(function(data){
                    var curr_user= data.data;
                    //console.log(curr_user.pendingTasks);
                    var new_tasks=curr_user.pendingTasks;
                    new_tasks.push(t_id);
                     var userUpdateData = $.param({
                        id: curr_user._id,
                        name:curr_user.name,
                        email:curr_user.email,
                        pendingTasks: new_tasks
                    });

                     var userUpdateData_2 = {
                        "_id":curr_user._id,
                        "name":curr_user.name,
                        "email":curr_user.email,
                        "pendingTasks": new_tasks
                    };

                    console.log(curr_user);
/*
                    $http.put(baseUrl+'/api/users/',u_id,userUpdateData_2).success(function (data) {
                        console.log(data);
                        console.log("go to bed");
                    }).error(function (data) {
                        console.log("fuck");
                    });  */
/*
                $http.put(baseUrl+'/api/users/',curr_user._id+userUpdateData).success(function (data) {
                        console.log(data);
                        console.log("go to bed");
                    }).error(function (data) {
                        console.log("fuck!!");
                        console.log(data);
                    });
                */

                     var req = {
                     method: 'PUT',
                     url: baseUrl+'/api/users/'+u_id,
                     headers: {
                       'Content-Type': 'application/json'
                     },
                     data: userUpdateData_2
                    };
                    return $http(req);


                });

            }
        }
    }
});

mp4Services.factory('Tasks', function($http, $window) {
    return {
        get : function() {
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.get(baseUrl+'/api/tasks');
        },

        getTasksByUserID: function(u_id){
            var baseUrl = $window.sessionStorage.baseurl;
            return $.get(baseUrl+'/api/tasks?where={"assignedUser": "'+u_id+'"}');
        },
        getTaskByTaskID: function(t_id){
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.get(baseUrl+'/api/tasks/'+t_id);
        },

        addTask: function(name, description, deadline, assignedUser){
            //console.log("received: "+ name);
            var baseUrl = $window.sessionStorage.baseurl;
            if(assignedUser!=undefined){
                return $http.post(baseUrl+'/api/tasks/', {'name':name, 'description':description, 'deadline': deadline, 'assignedUser':assignedUser._id, 'assignedUserName':assignedUser.name});
                //since this task is assigned to someone, must also update the user's pending tasks ...

            }
            else{
                return $http.post(baseUrl+'/api/tasks/', {'name':name, 'description':description, 'deadline': deadline, 'assignedUser':"", 'assignedUserName':"unassigned"});
            }
        },
        updateTask: function(name, description, deadline, completed, assignedUser, detailTask){
            var baseUrl = $window.sessionStorage.baseurl;
            console.log("in update task");
        //    return $http.put(baseUrl+'/api/tasks/', {'name':name, 'description':description, 'deadline': deadline, 'assignedUser':assignedUser._id, 'assignedUserName':assignedUser.name});
            
            if(assignedUser!=undefined){
                     var userTaskData = {
                                "_id":detailTask._id,
                                "name":name,
                                "description":description,
                                "deadline": deadline,
                                "completed": completed,
                                "assignedUser":assignedUser._id,
                                "assignedUserName":assignedUser.name
                            };
                            var req = {
                             method: 'PUT',
                             url: baseUrl+'/api/tasks/'+detailTask._id,
                             headers: {
                               'Content-Type': 'application/json'
                             },
                             data: userTaskData
                            };
                            return $http(req);

                } else{  //deleting a user so set task assingedUser to unassigned
                    var userTaskData = {
                                "_id":detailTask._id,
                                "name":name,
                                "description":description,
                                "deadline": deadline,
                                "completed":completed,
                                "assignedUser":"",
                                "assignedUserName":"unassigned"
                            };
                            var req = {
                             method: 'PUT',
                             url: baseUrl+'/api/tasks/'+detailTask._id,
                             headers: {
                               'Content-Type': 'application/json'
                             },
                             data: userTaskData
                            };
                            return $http(req);
            }
        },
        deleteTask: function(t_id){
            //console.log(u_id);
            //console.log("^id above");
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.delete(baseUrl+'/api/tasks/'+t_id);
        },
    }
});
