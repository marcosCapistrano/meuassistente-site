// Endpoint dos formulários (FormSubmit envia as mensagens para este e-mail).
// No primeiro envio, o FormSubmit manda um e-mail de ativação para este endereço.
const FORM_ENDPOINT = "https://formsubmit.co/ajax/contato@meuassistente.io";

// Menu mobile
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
if (toggle && links) {
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}

// Borda do header ao rolar
const header = document.querySelector(".site-header");
const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Animação de entrada
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
}

// Máscara simples de WhatsApp: (11) 91234-5678
document.querySelectorAll('input[name="whatsapp"]').forEach((input) => {
  input.addEventListener("input", () => {
    const d = input.value.replace(/\D/g, "").slice(0, 11);
    let out = d;
    if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
    input.value = out;
  });
});

// Envio dos formulários
document.querySelectorAll("form[data-form]").forEach((form) => {
  const status = form.querySelector(".form-status");
  const button = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.className = "form-status";
    status.textContent = "";

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const phone = form.querySelector('input[name="whatsapp"]');
    if (phone && phone.value.replace(/\D/g, "").length < 10) {
      status.className = "form-status err";
      status.textContent = "Informe um WhatsApp válido com DDD.";
      phone.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    if (data._honey) return; // bot

    button.disabled = true;
    const label = button.textContent;
    button.textContent = "Enviando...";

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...data,
          _subject: form.dataset.form === "waitlist" ? "Nova inscrição na lista de espera" : "Nova mensagem de contato",
          _template: "table",
          _captcha: "false",
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      status.className = "form-status ok";
      status.textContent =
        form.dataset.form === "waitlist"
          ? "Pronto! Você está na lista de espera. Avisaremos assim que liberarmos seu acesso."
          : "Mensagem enviada! Responderemos o quanto antes.";
    } catch {
      status.className = "form-status err";
      status.textContent = "Não foi possível enviar agora. Tente novamente ou escreva para contato@meuassistente.io.";
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  });
});
