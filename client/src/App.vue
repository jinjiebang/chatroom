<template>
  <div id="app">
    <div v-if="logined===false" class="name">
      <!-- <h2>请输入你的昵称</h2> -->
      <input type="text" v-model="nickName" @keyup.enter="login" placeholder="请输入昵称..." />
      <button id="nameBtn" @click="login">确 定</button>
    </div>
    <div class="main" :class="{shaking:shaking}">
      <div class="header">
        <img />
        happy聊天室
      </div>
      <div id="container">
        <div class="conversation">
          <ul id="messages" ref="messages">
            <template v-for="item in receiveMsg">
              <template v-if="item.showType==='System'">
                <p class="system" :key="item.key">
                  <span>{{item.key|getCurTime }}</span>
                  <br />
                  <span>{{item.name}} {{item.status}}了聊天室</span>
                </p>
              </template>
              <template v-else-if="item.showType==='Shake'">
                <p class="system" :key="item.key">
                  <span>{{item.key|getCurTime}}</span>
                  <br />
                  <span>{{item.name}}发送了一个窗口抖动</span>
                </p>
              </template>
              <template v-else-if="item.showType==='Image'">
                <li :class="item.side" :key="item.key">
                  <img :src="item.avatar" />
                  <div>
                    <span>{{item.name}}</span>
                    <p style="padding: 0;" v-html="item.msg"></p>
                  </div>
                </li>
              </template>
              <template v-else-if="item.showType==='Chat'">
                <li :class="item.side" :key="item.key">
                  <img :src="item.avatar" />
                  <div>
                    <span>{{item.name}}</span>
                    <p :style="'color:' +item.color" v-html="renderChatData(item.msg)"></p>
                  </div>
                </li>
              </template>
            </template>
          </ul>
          <form action>
            <div class="edit">
              <input type="color" id="color" v-model="fontColor" />
              <i title="自定义字体颜色" id="font" class="fa fa-font"></i>
              <i title="双击取消选择" class="fa fa-smile-o" id="smile" @click="clickSmile"></i>
              <i title="单击页面震动" id="shake" class="fa fa-bolt" @click="sendShake"></i>
              <input type="file" id="file" @change="sendImage($event)" />
              <i class="fa fa-picture-o" id="img"></i>
              <div class="selectBox" v-show="showEmoji">
                <div class="smile" id="smileDiv">
                  <p>经典表情</p>
                  <ul class="emoji">
                    <li v-for="i of 141" :key="i">
                      <img :src="i|emojiPath" @click="clickEmoji" />
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <!-- autocomplete禁用自动完成功能 -->
            <textarea id="m" autofocus v-model="inputMsg" @keyup.prevent.enter="sendMsg"></textarea>
            <button @click.prevent="sendMsg" class="btn rBtn" id="sub">发送</button>
            <button @click.prevent="close" class="btn" id="clear">关闭</button>
          </form>
        </div>
        <div class="contacts">
          <h1>
            在线人员(
            <span id="num">{{onlineUsers.length}}</span>)
          </h1>
          <ul id="users">
            <li v-for="user in onlineUsers" :key="user.name">
              <img :src="user.avatar" />
              <span>{{user.name}}</span>
            </li>
          </ul>
          <p v-if="onlineUsers.length===0">当前无人在线哟~</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";
import "./css/index.css";

let emojiImgs = [];
for (let i = 1; i < 141; i++) {
  emojiImgs.push(require("./images/emoji/emoji (" + i + ").png"));
}
let avatarImgs = [];
for (let i = 1; i <= 4; i++) {
  avatarImgs.push(require('./images/avatar/user' + i + '.jpg'));
}
var socket = io("http://118.190.211.5:3000");

export default {
  mounted: function() {
    socket.on("LoginSuccess", () => {
      this.logined = true;
    });
    socket.on("LoginError", () => {
      alert("用户名已存在，请重新输入！");
      this.nickName = "";
    });
    socket.on("DisplayUser", data => {
      this.onlineUsers = data;
    });
    socket.on("System", data => {
      data.showType = "System";
      data.key = new Date().getTime();
      console.log("system", data);
      this.receiveMsg.push(data);
      this.$nextTick(function() {
        this.scrollToBottom();
      });
    });
    socket.on("ReceiveMsg", data => {
      data.showType = data.type === "img" ? "Image" : "Chat";
       data.key = new Date().getTime();
      console.log("receiveMsg", data);
      this.receiveMsg.push(data);
      this.$nextTick(function() {
        this.scrollToBottom();
      });
    });
    socket.on("Shake", data => {
      this.showType = "Shake";
      console.log("Shake", data);
      this.receiveMsg.push(data);
      this.$nextTick(function() {
        this.scrollToBottom();
        this.shake();
      });
    });
  },
  data: function() {
    return {
      nickName: "",
      logined: false,
      onlineUsers: [],
      receiveMsg: [],
      showEmoji: false,
      inputMsg: "",
      fontColor: "#000000",
      timer: 0,
      shaking: false
    };
  },
  filters: {
    emojiPath: function(i) {
      return emojiImgs[i - 1];
    },
    getCurTime: function(time) {
      return new Date(time).toTimeString().substr(0, 8);
    },
  },
  methods: {
    login: function() {
      console.log("login");
      let imgN = Math.floor(Math.random() * 4);
      if (this.nickName !== "") {
        socket.emit("Login", {
          name: this.nickName,
          avatar: avatarImgs[imgN]
        });
      }
    },
    clickSmile: function() {
      this.showEmoji = !this.showEmoji;
    },
    clickEmoji: function(ev) {
      var src = ev.target.src;
      let str = src.match(/\((.+?)\)/g)[0];
      var emojiNum = str.substr(1, str.length - 2);
      this.inputMsg += "[emoji" + emojiNum + "]";
      this.showEmoji = false;
    },
    sendMsg: function() {
      console.log("color", this.fontColor, "inputMsg", this.inputMsg);
      if (this.inputMsg === "") {
        alert("请输入内容！");
        return;
      }
      socket.emit("SendMsg", {
        msg: this.inputMsg,
        color: this.fontColor,
        type: "text"
      });
      this.inputMsg = "";
    },
    sendShake: function() {
      console.log("sendShake");
      socket.emit("Shake");
    },
    renderChatData: function(msg) {
      var content = "";
      while (msg.indexOf("[") > -1) {
        // 其实更建议用正则将[]中的内容提取出来
        var start = msg.indexOf("[");
        var end = msg.indexOf("]");

        content += "<span>" + msg.substr(0, start) + "</span>";
        let index = msg.substr(start + 6, end - start - 6) - 1;
        content += `<img src="${emojiImgs[index]}">`;
        msg = msg.substr(end + 1, msg.length);
      }
      if (content === "") {
        content += msg;
      } else {
        content += "<span>" + msg + "</span>";
      }
      return content;
    },
    shake() {
      this.shaking = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.shaking = false;
      }, 500);
    },
    scrollToBottom() {
      let messages = this.$refs.messages;
      messages.scrollTop = messages.scrollHeight;
    },
    sendImage(evt) {
      console.log("sendImage");
      var file = evt.target.files[0]; // 上传单张图片
      var reader = new FileReader();

      //文件读取出错的时候触发
      reader.onerror = function() {
        console.log("读取文件失败，请重试！");
      };
      // 读取成功后
      reader.onload = function() {
        var src = reader.result; // 读取结果
        var img = '<img class="sendImg" src="' + src + '">';
        socket.emit("SendMsg", {
          // 发送
          msg: img,
          color: color,
          type: "img"
        });
      };
      reader.readAsDataURL(file); // 读取为64位
    },
    close: function() {
      this.inputMsg = "";
      socket.emit("disconnect");
    }
  }
};
</script>

<style lang="css">
</style>