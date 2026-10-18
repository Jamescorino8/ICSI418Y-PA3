// projects only store project_lead_id, so the lead's username is
// looked up in the already-fetched users list
function ProjectList({ projects, users }) {
    function getUsername(userId) {
        const user = users.find((user) => user._id === userId);
        return user ? user.username : "Unknown user";
    }

    return (
        <div>
            <h2>Projects</h2>
            {projects.length === 0 && <p>No projects yet</p>}
            <ul>
                {projects.map((project) => (
                    <li key={project._id}>
                        <strong>{project.name}</strong> ({project.status})
                        <br />
                        {project.description}
                        <br />
                        Project Lead: {getUsername(project.project_lead_id)}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ProjectList;
