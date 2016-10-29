var app = angular.module('app-chat', []);

app.controller('userController', function($scope, $http) {
    $http.get("/api/user/me")
        .then(function(response) {
            $scope.me = response.data.me;
        });
});

app.controller('groupController', function($scope, $http, $timeout) {
    $scope.groupMap = {};
    $scope.selectedGroup = null;
    $scope.isActive = function(gid) {
        return gid == $scope.selectedGroup;
    };

    $scope.onGroupClick = function(gid){
        $scope.selectedGroup = gid;
        $scope.$emit('clickChatEvent', {
            group: $scope.groupMap[gid]
        });

        // Remove new message notification
        $scope.groupNewChat[gid] = 0;
    };

    $scope.$on('openChatEvent', function(event, args) {
        if (args["friend"]) $scope.selectedGroup = null;
    });

    $http.get("/api/user/groups")
        .then(function(response) {
            var groups = response.data.groups;
            $scope.groups = groups;

            for (var i=0;i<groups.length;i++){
                (function getLastChat(group){
                    $http.get("/api/chat/group/" + group.gid + "?limit=1")
                        .then(function(response) {
                            var preview = response.data.chats.length ? response.data.chats[0] : null;
                            if (preview) {
                                group.preview = preview;
                                group.preview.create_time = moment(group.preview.create_time).fromNow();
                            } else {
                                group.preview = {
                                    content: 'New Group Created'
                                }
                            }

                            $scope.groupMap[group.gid] = group;
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

                setTimeout(function(){
                    angular.element('input[name="add-group"]').trigger('blur');
                    $scope.addNewGroupInput = ''
                });
            });
    };

    $scope.groupNewChat = {};
    $scope.countNewChat = function(gid){
        return $scope.groupNewChat[gid] ? $scope.groupNewChat[gid] : '';
    };
    //
    // socket.on('newGroupChat', function (chat) {
    //     if (!$scope.groupMap[chat.chat_to_group]){
    //         // If not exist then push to array
    //         $scope.groups.push(chat);
    //     }
    //
    //     // Overwrite existing value
    //     $scope.groupMap[chat.chat_to_group].preview = chat;
    //
    //     // Show new notification message if not currently open
    //     if ($scope.selectedGroup != chat.chat_to_group) {
    //         $scope.groupNewChat[chat.chat_to_group] = $scope.groupNewChat[chat.chat_to_group] ? $scope.groupNewChat[chat.chat_to_group]++ : 1;
    //     }
    // });

    socket.on('newGroupCreated', function(data) {
        $scope.groups.push({
            nama: data.group.nama,
            preview: {
                content: 'New Group Created'
            },
            gid: data.group.gid
        });

        $timeout(function() {
            $scope.$apply();
        });

        $scope.groupMap[data.group.gid] = data.group;
    });

    socket.on('groupKickUser', function(data) {
        $scope.groupMap[data.group.gid].preview.content = 'You have been kicked from this group';

        $timeout(function() {
            $scope.$apply();
        });
    });

    socket.on('groupInviteUser', function(data) {
        $scope.groups.push({
            nama: data.group.nama,
            preview: {
                content: 'You have been invited to this group'
            },
            gid: data.group.gid
        });

        $timeout(function() {
            $scope.$apply();
        });

        $scope.groupMap[data.group.gid] = data.group;
    });
});

app.controller('friendController', function($scope, $http, $timeout) {
    $scope.friendMap = {};
    $scope.selectedUser = null;
    $scope.isActive = function(uid) {
        return uid == $scope.selectedUser;
    };

    $scope.onUserClick = function(uid){
        $scope.selectedUser = uid;
        $scope.$emit('clickChatEvent', {
            friend: $scope.friendMap[uid]
        });

        // Remove new message notification
        $scope.friendNewChat[uid] = 0;
    };

    $scope.$on('openChatEvent', function(event, args) {
        if (args["group"]) $scope.selectedUser = null;
    });

    $http.get("/api/user/friends")
        .then(function(response) {
            var friends = response.data.friends;
            $scope.friends = friends;

            for (var i=0;i<friends.length;i++){
                (function getLastChat(friend){
                    $http.get("/api/chat/user/" + friend.uid + "?limit=1")
                        .then(function(response) {
                            var preview = response.data.chats.length ? response.data.chats[0] : null;
                            if (preview) {
                                friend.preview = preview;
                                friend.preview.create_time = moment(friend.preview.create_time).fromNow();
                            } else {
                                friend.preview = {
                                    content: 'Start chatting..'
                                }
                            }

                            $scope.friendMap[friend.uid] = friend;
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
        $http.post("/api/user/add", {user : {username: $scope.addNewUserInput}})
            .then(function(response) {
                $scope.errorMessage = '';
                $scope.toggleAddNewUser();
            }, function(response){
                $scope.errorMessage = response.data.error
            });
    };

    $scope.friendNewChat = {};
    $scope.countNewChat = function(uid){
        return $scope.friendNewChat[uid] ? $scope.friendNewChat[uid] : '';
    };

    // socket.on('newFriendChat', function (chat) {
    //     if (!$scope.friendMap[chat.chat_to]){
    //         // If not exist then push to array
    //         $scope.friends.push(chat);
    //     }
    //
    //     // Overwrite existing value
    //     $scope.friendMap[chat.chat_to].preview = chat;
    //
    //     if ($scope.selectedUser != chat.chat_to) {
    //         $scope.friendNewChat[chat.chat_to] = $scope.friendNewChat[chat.chat_to] ? $scope.friendNewChat[chat.chat_to]++ : 1;
    //     }
    // });

    socket.on('userAdd', function (data) {
        if (window.uid == data.from.uid) {
            $scope.friends.push({
                username: data.user.username,
                photo: data.user.photo,
                preview: {
                    content: 'Start chatting..'
                },
                uid: data.user.uid
            });
        } else {
            $scope.friends.push({
                username: data.from.username,
                photo: data.from.photo,
                preview: {
                    content: 'You have been added as friend.'
                },
                uid: data.from.uid
            });
        }


        $timeout(function() {
            $scope.$apply();
        });

        $scope.friendMap[data.user.uid] = data.user;
    });
});

app.controller('chatController', function($scope, $http, $timeout) {
    $scope.user = {};
    $scope.hasUserData = {};
    $scope.friendChat = {};
    $scope.groupChat = {};

    $scope.$on('openChatEvent', function(event, args) {
        var friend = args["friend"];
        var group = args["group"];

        if (friend) {
            $scope.dataShowing = friend;

            if (!$scope.friendChat[friend.uid]) {
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

                        // Save ajax result
                        $scope.friendChat[friend.uid] = chats;
                    });
            } else {
                $scope.chats = $scope.friendChat[friend.uid];
            }
        } else if (group) {
            $scope.dataShowing = group;

            if (!$scope.groupChat[group.gid]) {
                $http.get("/api/chat/group/" + group.gid)
                    .then(function (response) {
                        var chats = response.data.chats;

                        for (var i = 0; i < chats.length; i++) {
                            var chat = chats[i];
                            chat.create_time = moment(chat.create_time).fromNow();

                            if (!$scope.hasUserData[chat.chat_from]) {
                                // Get friend data
                                $http.get("/api/user/uid/" + chat.chat_from)
                                    .then(function (response) {
                                        $scope.user[chat.chat_from] = response.data;
                                        $timeout(function () {
                                            $scope.$apply();
                                        });
                                    });

                                $scope.hasUserData[chat.chat_from] = true;
                            }
                        }

                        $scope.chats = chats;
                        $scope.title = group.nama;

                        // Save ajax result
                        $scope.groupChat[group.gid] = chats;
                    });
            } else {
                $scope.chats = $scope.groupChat[group.gid];
            }
        }
    });

    $scope.isMyChat = function(chat){
        return chat.chat_from == window.uid;
    };

    $scope.inviteUser = function(){
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
                        group: {
                            gid: $scope.dataShowing.gid
                        }
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
                    // Skip self
                    if (members[i].uid == window.uid) continue;

                    data.push({
                        uid: members[i].uid,
                        name: members[i].username,
                        photo: members[i].photo
                    })
                }

                $scope.$emit('openModalEvent', {
                    data: data,
                    url: '/api/group/kick',
                    body: {
                        group: {
                            gid: $scope.dataShowing.gid
                        }
                    }
                });
            });
    };

    socket.on('newFriendChat', function (chat) {
        chat.create_time = moment(chat.create_time).fromNow();

        if (!$scope.hasUserData[chat.chat_from]) {
            // Get friend data
            $http.get("/api/user/uid/" + chat.chat_from)
                .then(function(response) {
                    $scope.user[chat.chat_from] = response.data;
                    $timeout(function() {
                        $scope.$apply();
                    });
                });

            $scope.hasUserData[chat.chat_from] = true;
        }

        $scope.friendChat[chat.chat_to] = $scope.friendChat[chat.chat_to] || [];
        $scope.friendChat[chat.chat_to].push(chat);
    });

    socket.on('newGroupChat', function (chat) {
        chat.create_time = moment(chat.create_time).fromNow();

        if (!$scope.hasUserData[chat.chat_from]) {
            // Get friend data
            $http.get("/api/user/uid/" + chat.chat_from)
                .then(function(response) {
                    $scope.user[chat.chat_from] = response.data;
                    $timeout(function() {
                        $scope.$apply();
                    });
                });

            $scope.hasUserData[chat.chat_from] = true;
        }

        $scope.groupChat[chat.chat_to_group] = $scope.groupChat[chat.chat_to_group] || [];
        $scope.groupChat[chat.chat_to_group].push(chat);
    });
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
    // var clearIntervalHandler = setInterval(function(){
    //     var $listItem = $('.group-panel, .friend-panel').find('.friend-list li');
    //     if ($listItem.length) {
    //         $listItem.get(0).click();
    //         clearInterval(clearIntervalHandler)
    //     }
    // }, 300);
    //
    // setTimeout(function(){
    //     clearInterval(clearIntervalHandler);
    // }, 10000);

    // var $listItem = $('.group-panel, .friend-panel').find('.friend-list li');
    // if ($listItem.length) {
    //     $listItem.get(0).click();
    //     clearInterval(clearIntervalHandler)
    // }

    // Chat Panel
    $('.chat-box').outerWidth($('.chat-panel').width());

    clearIntervalHandler = setInterval(function(){
        $(window).on('resize', function(){
            var spaceSize = $('body > .container').height() - $('.user-panel').outerHeight(true) - 10;

            // Sidebar Panel
            $('.group-panel').outerHeight(spaceSize * 0.4);
            $('.friend-panel').outerHeight(spaceSize * 0.6 - 30);

            // Adjust chat panel size, make it scrollable
            $('.chat-panel').height($('.sidebar-panel').height())
        }).trigger('resize'); //on page load
    }, 300);

    setTimeout(function(){
        clearInterval(clearIntervalHandler);
    }, 10000);
});