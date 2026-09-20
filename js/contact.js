/**
 * contact.js
 * Validates the enquiry form and drives its loading, success and error
 * states, then inserts the enquiry into Supabase (see submitEnquiry
 * below). Falls back to a simulated success if Supabase isn't
 * configured yet, so the form still works for a design review.
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
    const textEl = statusBox.querySelector("[data-form-status-text]");
    if (textEl) textEl.textContent = message || "";
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Sending..." : "Send Enquiry";
  }

  // Inserts into the "enquiries" table (see supabase/schema.sql). If
  // js/config.js's Supabase URL/anon key are not filled in yet, this
  // falls back to a simulated success so the form can still be
  // demonstrated end to end.
  async function submitEnquiry(payload) {
    if (typeof supabaseClient === "undefined" || !supabaseClient) {
      return new Promise((resolve) => {
        window.setTimeout(() => resolve({ ok: true }), 900);
      });
    }

    const { error } = await supabaseClient.from("enquiries").insert({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      enquiry_type: payload.enquiryType,
      message: payload.message
    });

    return { ok: !error };
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
