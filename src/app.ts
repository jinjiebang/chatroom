import express from 'express'
import http from 'http'
import socketIo from 'socket.io'
enum ChatRoomEvent {
    Login = "Login",
    DisplayUser = "DisplayUser",
    Shake = "Shake",
    LoginSuccess = "LoginSuccess",
    LoginError = "LoginError",
    System = "System",
    SendMsg = "SendMsg",
    ReceiveMsg = "ReceiveMsg",
}
interface UserInfo {
    name: string,
    avatar: string,
}
let userNames: string[] = [];
let userInfos: UserInfo[] = [];
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
io.on('connection', socket => {
    console.log('a user connect');
    let curUser: UserInfo
    io.emit(ChatRoomEvent.DisplayUser, userInfos);
    socket.on(ChatRoomEvent.Login, user => {
        if (userNames.indexOf(user.name) > -1) {
            socket.emit(ChatRoomEvent.LoginError);
        } else {
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
    })
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
        let index = curUser ? userNames.indexOf(curUser.name) : -1;
        if (index > -1) {
            userNames.splice(index);
            userInfos.splice(index);
            io.emit(ChatRoomEvent.System, {  // 系统通知
                name: curUser.name,
                status: '离开'
            });
            io.emit(ChatRoomEvent.DisplayUser, userInfos);
        }
    });
    // 发送窗口抖动
    socket.on(ChatRoomEvent.Shake, ()=> {
        socket.emit(ChatRoomEvent.Shake, {
            name: '您'
        });
        socket.broadcast.emit(ChatRoomEvent.Shake, {
            name: curUser.name
        });
    });
})
server.listen(3000);