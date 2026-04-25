import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { createMessageComplaintRequest } from "../api/complaints.api";
import { getMessagesRequest, sendMessageRequest } from "../api/chats.api";
import { useAuthStore } from "../store/auth.store";
import { useChatStore } from "../store/chat.store";

function formatMessageTime(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function appendUniqueMessage(messages, nextMessage) {
  if (messages.some((message) => message.id === nextMessage.id)) {
    return messages;
  }

  return [...messages, nextMessage];
}

function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const messagesEndRef = useRef(null);

  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const conversations = useChatStore((state) => state.conversations);
  const isLoadingConversations = useChatStore(
    (state) => state.isLoadingConversations,
  );
  const lastIncomingMessage = useChatStore(
    (state) => state.lastIncomingMessage,
  );
  const loadConversations = useChatStore((state) => state.loadConversations);
  const joinConversation = useChatStore((state) => state.joinConversation);
  const leaveConversation = useChatStore((state) => state.leaveConversation);

  const [activeConversationId, setActiveConversationId] = useState(
    searchParams.get("conversation") || "",
  );
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const activeConversation = useMemo(() => {
    return (
      conversations.find(
        (conversation) => conversation.id === activeConversationId,
      ) || null
    );
  }, [conversations, activeConversationId]);

  async function loadMessages(conversationId) {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    setError("");

    try {
      const data = await getMessagesRequest(conversationId, accessToken);
      setMessages(data.items || []);
      await loadConversations(accessToken);
    } catch (error) {
      setError(
        error?.response?.data?.message || "Не вдалося завантажити повідомлення",
      );
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }

  useEffect(() => {
    if (accessToken) {
      loadConversations(accessToken).then((items) => {
        const conversationFromUrl = searchParams.get("conversation");
        const nextActiveId =
          conversationFromUrl || activeConversationId || items[0]?.id || "";

        if (nextActiveId) {
          setActiveConversationId(nextActiveId);
        }
      });
    }
  }, [accessToken]);

  useEffect(() => {
    const conversationFromUrl = searchParams.get("conversation") || "";

    if (conversationFromUrl && conversationFromUrl !== activeConversationId) {
      setActiveConversationId(conversationFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }

    loadMessages(activeConversationId);

    const params = new URLSearchParams(searchParams);
    params.set("conversation", activeConversationId);
    setSearchParams(params, { replace: true });

    joinConversation(activeConversationId);

    return () => {
      leaveConversation(activeConversationId);
    };
  }, [activeConversationId]);

  useEffect(() => {
    if (!lastIncomingMessage || !activeConversationId) {
      return;
    }

    if (lastIncomingMessage.conversationId === activeConversationId) {
      if (lastIncomingMessage.message.senderId === user?.id) {
        setMessages((prev) =>
          appendUniqueMessage(prev, lastIncomingMessage.message),
        );
      } else {
        loadMessages(activeConversationId);
      }
    }
  }, [lastIncomingMessage, activeConversationId, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  function handleSelectConversation(conversationId) {
    setActiveConversationId(conversationId);
  }

  async function submitMessage() {
    const cleanText = text.trim();

    if (!cleanText || !activeConversationId || isSending) {
      return;
    }

    setIsSending(true);
    setError("");

    try {
      const data = await sendMessageRequest(
        activeConversationId,
        {
          text: cleanText,
        },
        accessToken,
      );

      setMessages((prev) => appendUniqueMessage(prev, data.item));
      setText("");
      await loadConversations(accessToken);
    } catch (error) {
      setError(
        error?.response?.data?.message || "Не вдалося надіслати повідомлення",
      );
    } finally {
      setIsSending(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await submitMessage();
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  }

  async function handleMessageComplaint(messageId) {
    const isConfirmed = window.confirm("Поскаржитися на це повідомлення?");

    if (!isConfirmed) {
      return;
    }

    try {
      const data = await createMessageComplaintRequest(
        messageId,
        {
          reason: "INAPPROPRIATE",
          text: "Користувач поскаржився на повідомлення з діалогу.",
        },
        accessToken,
      );

      setError(data.message || "Скаргу надіслано");
    } catch (error) {
      setError(error?.response?.data?.message || "Не вдалося надіслати скаргу");
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-toolbar">
          <div>
            <span className="hero-kicker">Особистий кабінет</span>
            <h1>Повідомлення</h1>
            <p>
              Тут відображаються діалоги між покупцем і продавцем. Повідомлення
              зберігаються в базі та оновлюються в реальному часі.
            </p>
          </div>

          <Link to="/ads" className="button button-secondary">
            До каталогу
          </Link>
        </div>

        {error ? <div className="form-error page-message">{error}</div> : null}

        <section className="chat-layout">
          <aside className="chat-sidebar">
            <div className="chat-sidebar-head">
              <h2>Діалоги</h2>
            </div>

            {isLoadingConversations ? (
              <div className="chat-empty">Завантаження діалогів...</div>
            ) : conversations.length ? (
              <div className="conversation-list">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    className={`conversation-item ${
                      conversation.id === activeConversationId ? "active" : ""
                    }`}
                    onClick={() => handleSelectConversation(conversation.id)}
                  >
                    <strong>
                      {conversation.otherUser?.fullName || "Користувач"}
                      {conversation.unreadCount > 0 ? (
                        <span className="conversation-unread">
                          {conversation.unreadCount > 9
                            ? "9+"
                            : conversation.unreadCount}
                        </span>
                      ) : null}
                    </strong>
                    <span>
                      {conversation.ad?.title || "Діалог без оголошення"}
                    </span>
                    <small>
                      {conversation.lastMessage?.text || "Повідомлень ще немає"}
                    </small>
                  </button>
                ))}
              </div>
            ) : (
              <div className="chat-empty">
                Діалогів поки немає. Відкрийте оголошення та натисніть “Написати
                продавцю”.
              </div>
            )}
          </aside>

          <div className="chat-main">
            {activeConversation ? (
              <>
                <div className="chat-head">
                  <div>
                    <h2>
                      {activeConversation.otherUser?.fullName || "Користувач"}
                    </h2>
                    {activeConversation.ad ? (
                      <Link to={`/ads/${activeConversation.ad.slug}`}>
                        {activeConversation.ad.title}
                      </Link>
                    ) : (
                      <span>Діалог</span>
                    )}
                  </div>
                </div>

                <div className="messages-list">
                  {loadingMessages ? (
                    <div className="chat-empty">
                      Завантаження повідомлень...
                    </div>
                  ) : messages.length ? (
                    messages.map((message) => {
                      const isMine = message.senderId === user?.id;

                      return (
                        <div
                          key={message.id}
                          className={`message-bubble ${isMine ? "mine" : ""}`}
                        >
                          <p>{message.text}</p>
                          <small>
                            {message.sender?.fullName || "Користувач"} ·{" "}
                            {formatMessageTime(message.createdAt)}
                          </small>

                          {!isMine ? (
                            <button
                              type="button"
                              className="message-complaint-button"
                              onClick={() => handleMessageComplaint(message.id)}
                            >
                              Поскаржитися
                            </button>
                          ) : null}
                        </div>
                      );
                    })
                  ) : (
                    <div className="chat-empty">
                      Повідомлень ще немає. Напишіть перше повідомлення.
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <form className="message-form" onSubmit={handleSubmit}>
                  <textarea
                    className="input message-input"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Напишіть повідомлення..."
                  />

                  <button
                    type="submit"
                    className="button"
                    disabled={isSending || !text.trim()}
                  >
                    {isSending ? "Надсилання..." : "Надіслати"}
                  </button>
                </form>
              </>
            ) : (
              <div className="chat-placeholder">
                <div className="state-icon">💬</div>
                <h2>Оберіть діалог</h2>
                <p>Після вибору діалогу тут з’явиться історія повідомлень.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default MessagesPage;
