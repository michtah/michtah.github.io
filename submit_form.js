const SUPABASE_URL = "https://lkkutuznybjkxsitdwtu.supabase.co";

        const SUPABASE_ANON = "sb_publishable_ghuj0ZCK9J6LbuOdRpPloA_iIWNKv52";

        document.getElementById("contact-form").addEventListener("submit", async function (event) {
            event.preventDefault();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const message = document.getElementById("message").value.trim();
            const btn = document.getElementById("submit-btn");
            const status = document.getElementById("form-status");

            btn.disabled = true;
            btn.textContent = "Sending...";
            status.textContent = "";

            try {
                const response = await fetch(
                    `${SUPABASE_URL}/rest/v1/contact_messages` , {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "apikey": SUPABASE_ANON,
                            "Authorization": `Bearer ${SUPABASE_ANON}`,
                            "Prefer": "return=minimal"
                        },
                        body: JSON.stringify({ name, email, message})
                    }
                );

                if (response.ok) {
                    status.textContent = "Message sent! I will be in touch soon.";
                    status.style.color = "#1A7A4A";
                    event.target.reset();
                } else {
                    const err = await response.json();
                    console.error("Supabase error:", err);
                    status.textContent = "Something went wrong. Please try again.";
                    status.style.color = "#DC2626";
                }
            } catch (networkError) {
                console.error("Network error:", networkError);
                status.textContent = "Could not connect. Check your internet connection.";
                status.style.color = "#DC2626";
            } finally {
                btn.disabled = false;
                btn.textContent = "Send Message"
            }
        });