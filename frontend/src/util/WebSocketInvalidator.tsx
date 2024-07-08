import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useWebSocket from "react-use-websocket";
import { useSelector } from "react-redux";

const WebSocketInvalidator = () => {
  const queryClient = useQueryClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = useSelector((state: any) => state.auth.user?._id);

  const handleWebSocketMessage = (message: MessageEvent) => {
    if (!userId) return;
    const data = JSON.parse(message.data);
    switch (data.message) {
      case "groupDataChanged":
        queryClient.invalidateQueries({ queryKey: ["groups"] });
        break;
      case "friendDataChanged":
        queryClient.invalidateQueries({ queryKey: ["friends"] });
        break;
      default:
        break;
    }
  };

  const { sendJsonMessage } = useWebSocket("ws://localhost:8000", {
    onMessage: handleWebSocketMessage,
  });

  useEffect(() => {
    if (userId) {
      sendJsonMessage({ type: "register", userId });
    }
  }, [sendJsonMessage, userId]);

  return null;
};

export default WebSocketInvalidator;
