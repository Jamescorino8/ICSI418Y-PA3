import { useState } from "react";

// users: registered users for the Project Lead dropdown
// onCreate: called after a project is saved so the project list refreshes
function CreateProject({ users, onCreate }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("");
    const [leadId, setLeadId] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const response = await fetch(
                "http://localhost:9000/api/projects",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        description: description,
                        status: status,
                        project_lead_id: leadId
                    })
                }
            );
            const data = await response.json();
            setMessage(data.message);
            if (response.ok) {
                onCreate();
            }
        } catch (error) {
            setMessage("Could not connect to the server");
        }
    }

    return (
        <div>
            <h2>Create Project</h2>
            <form onSubmit={handleSubmit}>
                <input
                    placeholder="Name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />
                <input
                    placeholder="Description"
                    type="text"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />
                <select value={status} onChange={(event) => setStatus(event.target.value)}>
                    <option value="">Select Status</option>
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                </select>
                {/* displays the username, submits the user's _id */}
                <select value={leadId} onChange={(event) => setLeadId(event.target.value)}>
                    <option value="">Select Project Lead</option>
                    {users.map((user) => (
                        <option key={user._id} value={user._id}>
                            {user.username}
                        </option>
                    ))}
                </select>
                <button type="submit">Create Project</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default CreateProject;
