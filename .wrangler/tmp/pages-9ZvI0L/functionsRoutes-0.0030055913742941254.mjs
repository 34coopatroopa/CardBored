import { onRequestGet as __api_process_decklist_js_onRequestGet } from "D:\\Card Bound\\functions\\api\\process-decklist.js"
import { onRequestPost as __api_process_decklist_js_onRequestPost } from "D:\\Card Bound\\functions\\api\\process-decklist.js"
import { onRequest as __api_card_proxy_js_onRequest } from "D:\\Card Bound\\functions\\api\\card-proxy.js"

export const routes = [
    {
      routePath: "/api/process-decklist",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_process_decklist_js_onRequestGet],
    },
  {
      routePath: "/api/process-decklist",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_process_decklist_js_onRequestPost],
    },
  {
      routePath: "/api/card-proxy",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_card_proxy_js_onRequest],
    },
  ]