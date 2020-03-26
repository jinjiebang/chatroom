"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var http_1 = __importDefault(require("http"));
var socket_io_1 = __importDefault(require("socket.io"));
var ChatRoomEvent;
(function (ChatRoomEvent) {
    ChatRoomEvent["Login"] = "Login";
    ChatRoomEvent["DisplayUser"] = "DisplayUser";
    ChatRoomEvent["Shake"] = "Shake";
    ChatRoomEvent["LoginSuccess"] = "LoginSuccess";
    ChatRoomEvent["LoginError"] = "LoginError";
    ChatRoomEvent["System"] = "System";
    ChatRoomEvent["SendMsg"] = "SendMsg";
    ChatRoomEvent["ReceiveMsg"] = "ReceiveMsg";
})(ChatRoomEvent || (ChatRoomEvent = {}));
var userNames = [];
var userInfos = [];
var app = express_1.default();
var server = http_1.default.createServer(app);
var io = socket_io_1.default(server);
io.on('connection', function (socket) {
    console.log('a user connect');
    var curUser;
    io.emit(ChatRoomEvent.DisplayUser, userInfos);
    socket.on(ChatRoomEvent.Login, function (user) {
        if (userNames.indexOf(user.name) > -1) {
            socket.emit(ChatRoomEvent.LoginError);
        }
        else {
            curUser = user;
            userNames.push(user.name);
            userInfos.push(user);
            socket.emit(ChatRoomEvent.LoginSuccess);
            io.emit(ChatRoomEvent.System, {
                name: user.name,
                status: '进入'
            });
            io.emit(ChatRoomEvent.DisplayUser, userInfos);
            console.log(userNames.length + ' user connect.');
        }
    });
    socket.on(ChatRoomEvent.SendMsg, function (data) {
        socket.broadcast.emit(ChatRoomEvent.ReceiveMsg, {
            name: curUser.name,
            avatar: curUser.avatar,
            msg: data.msg,
            color: data.color,
            type: data.type,
            side: 'left'
        });
        socket.emit(ChatRoomEvent.ReceiveMsg, {
            name: curUser.name,
            avatar: curUser.avatar,
            msg: data.msg,
            color: data.color,
            type: data.type,
            side: 'right'
        });
    });
    socket.on('disconnect', function () {
        var index = curUser ? userNames.indexOf(curUser.name) : -1;
        if (index > -1) {
            userNames.splice(index);
            userInfos.splice(index);
            io.emit(ChatRoomEvent.System, {
                name: curUser.name,
                status: '离开'
            });
            io.emit(ChatRoomEvent.DisplayUser, userInfos);
        }
    });
    // 发送窗口抖动
    socket.on(ChatRoomEvent.Shake, function () {
        socket.emit(ChatRoomEvent.Shake, {
            name: '您'
        });
        socket.broadcast.emit(ChatRoomEvent.Shake, {
            name: curUser.name
        });
    });
});
server.listen(3000);
//# sourceMappingURL=app.js.map