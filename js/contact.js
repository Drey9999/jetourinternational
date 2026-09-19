/**
 * contact.js
 * Validates the enquiry form and drives its loading, success and error
 * states. The public site is being reviewed before Supabase is connected,
 * so submitEnquiry() below is a placeholder: it mimics a network call
 * so the form can be demonstrated end to end, and should be replaced
 * with a real Supabase insert into the "enquiries" table (see
 * supabase/schema.sql once the backend phase begins).
 */
(function () {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const submitBtn = form.querySelector("[data-submit-btn]");
  const statusBox = form.querySelector("[data-form-status]");

  // Prefill enquiry type when arriving from an Automotive/Agriculture CTA,
  // e.g. contact.html?type=vehicle
  const enquiryTypeField = form.querySelector('[name="enquiryType"]');
  const requestedType = new URLSearchParams(window.location.search).get("type");
  if (enquiryTypeField && requestedType) {
    const optionExists = Array.from(enquiryTypeField.options).some((opt) => opt.value === requestedType);
    if (optionExists) enquiryTypeField.value = requestedType;
  }

  const validators = {
    name: (value) => value.trim().length >= 2 || "Please enter your full name.",
    phone: (value) => /^[0-9+()\s-]{7,20}$/.test(value.trim()) || "Please enter a valid phone number.",
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || "Please enter a valid email address.",
    enquiryType: (value) => value !== "" || "Please select an enquiry type.",
    message: (value) => value.trim().length >= 10 || "Please add a few details so we can help."
  };

  function fieldWrap(input) {
    return input.closest(".form-field");
  }

  function validateField(input) {
    const rule = validators[input.name];
    if (!rule) return true;

    const result = rule(input.value);
    const wrap = fieldWrap(input);
    const errorEl = wrap ? wrap.querySelector(".field-error") : null;

    if (result === true) {
      if (wrap) wrap.dataset.state = "valid";
      return true;
    }

    if (wrap) wrap.dataset.state = "invalid";
    if (errorEl) errorEl.textContent = result;
    return false;
  }

  Array.from(form.elements).forEach((input) => {
    if (!validators[input.name]) return;
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (fieldWrap(input) && fieldWrap(input).dataset.state === "invalid") {
        validateField(input);
      }
    });
  });

  function setStatus(state, message) {
    if (!statusBox) return;
    statusBox.dataset.state = state || "";
    statusBox.textContent = message || "";
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Sending..." : "Send Enquiry";
  }

  // Placeholder network call. Replace with a real Supabase insert.
  function submitEnquiry(payload) {
    return new Promise((resolve) => {
      window.setTimeout(() => resolve({ ok: true }), 900);
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus(null, "");

    let isFormValid = true;
    Array.from(form.elements).forEach((input) => {
      if (validators[input.name] && !validateField(input)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      const firstInvalid = form.querySelector('[data-state="invalid"] input, [data-state="invalid"] select, [data-state="invalid"] textarea');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      const result = await submitEnquiry(payload);

      if (result.ok) {
        setStatus("success", "Thank you. Your enquiry has been received and our team will be in touch shortly.");
        form.reset();
        Array.from(form.elements).forEach((input) => {
          if (fieldWrap(input)) fieldWrap(input).dataset.state = "";
        });
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      setStatus("error", "We could not submit your enquiry. Please try again or contact us directly.");
    } finally {
      setLoading(false);
    }
  });
})();
