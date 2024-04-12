if (
  location.href.includes("https://www.blue-tomato.com/") &&
  location.href.includes("/product/")
) {
  (async () => {
    const response = await fetch(
      "http://127.0.0.1:5000/create?url=" + encodeURIComponent(location.href)
    );
    if (!response.ok) {
      alert("Could not create product advisor for page");
    } else {
      createUi(await response.json());
    }
  })();
}

function dom(html) {
  const div = document.createElement("div");
  div.innerHTML = html.trim();
  return div.childNodes[0];
}

function createUi(chat) {
  const ui =
    dom(/*html*/ `<div style="position:fixed; top:0; right:0; z-index:1000; width: 400px; height: 600px; max-height: 100vh; background: black; padding: 16px; border-radius: 8px; color: white; display: flex; flex-direction: column; gap: 16px; font-size: 16px;">
        <div id="content" style="width: 100%; height: 100%; display: flex; flex-direction: column;">
          <div id="messages" style="overflow: auto; display: flex; flex-direction: column;"></div>
          <div id="questions" style="display: flex; flex-direction: column; margin-top: auto;"></div>
          <div style="border: 1px solid #cccccc; max-height: 32px; padding: 8px; margin-top: 8px; border-radius: 8px;">
              <textarea id="input" style="background: none; border: none; outline: none; color: #eee; height: 100%; width: 100%; padding: 0; box-shadow: none;"></textarea>
          </div>
        </div>
    </div>`);
  document.body.append(ui);

  const messagesUi = ui.querySelector("#messages");
  renderMessage(messagesUi, {
    role: "assistant",
    content: "Hi, how can I help you today?",
  });

  const inputUi = ui.querySelector("#input");
  inputUi.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent the default action to avoid adding a new line
      getAnswer(chat, messagesUi, inputUi.value, inputUi);
    }
  });

  const questionsUi = ui.querySelector("#questions");
  renderQuestion(chat, messagesUi, questionsUi, inputUi);
}

async function getAnswer(chat, messagesUi, message, inputUi) {
  renderMessage(messagesUi, { role: "user", content: message });
  inputUi.value = "";
  inputUi.disabled = true;
  try {
    renderMessage(messagesUi, {
      role: "assistant",
      content: "... thinking ...",
    });

    const response = await fetch(
      "http://127.0.0.1:5000/turn?id=" +
        encodeURIComponent(chat.id) +
        "&message=" +
        encodeURIComponent(message)
    );
    if (!response.ok) {
      messagesUi.removeChild(messagesUi.lastChild);
      renderMessage(messagesUi, {
        role: "assistant",
        content: await response.text(),
      });
    } else {
      messagesUi.removeChild(messagesUi.lastChild);
      renderMessage(messagesUi, {
        role: "assistant",
        content: (await response.json()).answer,
      });
    }
  } catch (e) {
    alert(e);
  } finally {
    inputUi.disabled = false;
    inputUi.focus();
  }
}

function renderMessage(messagesUi, message) {
  const messageUi = dom(/*html*/ `
        <div style="display: flex; flex-direction: column; padding: 8px 16px;">
            <span style="font-weight: 600; color: #00f000">${message.role}</span>
            <div style="white-space: pre-wrap;">${message.content}</div>
        </div>
    `);
  messagesUi.append(messageUi);
  messagesUi.scrollTop = messagesUi.scrollHeight;
}

function renderQuestion(chat, messagesUI, questionsUi, inputUi) {
  for (const question of chat.questions) {
    const questionUi = dom(/*html*/ `
    <div style="white-space: pre-wrap; padding: 8px; border: 1px solid #aaa; border-radius: 8px; cursor: pointer; margin-top: 8px; font-size: 12px;">${question}</div>
    `);
    questionUi.addEventListener("click", () => {
      questionUi.remove();
      getAnswer(chat, messagesUI, question.trim(), inputUi);
    });
    questionsUi.append(questionUi);
  }
}
