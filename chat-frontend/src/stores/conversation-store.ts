import {defineStore, StoreDefinition} from "pinia";
import {Conversation} from "../types/conversation-type";

export const useConversationStore: StoreDefinition = defineStore({
    id: "conversations",
    state: () => ({
        conversations: [] as Conversation[],
        detailConversation: {} as Conversation | undefined,
        inChatting: false as boolean,
        inZoomPicture: false as boolean,
        imageLink: "" as string,
        isLoading: false as boolean,
        block: "" as string
        
    }),
    getters: {},
    actions: {
        getListConversations(conversation: Conversation[]) {
            this.conversations = conversation;
        },

        getChatDetail(conversationId: string) {
            this.detailConversation = this.conversations.find(
                (conversation: Conversation) => conversation._id === conversationId
            );
        },

        openChat() {
            this.inChatting = true;
            this.inZoomPicture = false
        },

        closeChat() {
            this.inChatting = false;          
        },

        openBiggerImage() {
            this.inZoomPicture = true;
        },

        closeImage() {
            this.inZoomPicture = false;
        },

        openLoadingScreen() {
            this.isLoading = true
        },

        closeLoadingScreen() {
            this.isLoading = false
        },

        getZoomImage(imageLink: string) {
            this.imageLink = imageLink
        },
    },
});
