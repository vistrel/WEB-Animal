import { create } from "zustand";
import { createSocket } from "../api/socket";
import { getConversationsRequest } from "../api/chats.api";

function getTotalUnread(conversations) {
  return conversations.reduce(
    (sum, item) => sum + Number(item.unreadCount || 0),
    0,
  );
}

function isSoundEnabled() {
  const value = localStorage.getItem("petua:sound-enabled");
  return value === null ? true : value === "true";
}

function playIncomingMessageSound() {
  if (!isSoundEnabled()) {
    return;
  }

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      return;
    }

    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(620, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      820,
      audioContext.currentTime + 0.08,
    );

    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.08,
      audioContext.currentTime + 0.02,
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audioContext.currentTime + 0.16,
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.18);

    setTimeout(() => {
      audioContext.close().catch(() => null);
    }, 300);
  } catch (error) {
    return null;
  }
}

export const useChatStore = create((set, get) => ({
  socket: null,
  conversations: [],
  totalUnread: 0,
  isLoadingConversations: false,
  lastIncomingMessage: null,

  loadConversations: async (accessToken) => {
    if (!accessToken) {
      set({
        conversations: [],
        totalUnread: 0,
        isLoadingConversations: false,
      });

      return [];
    }

    set({ isLoadingConversations: true });

    try {
      const data = await getConversationsRequest(accessToken);
      const conversations = data.items || [];

      set({
        conversations,
        totalUnread: getTotalUnread(conversations),
        isLoadingConversations: false,
      });

      return conversations;
    } catch (error) {
      set({
        conversations: [],
        totalUnread: 0,
        isLoadingConversations: false,
      });

      return [];
    }
  },

  connectChatSocket: (accessToken, userId) => {
    if (!accessToken || !userId) {
      return;
    }

    const currentSocket = get().socket;

    if (currentSocket) {
      currentSocket.disconnect();
    }

    const socket = createSocket(accessToken);

    socket.on("message:new", (payload) => {
      set({
        lastIncomingMessage: payload,
      });

      if (payload?.message?.senderId && payload.message.senderId !== userId) {
        playIncomingMessageSound();
      }

      get().loadConversations(accessToken);
    });

    socket.on("conversation:updated", () => {
      get().loadConversations(accessToken);
    });

    set({ socket });
  },

  disconnectChatSocket: () => {
    const socket = get().socket;

    if (socket) {
      socket.disconnect();
    }

    set({
      socket: null,
      conversations: [],
      totalUnread: 0,
      lastIncomingMessage: null,
      isLoadingConversations: false,
    });
  },

  joinConversation: (conversationId) => {
    const socket = get().socket;

    if (socket && conversationId) {
      socket.emit("conversation:join", conversationId);
    }
  },

  leaveConversation: (conversationId) => {
    const socket = get().socket;

    if (socket && conversationId) {
      socket.emit("conversation:leave", conversationId);
    }
  },
}));
