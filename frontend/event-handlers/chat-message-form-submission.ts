const form = document.querySelector("form#chat-message-form") as HTMLFormElement;

export const handle = () => {
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const elements = (event.target as HTMLFormElement).elements;
      const input = elements.namedItem("message") as HTMLInputElement;

      const message = input.value;
      input.value = "";

      const { roomId } = await fetch("/api/room-id", { method: "post" }).then((res) => res.json());

      await fetch(`/chat/${roomId}`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
    });
  }
};
