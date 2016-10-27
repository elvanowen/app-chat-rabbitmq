var app = angular.module('app-chat', []);

app.controller('userController', function($scope, $http) {
    $scope.username = "elvan.owen";

    $http.get("/api/user/me")
        .then(function(response) {
            var me = response.data.me;
            $scope.me = me;
        });
});

app.controller('groupController', function($scope, $http) {
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
});

app.controller('chatController', function($scope, $http, $timeout) {
    $scope.user = {};
    $scope.hasUserData = {};
    $scope.$on('openChatEvent', function(event, args) {
        var friend = args["friend"];
        var group = args["group"];

        if (friend) {
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

app.controller('appController', function($scope) {
    $scope.$on('clickChatEvent', function(event, args) {
        $scope.$broadcast('openChatEvent', args);
    });
});

$(function(){
    $('.add-new-group, .add-new-user').click(function(){
        var target = $(this).data('target');
        $(target).toggle();
    })
});