const copyEmail = document.querySelector("#copy-collaboration-email");
const address = document.querySelector("#collaboration-email");
const status = document.querySelector("#collaboration-contact-status");
const persian = document.documentElement.lang === "fa";

if (navigator.clipboard?.writeText) {
  copyEmail.hidden = false;
  copyEmail.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(address.textContent.trim());
      status.textContent = persian ? "نشانی ایمیل کپی شد." : "Email address copied.";
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(address);
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = persian
        ? "نشانی ایمیل انتخاب شد. برای ادامه آن را کپی کنید."
        : "The email address is selected. Copy it to continue.";
    }
  });
}
