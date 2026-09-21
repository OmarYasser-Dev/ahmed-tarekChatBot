(function () {
    "use strict";

    // منع إنشاء أكثر من Widget
    if (document.getElementById("gomaa-ai-widget-frame")) {
        return;
    }

    const iframe = document.createElement("iframe");

    iframe.id = "gomaa-ai-widget-frame";

    iframe.src =
        "https://omaryasser-dev.github.io/ahmed-tarekChatBot/";

    iframe.title = "مساعد المنصة";

    iframe.setAttribute("allow", "clipboard-write");

    Object.assign(iframe.style, {
        position: "fixed",
        right: "0",
        bottom: "0",
        width: "430px",
        height: "680px",
        border: "0",
        background: "transparent",
        zIndex: "999999",
        pointerEvents: "auto"
    });

    document.body.appendChild(iframe);

})();
