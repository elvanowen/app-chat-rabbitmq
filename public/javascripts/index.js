var app = angular.module('app-chat', []);

app.controller('userController', function($scope, $http) {
    $scope.username = "elvan.owen";

    $http.get("/api/user/me")
        .then(function(response) {
            var me = response.data.me;
            $scope.me = me;
        });
});

app.controller('groupController', function($scope, $http, $timeout) {
    var groupMap = {};
    $scope.selectedGroup = null;
    $scope.isActive = function(gid) {
        return gid == $scope.selectedGroup;
    };

    $scope.onGroupClick = function(gid){
        $scope.selectedGroup = gid;
        $scope.$emit('clickChatEvent', {
            group: groupMap[gid]
        });
    };

    $http.get("/api/user/groups")
        .then(function(response) {
            var groups = response.data.groups;
            $scope.groups = groups;

            for (var i=0;i<groups.length;i++){
                (function getLastChat(group){
                    $http.get("/api/chat/group/" + group.gid + "?limit=1")
                        .then(function(response) {
                            var lastChat = response.data.chats.length ? response.data.chats[0] : null;
                            group.lastChat = lastChat;

                            if (group.lastChat) {
                                group.lastChat.create_time = moment(group.lastChat.create_time).fromNow();
                            }

                            groupMap[group.gid] = group;
                        });
                })(groups[i]);
            }
        });

    $scope.isAddNewGroup = false;
    $scope.toggleAddNewGroup = function(){
        $scope.isAddNewGroup = !$scope.isAddNewGroup;
        setTimeout(function(){
            angular.element('input[name="add-group"]').trigger('focus');
        });

        // Clear previous input
        $scope.addNewGroupInput = ''
    };

    $scope.addNewGroup = function(){
        $http.get("/api/user/friends")
            .then(function(response) {
                console.log(response);
                var friends = response.data.friends;
                var data = [];

                for (var i=0;i<friends.length;i++){
                    data.push({
                        uid: friends[i].uid,
                        name: friends[i].username,
                        photo: friends[i].photo
                    })
                }

                $scope.$emit('openModalEvent', {
                    data: data,
                    url: '/api/group/create',
                    body: {
                        group: {
                            nama: $scope.addNewGroupInput
                        }
                    }
                });
            });
    };

    $scope.groupNewChat = {
        1: 1
    };
    $scope.countNewChat = function(gid){
        return $scope.groupNewChat[gid] ? $scope.groupNewChat[gid] : '';
    };

    socket.on('newGroupChat', function (data) {

    });
});

app.controller('friendController', function($scope, $http) {
    var friendMap = {};
    $scope.selectedUser = null;
    $scope.isActive = function(uid) {
        return uid == $scope.selectedUser;
    };

    $scope.onUserClick = function(uid){
        $scope.selectedUser = uid;
        $scope.$emit('clickChatEvent', {
            friend: friendMap[uid]
        });
    };

    $http.get("/api/user/friends")
        .then(function(response) {
            var friends = response.data.friends;
            $scope.friends = friends;

            for (var i=0;i<friends.length;i++){
                (function getLastChat(friend){
                    $http.get("/api/chat/user/" + friend.uid + "?limit=1")
                        .then(function(response) {
                            var lastChat = response.data.chats.length ? response.data.chats[0] : null;
                            friend.lastChat = lastChat;

                            if (friend.lastChat) {
                                friend.lastChat.create_time = moment(friend.lastChat.create_time).fromNow();
                            }

                            friendMap[friend.uid] = friend;
                        });
                })(friends[i]);
            }
        });

    $scope.isAddNewUser = false;
    $scope.toggleAddNewUser = function(){
        $scope.isAddNewUser = !$scope.isAddNewUser;
        setTimeout(function() {
            angular.element('input[name="add-friend"]').trigger('focus');
        });

        // Clear previous input
        $scope.addNewUserInput = '';
        $scope.errorMessage = '';
    };

    $scope.addNewUser = function(){
        $http.post("/api/user/add", {username: $scope.addNewUserInput})
            .then(function(response) {
                $scope.errorMessage = '';
                $scope.toggleAddNewUser();
            }, function(response){
                $scope.errorMessage = response.data.error
            });
    };

    $scope.friendNewChat = {
        2: 1
    };
    $scope.countNewChat = function(uid){
        return $scope.friendNewChat[uid] ? $scope.friendNewChat[uid] : '';
    };

    socket.on('newFriendChat', function (data) {

    });
});

app.controller('chatController', function($scope, $http, $timeout) {
    $scope.user = {};
    $scope.hasUserData = {};

    $scope.$on('openChatEvent', function(event, args) {
        var friend = args["friend"];
        var group = args["group"];

        if (friend) {
            $scope.dataShowing = friend;

            $http.get("/api/chat/user/" + friend.uid)
                .then(function(response) {
                    var chats = response.data.chats;

                    for (var i=0;i<chats.length;i++) {
                        chats[i].create_time = moment(chats[i].create_time).fromNow();
                    }

                    if (!$scope.hasUserData[window.uid]) {
                        // Get friend data
                        $http.get("/api/user/uid/" + window.uid)
                            .then(function(response) {
                                $scope.user[window.uid] = response.data;
                                $timeout(function() {
                                    $scope.$apply();
                                });
                            });

                        $scope.hasUserData[window.uid] = true;
                    }

                    if (!$scope.hasUserData[friend.uid]) {
                        // Get friend data
                        $http.get("/api/user/uid/" + friend.uid)
                            .then(function(response) {
                                $scope.user[friend.uid] = response.data;
                                $timeout(function() {
                                    $scope.$apply();
                                });
                            });

                        $scope.hasUserData[friend.uid] = true;
                    }

                    $scope.chats = chats;
                    $scope.title = friend.username;
                });
        } else if (group) {
            $scope.dataShowing = group;

            $http.get("/api/chat/group/" + group.gid)
                .then(function(response) {
                    var chats = response.data.chats;

                    for (var i=0;i<chats.length;i++) {
                        var chat = chats[i];
                        chat.create_time = moment(chat.create_time).fromNow();

                        if (!$scope.hasUserData[chat.chat_from]) {
                            // Get friend data
                            $http.get("/api/user/uid/" + chat.chat_from)
                                .then(function(response) {
                                    $scope.user[window.uid] = response.data;
                                    $timeout(function() {
                                        $scope.$apply();
                                    });
                                });

                            $scope.hasUserData[chat.chat_from] = true;
                        }
                    }

                    $scope.chats = chats;
                    $scope.title = group.nama;
                });
        }
    });

    $scope.isMyChat = function(chat){
        return chat.chat_from == window.uid;
    };

    $scope.inviteUser = function(){
        console.log('inviteUser');

        $http.get("/api/user/friends")
            .then(function(response) {
                console.log(response);
                var friends = response.data.friends;
                var data = [];

                for (var i=0;i<friends.length;i++){
                    data.push({
                        uid: friends[i].uid,
                        name: friends[i].username,
                        photo: friends[i].photo
                    })
                }

                $scope.$emit('openModalEvent', {
                    data: data,
                    url: '/api/group/invite',
                    body: {
                        gid: $scope.dataShowing.gid
                    }
                });
            });
    };

    $scope.kickUser = function(){
        $http.get("/api/group/list/" + $scope.dataShowing.gid)
            .then(function(response) {
                var members = response.data.members;
                var data = [];

                for (var i=0;i<members.length;i++){
                    data.push({
                        uid: friends[i].uid,
                        name: members[i].username,
                        photo: members[i].photo
                    })
                }

                $scope.$emit('openModalEvent', {
                    data: data,
                    url: '/api/group/kick',
                    body: {
                        gid: $scope.dataShowing.gid
                    }
                });
            });
    }
});

app.controller('sendMessageController', function($scope, $http) {
    $scope.$on('openChatEvent', function(event, args) {
        var friend = args["friend"];
        var group = args["group"];

        if (friend) {
            $scope.friend = friend;
            $scope.group = null;
        } else if (group) {
            $scope.group = group;
            $scope.friend = null;
        }
    });

    $scope.send = function(){
        var url = '';
        if ($scope.friend) {
            url = '/api/chat/user/' + $scope.friend.uid;
        } else if ($scope.group) {
            url = '/api/chat/group/' + $scope.group.gid;
        }

        if (url) {
            $http.post(url,  { 'message' : $scope.message })
                .then(function(response){
                    $scope.message = '';
                    console.log(response)
                });
        }
    }
});

app.controller('chooseUserController', function($scope, $http, $timeout) {
    $scope.$on('showModalEvent', function(event, args) {
        $scope.url = args.url;
        $scope.data = args.data;
        $scope.body = args.body;
        $scope.selection = [];
        $scope.show();
    });

    $scope.show = function(){
        $('.modal').modal('show')
    };

    $scope.hide = function(){
        $('.modal').modal('hide')
    };

    // toggle selection for a given fruit by name
    $scope.toggleSelection = function toggleSelection(fruitName) {
        var idx = $scope.selection.indexOf(fruitName);

        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
        } else { // is newly selected
            $scope.selection.push(fruitName);
        }
    };
    
    $scope.submit = function(){
        var body = $scope.body || {};
        body.users = $scope.selection;

        $http.post($scope.url, body)
            .then(function(response){
                console.log(response);
                $scope.hide();
            });
    }
});

app.controller('appController', function($scope) {
    $scope.$on('clickChatEvent', function(event, args) {
        $scope.$broadcast('openChatEvent', args);
    });

    $scope.$on('openModalEvent', function(event, args) {
        console.log('appController openModalEvent');
        $scope.$broadcast('showModalEvent', args);
    });
});

$(function(){
    // Init first time page load
    var clearIntervalHandler = setInterval(function(){
        var $listItem = $('.group-panel, .friend-panel').find('.friend-list li');
        if ($listItem.length) {
            $listItem.get(0).click();
            clearInterval(clearIntervalHandler)
        }
    }, 300);
});

var socket = io(window.location.hostname);