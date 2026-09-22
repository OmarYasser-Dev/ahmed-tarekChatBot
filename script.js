/* =========================================
   GOMAA AI CHAT WIDGET
========================================= */


// =====================================================
// 1. ضع رابط الـ N8N Webhook هنا فقط
// =====================================================

const WEBHOOK_URL =
    "https://coins-art-neon-decreased.trycloudflare.com/webhook/b570bc23-53ae-453e-bccf-6142c8ce1b38/chat";


// مثال:
//
// const WEBHOOK_URL =
//     "https://example.com/webhook/xxxxx/chat";


// =====================================================
// 2. عناصر الواجهة
// =====================================================

const widget =
    document.getElementById("gomaa-chat-widget");

const chatWindow =
    document.getElementById("chat-window");

const chatToggle =
    document.getElementById("chat-toggle");

const closeChat =
    document.getElementById("close-chat");

const messagesContainer =
    document.getElementById("chat-messages");

const chatInput =
    document.getElementById("chat-input");

const sendButton =
    document.getElementById("send-message");

const typingIndicator =
    document.getElementById("typing-indicator");

const resetChat =
    document.getElementById("reset-chat");

const SESSION_STORAGE_KEY =
    "gomaa_ai_chat_session";

let welcomeMessage =
    document.getElementById("welcome-message");


// =====================================================
// 3. Session ID
// =====================================================

function createSessionId() {

    return (
        "gomaa-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 10)
    );
}


function getSessionId() {

    let sessionId =
        localStorage.getItem(SESSION_STORAGE_KEY);

    if (!sessionId) {

        sessionId = createSessionId();

        localStorage.setItem(
            SESSION_STORAGE_KEY,
            sessionId
        );
    }

    return sessionId;
}


function resetSessionId() {

    const sessionId = createSessionId();

    localStorage.setItem(
        SESSION_STORAGE_KEY,
        sessionId
    );

    return sessionId;
}


// =====================================================
// 4. فتح الشات
// =====================================================

function openChat() {

    widget.classList.add("is-open");

    chatToggle.setAttribute(
        "aria-expanded",
        "true"
    );

    chatWindow.setAttribute(
        "aria-hidden",
        "false"
    );

    setTimeout(() => {

        chatInput.focus();

    }, 250);
}


// =====================================================
// 5. قفل الشات
// =====================================================

function closeChatWindow() {

    widget.classList.remove("is-open");

    chatToggle.setAttribute(
        "aria-expanded",
        "false"
    );

    chatWindow.setAttribute(
        "aria-hidden",
        "true"
    );
}


// =====================================================
// 6. فتح / غلق
// =====================================================

chatToggle.addEventListener(
    "click",
    () => {

        const isOpen =
            widget.classList.contains("is-open");

        if (isOpen) {

            closeChatWindow();

        } else {

            openChat();

        }

    }
);


closeChat.addEventListener(
    "click",
    closeChatWindow
);


function getWelcomeMarkup() {

    return `
        <div id="welcome-message" class="welcome-message">
            <div class="welcome-icon">
                <span class="welcome-glow" aria-hidden="true"></span>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 3V5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <rect x="4" y="6" width="16" height="13" rx="4" stroke="currentColor" stroke-width="1.8"/>
                    <circle cx="9" cy="12" r="1" fill="currentColor"/>
                    <circle cx="15" cy="12" r="1" fill="currentColor"/>
                </svg>
            </div>
            <h3>أسألني أي حاجة هنا ي حبي</h3>
            <p>أسألني عن أي تفاصيل محتاج تعرفها</p>
        </div>
    `;
}


function resetConversation() {

    hideTyping();

    messagesContainer.replaceChildren();
    messagesContainer.innerHTML = getWelcomeMarkup();

    welcomeMessage =
        document.getElementById("welcome-message");

    resetSessionId();

    chatInput.value = "";
    autoResizeTextarea();

    sendButton.disabled = false;
    chatInput.disabled = false;
    chatInput.focus();
}


resetChat.addEventListener(
    "click",
    resetConversation
);


// =====================================================
// 7. إنشاء رسالة
// =====================================================

function createMessage(
    text,
    type = "ai"
) {

    const message =
        document.createElement("div");

    message.className =
        `message ${type}`;

    message.textContent =
        text;

    messagesContainer.appendChild(
        message
    );

    scrollToBottom();

    return message;
}


// =====================================================
// 8. Scroll للأسفل
// =====================================================

function scrollToBottom() {

    requestAnimationFrame(() => {

        messagesContainer.scrollTop =
            messagesContainer.scrollHeight;

    });
}


// =====================================================
// 9. إظهار / إخفاء الكتابة
// =====================================================

function showTyping() {

    typingIndicator.classList.remove(
        "hidden"
    );

    scrollToBottom();
}


function hideTyping() {

    typingIndicator.classList.add(
        "hidden"
    );

}


// =====================================================
// 10. استخراج رد الـ N8N
// =====================================================

function extractAIResponse(data) {

    // لو N8N رجع Array
    if (Array.isArray(data)) {

        data = data[0];
    }


    // لو رجع نص عادي
    if (typeof data === "string") {

        return data;
    }


    // الأماكن الشائعة لرد الذكاء الاصطناعي
    const possibleResponses = [

        data?.output,

        data?.response,

        data?.answer,

        data?.reply,

        data?.text,

        data?.message,

        data?.data?.output,

        data?.data?.response,

        data?.data?.answer,

        data?.data?.reply,

        data?.result,

        data?.result?.output,

        data?.result?.response

    ];


    for (
        const response
        of possibleResponses
    ) {

        if (
            typeof response === "string" &&
            response.trim()
        ) {

            return response.trim();
        }
    }


    // لو رجع JSON غير متوقع
    return null;
}


// =====================================================
// 11. إرسال الرسالة
// =====================================================

async function sendMessage() {

    const message =
        chatInput.value.trim();


    // منع إرسال رسالة فاضية
    if (!message) {

        return;
    }


    // إخفاء رسالة الترحيب بعد أول سؤال
    if (welcomeMessage) {

        welcomeMessage.remove();
    }


    // إضافة رسالة المستخدم أولاً حتى لو مفيش اتصال
    createMessage(
        message,
        "user"
    );


    // تنظيف الحقل
    chatInput.value = "";

    autoResizeTextarea();


    // التأكد من وجود الرابط
    if (
        !WEBHOOK_URL ||
        WEBHOOK_URL.includes(
            "ضع_رابط_الويب_هوك"
        )
    ) {

        createMessage(
            "رابط المساعد لم يتم إعدادُه بعد.",
            "error"
        );

        return;
    }


    // تعطيل الإرسال مؤقتاً
    sendButton.disabled = true;

    chatInput.disabled = true;


    // إظهار Loading
    showTyping();


    try {

        const sessionId =
            getSessionId();


        /*
         * البيانات المرسلة إلى N8N
         *
         * chatInput:
         * الحقل الأساسي للمحادثة
         *
         * sessionId:
         * للحفاظ على جلسة المستخدم
         *
         * message:
         * موجود كحقل إضافي لو الـ workflow
         * محتاجه في Node أخرى
         */

        const requestBody = {

            chatInput:
                message,

            sessionId:
                sessionId,

            message:
                message

        };


        const response =
            await fetch(
                WEBHOOK_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            requestBody
                        )
                }
            );


        // فشل HTTP
        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }


        // محاولة قراءة JSON
        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        let responseData;


        if (
            contentType.includes(
                "application/json"
            )
        ) {

            responseData =
                await response.json();

        } else {

            responseData =
                await response.text();
        }


        // استخراج رد AI
        const aiResponse =
            extractAIResponse(
                responseData
            );


        if (!aiResponse) {

            throw new Error(
                "لم يتم العثور على رد من الـ Workflow."
            );
        }


        hideTyping();


        createMessage(
            aiResponse,
            "ai"
        );

    }

    catch (error) {

        console.error(
            "Gomaa AI Error:",
            error
        );


        hideTyping();


        createMessage(
            "حصلت مشكلة أثناء الاتصال بالمساعد. حاول مرة تانية.",
            "error"
        );

    }

    finally {

        sendButton.disabled =
            false;

        chatInput.disabled =
            false;

        chatInput.focus();

    }

}


// =====================================================
// 12. زر الإرسال
// =====================================================

sendButton.addEventListener(
    "click",
    sendMessage
);


// =====================================================
// 13. Enter للإرسال
// Shift + Enter = سطر جديد
// =====================================================

chatInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


// =====================================================
// 14. تكبير Textarea تلقائياً
// =====================================================

function autoResizeTextarea() {

    chatInput.style.height =
        "auto";


    const newHeight =
        Math.min(
            chatInput.scrollHeight,
            120
        );


    chatInput.style.height =
        `${newHeight}px`;
}


chatInput.addEventListener(
    "input",
    autoResizeTextarea
);


// =====================================================
// 15. إرسال باستخدام Ctrl + Enter
// =====================================================

chatInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


// =====================================================
// 16. إغلاق عند الضغط خارج النافذة
// =====================================================

document.addEventListener(
    "click",
    (event) => {

        const clickedInsideWidget =
            widget.contains(
                event.target
            );


        if (
            !clickedInsideWidget &&
            widget.classList.contains(
                "is-open"
            )
        ) {

            closeChatWindow();

        }

    }
);
