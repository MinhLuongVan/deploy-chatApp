<template>
  <div
    @click="joinConversation(conversation._id)"
    class="intro-x cursor-pointer box relative flex items-center p-5 mt-5 hover:bg-slate-400"
  >
    <div class="w-12 h-12 flex-none image-fit mr-1">
      <img
        alt="Midone Tailwind HTML Admin Template"
        class="rounded-full"
        v-bind:src="conversation?.userDetails[0]?.avatar"
      />
      <div
        class="w-3 h-3 bg-success absolute right-0 bottom-0 rounded-full border-2 border-white dark:border-darkmode-600"
      ></div>
    </div>
    <div class="ml-2 overflow-hidden">
      <div class=" flex items-center justify-between">
          <div class="w-36 ">
            <a href="javascript:" class="font-medium">{{
          conversation?.userDetails[0]?.username
        }}</a>
          </div>
          <div class="text-xs ml-14 text-slate-600 ">
          {{ moment(conversation?.lastMessage?.createdAt).format("HH:mm") }}
          </div>
          <Dropdown
          v-if="
            conversation.whoBlock === '' ||
            conversation.whoBlock === authStore.currentUser.userInfor._id
          "
          class=" sm:ml-0"
        >
          <DropdownToggle class="text-slate-600 hover:bg-slate-400">
              <MoreVerticalIcon class="w-4 h-4 ml-10 " />
          </DropdownToggle>
          <DropdownMenu class="w-40">
            <DropdownContent>
              <DropdownItem
                v-if="!conversation.isBlock"
                class="text-red-500"
                @click="actionBlockConversation(conversation._id)"
              >
                <LockIcon class="w-4 h-4 mr-2" />Block
              </DropdownItem>
              <DropdownItem
                v-if="
                  conversation.whoBlock ===
                    authStore.currentUser.userInfor._id && conversation.isBlock
                "
                @click="actionUnblockConversation(conversation._id)"
              >
                <UnlockIcon class="w-4 h-4 mr-2" />Unblock
              </DropdownItem>
              <!-- <DropdownItem class="text-red-500">
              <Trash2Icon class="w-4 h-4 mr-2"/> Delete
            </DropdownItem> -->
            </DropdownContent>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div class="w-full truncate text-slate-500 mt-0.5">
        {{ conversation?.lastMessage?.text }}
      </div>
    </div>
    <div
      v-if="
        conversation?.unreadMessage.length > 0 &&
        conversation?.lastMessage?.sender !==
          authStore.currentUser.userInfor._id
      "
      class="w-5 h-5 flex items-center justify-center absolute top-0 right-0 text-xs text-white rounded-full bg-primary font-medium -mt-1 -mr-1"
    >
      {{ conversation?.unreadMessage.length }}
    </div>
  </div>
</template>

<script lang="ts">
import { useConversationStore } from "../stores/conversation-store";
import moment from "moment";
import { useAuthStore } from "../stores/auth-store";
import { Message } from "../types/message-type";
import MessageService from "../services/MessageService";
import ConversationService from "../services/ConversationService";
import {
  setNotificationFailedWhenGetData,
  setNotificationToastMessage,
} from "../utils/MyFunction";
import { Conversation } from "../types/conversation-type";
import {ref} from 'vue';

export default {
  name: "Conversation",
  props: ["conversation", "socket"],
  // @ts-ignore
  setup(props) {
    const conversationStore = useConversationStore();
    const authStore = useAuthStore();
    const isBlock = ref(false);

    async function actionMarkReadMessage(conversationId: string) {
      const data = {
        conversationId: conversationId,
      } as Message;
      const response = await MessageService.markRead(data);

      if (response.data) {
        if (!response.data.success) {
          setNotificationToastMessage(response.data.message, false);
        }
      } else {
        setNotificationFailedWhenGetData();
      }
    }

    async function joinConversation(conversationId: string) {
      props.socket.emit("join_conversation", conversationId);
      conversationStore.openChat();
      // Lấy thông tin cuộc trò chuyện
      await conversationStore.getChatDetail(conversationId);

      // Change to read message
      if (
        authStore.currentUser.userInfor._id !==
        props.conversation?.lastMessage?.sender
      ) {
        await actionMarkReadMessage(conversationId);
      }

      // Scroll tới cuối cùng
      const element: HTMLElement | any = await document.getElementById(
        "message-box",
      );
      element.scrollTop = element.scrollHeight;
    }

    async function actionBlockConversation(_id: string) {
      const data = {
        _id: _id,
      } as Conversation;
      const response = await ConversationService.block(data);
      if (response.data) {
        console.log(response.data);
        if (response.data.success) {
          setNotificationToastMessage("Block successfully", true);
           conversationStore.closeChat();
           props.socket.emit("listen_message_change", {});
        } else {
          setNotificationToastMessage("Block fail", false);
        }
      } else {
        setNotificationFailedWhenGetData();
      }
    }

    async function actionUnblockConversation(_id: string) {
      const data = {
        _id: _id,
      } as Conversation;
      const response = await ConversationService.unblock(data);
      if (response.data) {
        if (response.data.success) {
          setNotificationToastMessage("Unblock successfully", true);
           conversationStore.closeChat();
           props.socket.emit("listen_message_change", {});
        } else {
          setNotificationToastMessage("Unblock fail", false);
        }
      } else {
        setNotificationFailedWhenGetData();
      }
    }
    return {
      conversationStore,
      joinConversation,
      actionBlockConversation,
      actionUnblockConversation,
      moment,
      authStore,
    };
  },
};
</script>

<style></style>
