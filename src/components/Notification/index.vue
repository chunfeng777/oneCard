<template>
  <div></div>
</template>

<script lang="ts" setup>
import { ElNotification } from "element-plus";
import { Client } from "@stomp/stompjs";
// import Stomp from "stompjs";
import { TOKEN_KEY } from "@/enums/CacheEnum";
import TicketsAPI from "@/api/tickets";
import { useNotificationStore } from "@/store/modules/useNotificationStore";

interface MessageType {
  type?: number; // 消息类型：
  sender?: string;
  content: string;
  ticketId?: number;
  id: number;
  title?: string;
}

const notificationStore = useNotificationStore();

const isConnected = ref(false); //是否连接
const socketEndpoint = ref(import.meta.env.VITE_APP_WS_ENDPOINT); // WebSocket 地址
// const socketEndpoint = ref("http://192.168.10.187:8989/ws"); // 文杰后端

const messages = ref<MessageType[]>([]);
const router = useRouter();

let stompClient: Client; //stomp对象
const timer = ref<null | number>(null); // 定时器
let connectSum = ref<number>(0); // 重新连接次数
let getTimerInfo: Function; //定时器执行方法

// 连接websocket
function connectWebSocket() {
  const token = localStorage.getItem(TOKEN_KEY) || "";
  stompClient = new Client({
    brokerURL: socketEndpoint.value,
    connectHeaders: {
      Authorization: token,
    },

    debug: (str: any) => {
      console.log(str);
    },

    onConnect: () => {
      console.log("连接成功");
      isConnected.value = true;
      messages.value.push({
        sender: "Server",
        content: "Websocket 已连接",
        type: 1,
        id: 0,
      });

      // 订阅通知主题
      stompClient.subscribe("/topic/notice", (res: any) => {
        const messageData = JSON.parse(res.body) as MessageType;
        handleNotification(messageData); // 处理通知消息
      });

      // 订阅个人消息队列(工单)
      stompClient.subscribe("/user/queue/greeting", (res) => {
        console.log(res.body);
        const messageData = JSON.parse(res.body) as MessageType;
        handleNotification(messageData); // 处理个人消息
        console.log(messageData);
      });

      // getTimerInfo();
    },

    onStompError: (frame: any) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    },
    // webscoket 关闭
    onWebSocketClose: () => {
      if (connectSum.value < 5) {
        connectSum.value++;
        isConnected.value = false;
        console.log(
          `Websocket 已断开，重新连接中!,第${connectSum.value}次重连`
        );
      } else {
        stompClient.deactivate();
        console.log("连接断开！");
      }
    },
    //stomp 连接断开
    onDisconnect: () => {},
  });

  stompClient.activate();
}
// 定时器添加
getTimerInfo = () => {
  clearTimeout(<number>timer.value);
  timer.value = null;
  const token = localStorage.getItem(TOKEN_KEY) || "";
  timer.value = window.setTimeout(() => {
    stompClient.publish({
      destination: "/app/auth",
      body: JSON.stringify({ token: token }),
    });
    getTimerInfo();
  }, 30000);
};

// function connectWebSocket() {
//   let socket = new WebSocket(socketEndpoint.value);

//   stompClient = Stomp.over(socket);
//   const token = localStorage.getItem(TOKEN_KEY);
//   console.log(token);

//   stompClient.connect(
//     { Authorization: token },
//     () => {
//       isConnected.value = true;
//       messages.value.push({
//         sender: "Server",
//         content: "Websocket 已连接",
//         type: 1,
//         ticketId: 0,
//         id: 0,
//       });

//       // 发送认证消息
//       // stompClient.send("/app/auth", {}, JSON.stringify({ token: token }));

//       // 订阅通知主题
//       stompClient.subscribe("/topic/notice", (res: any) => {
//         const messageData = JSON.parse(res.body) as MessageType;
//         handleNotification(messageData); // 处理通知消息
//       });
//       // 订阅个人消息队列
//       stompClient.subscribe("/user/queue/greeting", (res) => {
//         console.log(res.body);
//         const messageData = JSON.parse(res.body) as MessageType;
//         handleNotification(messageData); // 处理个人消息
//         console.log(messageData);
//       });
//     },
//     (error) => {
//       console.log("连接失败: " + error);
//       isConnected.value = false; // 更新连接状态
//       messages.value.push({
//         sender: "Server",
//         content: "Websocket 已断开",
//         type: 1,
//         ticketId: 0,
//         id: 0,
//       });
//     }
//   );
// }
const notificationTypeMap: Record<
  number,
  "success" | "warning" | "info" | "error"
> = {
  1: "info",
  2: "warning",
  3: "success",
  4: "error",
};

function isValidNotificationType(type?: number): type is 1 | 2 | 3 | 4 {
  return type === 1 || type === 2 || type === 3 || type === 4;
}

function handleNotification(messageData: MessageType) {
  if (isValidNotificationType(messageData.type)) {
    const typeString = notificationTypeMap[messageData.type];
    openNotification(
      typeString,
      messageData.title ?? "Server",
      // messageData.sender ?? "Server",
      messageData.content,
      messageData.ticketId, // 传递id
      messageData.id
    );
  } else {
    console.error(`Unsupported notification type: ${messageData.type}`);
    // 处理不支持的通知类型
  }
  messages.value.push({
    sender: messageData.sender ?? "Server",
    content: messageData.content,
    ticketId: messageData.ticketId,
    id: messageData.id,
    title: messageData.title,
  });
}
// function disconnectWebSocket() {
//   if (stompClient && stompClient.connected) {
//     stompClient.disconnect(() => {
//       isConnected.value = false; // 更新连接状态
//       messages.value.push({
//         sender: "Server",
//         content: "Websocket 已断开",
//         type: "tip",
//       });
//     });
//   }
// }
// 打开通知函数
const openNotification = (
  type: "success" | "warning" | "info" | "error",
  title: string,
  message: string,
  ticketId?: number,
  id?: number
) => {
  ElNotification({
    title,
    message,
    type,
    offset: 70, // 设置通知框距离顶部的偏移量
    duration: 3000, // 设置通知框显示时间为 3 秒
    customClass: `el-notification__${type}`, // 设置通知的类型类名
    onClick: async () => {
      if (ticketId !== undefined) {
        // 标记通知为已读
        if (id !== undefined) {
          await TicketsAPI.readNotice(id);
        }
        // 跳转到详情页面并刷新页面
        await router.push({
          path: "/workorder/processingticket",
          query: { id: ticketId.toString() },
        });
        // 更新 lastUpdated，触发订阅者获取最新数据
        notificationStore.updateLastUpdated();
      }
    },
  });
};

onMounted(() => {
  connectWebSocket();
});
</script>
<style>
/* 全局 CSS 文件或者单个组件的样式 */
.el-notification {
  position: fixed;
  top: 20px; /* 调整通知框距离顶部的位置 */
  right: 20px; /* 调整通知框距离右侧的位置 */
  z-index: 9999; /* 设置通知框的层级 */
  box-sizing: border-box;
  width: 300px; /* 设置通知框的宽度 */
  max-width: 80%; /* 设置通知框的最大宽度 */
  height: 100px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgb(0 0 0 / 15%);
}

.el-notification__group {
  display: flex;
  align-items: center; /* 确保内容垂直居中 */
  justify-content: space-between;
  margin-top: -10px;
}

.el-notification__title {
  font-size: 16px;
}

.el-notification__closeBtn {
  position: absolute;
  top: 20px;
  right: 10px;
  font-size: 12px;
  cursor: pointer;
  transform: translateY(-50%);
}

/* 成功通知的样式 */
.el-notification__success {
  color: #67c23a; /* 设置成功通知的文字颜色 */
  background-color: #e9f7e3; /* 设置成功通知的背景色 */
  border-color: #fff; /* 设置成功通知的边框颜色 */
}

/* 警告通知的样式   接受 */
.el-notification__warning {
  color: #4e93ee; /* 设置警告通知的文字颜色 */
  background-color: #e7eff8; /* 设置警告通知的背景色 */
  border-color: #fff; /* 设置警告通知的边框颜色 */
}

/* 信息通知的样式 */
.el-notification__info {
  color: #4e93ee; /* 设置信息通知的文字颜色 */
  background-color: #e7eff8; /* 设置信息通知的背景色 */
  border-color: #fff; /* 设置信息通知的边框颜色 */
}

/* 错误通知的样式 */
.el-notification__error {
  color: #dd9a36; /* 设置错误通知的文字颜色 */
  background-color: #fdf4e6; /* 设置错误通知的背景色 */
  border-color: #fffefe; /* 设置错误通知的边框颜色 */
}

.notification {
  position: fixed;
  top: 17%;
  right: 20px; /* 调整通知框距离右侧的位置 */
  z-index: 9999; /* 设置通知框的层级 */
  box-sizing: border-box;
  display: flex;
  flex-direction: column; /* 将通知框内容按列排布 */
  align-items: flex-start; /* 从左侧对齐 */
  width: 260px; /* 设置通知框的宽度 */
  max-width: 80%; /* 设置通知框的最大宽度 */
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgb(0 0 0 / 15%);
}
</style>
