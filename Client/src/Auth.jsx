import { useState } from "react";

export default function Auth({ onLogin }) {
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const endpoint = isRegister ? "register" : "login";

            const response = await fetch(
                `http://localhost:5000/api/users/${endpoint}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(
                        isRegister
                            ? { ...form, role: "farmer" }
                            : { email: form.email, password: form.password }
                    ),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Authentication failed");
            }

            localStorage.setItem("agritech_token", data.token);
            localStorage.setItem("agritech_user", JSON.stringify(data.user));

            setMessage(data.message || "Success!");
            if (onLogin) onLogin(data.user);
        } catch (error) {
            setMessage(error.message || "Unable to connect to the server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="auth-container">
            <h2>{isRegister ? "Create Farmer Account" : "Welcome Back"}</h2>

            <form onSubmit={handleSubmit}>
                {isRegister && (
                    <>
                        <input
                            placeholder="Full name"
                            required
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                        />
                        <input
                            placeholder="Phone number"
                            value={form.phone}
                            onChange={(e) =>
                                setForm({ ...form, phone: e.target.value })
                            }
                        />
                    </>
                )}

                <input
                    type="email"
                    placeholder="Email address"
                    required
                    value={form.email}
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                />

                <input
                    type="password"
                    placeholder="Password"
                    required
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />

                <button type="submit" disabled={loading}>
                    {loading
                        ? "Please wait..."
                        : isRegister
                            ? "Register"
                            : "Login"}
                </button>
            </form>

            {message && <p role="status">{message}</p>}

            <button
                type="button"
                onClick={() => {
                    setIsRegister(!isRegister);
                    setMessage("");
                }}
            >
                {isRegister
                    ? "Already have an account? Login"
                    : "New farmer? Register"}
            </button>
        </section>
    );
}