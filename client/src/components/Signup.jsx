import { useState } from "react";

// onSignup: called after a new user is created so the user dropdowns refresh
function Signup({ onSignup }) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [message, setMessage] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const response = await fetch(
                "http://localhost:9000/signup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        f_name: firstName,
                        l_name: lastName,
                        username: username,
                        password: password
                    })
                }
            );
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                onSignup();
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            setMessage("Could not connect to the server");
        }
    }

    return (
        <div>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <input
                    placeholder="First Name"
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                />
                <input
                    placeholder="Last Name"
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                />
                <input
                    placeholder="Username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                />
                <input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <button type="submit">Sign Up</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default Signup;