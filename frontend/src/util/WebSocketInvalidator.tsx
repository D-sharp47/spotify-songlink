import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useWebSocket from "react-use-websocket";
import { useSelector } from "react-redux";
import { StoreType } from "./types";

const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "songlink.co"; // Forcing for now

const WebSocketInvalidator = () => {
  const queryClient = useQueryClient();
  const userId = useSelector((state: StoreType) => state.auth.user?._id);

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

  const { sendJsonMessage } = useWebSocket(`wss://${backendUrl}/ws`, {
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
