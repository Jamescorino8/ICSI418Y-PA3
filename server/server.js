const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { MongoClient, ObjectId } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI);

const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.json({
        message: "Server is running"
    });
});

const db = client.db("pa2");
const users = db.collection("users");
const projects = db.collection("projects");
// each document links one user to one project by ObjectId (many-to-many)
const projectMemberships = db.collection("projectMemberships");

const STATUSES = ["Planning", "Active", "Completed"];

app.post("/signup", async (req, res) => {
    const { f_name, l_name, username, password } = req.body;

    if (!f_name || !l_name || !username || !password) {
        return res.status(400).json({
            message: "Required information is missing"
        });
    }

    try {
        const result = await users.findOne({
            username: username
        });

        if (result !== null) {
            return res.status(409).json({
                message: "Username already exists"
            });
        }

        await users.insertOne({
            f_name: f_name,
            l_name: l_name,
            username: username,
            password: password
        });

        res.status(201).json({
            message: "User created successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    // check required fields before using the database; return 400 if either is missing
    if (!username || !password) {
        return res.status(400).json({
            message: "Required information is missing"
        });
    }

    try {
        // search for user
        const user = await users.findOne({
            username: username
        });

        // return stops the route here so it doesn't read user.password on null
        if (user === null) {
            return res.status(401).json({
                message: "User not found"
            });
        }
        // return stops the route here so it doesn't also send the 200 below
        if (user.password !== password) {
            return res.status(401).json({
                message: "Invalid login credentials"
            });
        }
        res.status(200).json({ message: "Login successful" })

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// return registered users for the Project Lead and member dropdowns (password left out)
app.get("/api/users", async (req, res) => {
    try {
        const result = await users.find({}, { projection: { password: 0 } }).toArray();
        res.status(200).json(result);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

app.post("/api/projects", async (req, res) => {
    const { name, description, status, project_lead_id } = req.body;

    if (!name || !description || !status || !project_lead_id) {
        return res.status(400).json({
            message: "Required information is missing"
        });
    }

    if (!STATUSES.includes(status)) {
        return res.status(400).json({
            message: "Invalid status"
        });
    }

    // check before converting; new ObjectId() throws on an invalid string
    if (!ObjectId.isValid(project_lead_id)) {
        return res.status(400).json({
            message: "Invalid Project Lead id"
        });
    }

    try {
        const leadId = new ObjectId(project_lead_id);

        const lead = await users.findOne({
            _id: leadId
        });

        if (lead === null) {
            return res.status(404).json({
                message: "Project Lead does not exist"
            });
        }

        const result = await projects.insertOne({
            name: name,
            description: description,
            status: status,
            project_lead_id: leadId
        });

        // the Project Lead is also a member of the new project
        await projectMemberships.insertOne({
            project_id: result.insertedId,
            user_id: leadId
        });

        res.status(201).json({
            message: "Project created successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

app.get("/api/projects", async (req, res) => {
    try {
        const result = await projects.find({}).toArray();
        res.status(200).json(result);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// returns the membership documents; the client maps user_id to a name
app.get("/api/projects/:projectId/members", async (req, res) => {
    const { projectId } = req.params;

    if (!ObjectId.isValid(projectId)) {
        return res.status(400).json({
            message: "Invalid project id"
        });
    }

    try {
        const project = await projects.findOne({
            _id: new ObjectId(projectId)
        });

        if (project === null) {
            return res.status(404).json({
                message: "Project does not exist"
            });
        }

        const result = await projectMemberships.find({
            project_id: project._id
        }).toArray();

        res.status(200).json(result);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

app.post("/api/projects/:projectId/members", async (req, res) => {
    const { projectId } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({
            message: "Required information is missing"
        });
    }

    if (!ObjectId.isValid(projectId) || !ObjectId.isValid(user_id)) {
        return res.status(400).json({
            message: "Invalid project or user id"
        });
    }

    try {
        const project = await projects.findOne({
            _id: new ObjectId(projectId)
        });

        if (project === null) {
            return res.status(404).json({
                message: "Project does not exist"
            });
        }

        const user = await users.findOne({
            _id: new ObjectId(user_id)
        });

        if (user === null) {
            return res.status(404).json({
                message: "User does not exist"
            });
        }

        // a user may only be added to the same project once
        const existingMembership = await projectMemberships.findOne({
            project_id: project._id,
            user_id: user._id
        });

        if (existingMembership !== null) {
            return res.status(409).json({
                message: "User is already a member of this project"
            });
        }

        await projectMemberships.insertOne({
            project_id: project._id,
            user_id: user._id
        });

        res.status(201).json({
            message: "Member added successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

app.delete("/api/projects/:projectId/members/:userId", async (req, res) => {
    const { projectId, userId } = req.params;

    if (!ObjectId.isValid(projectId) || !ObjectId.isValid(userId)) {
        return res.status(400).json({
            message: "Invalid project or user id"
        });
    }

    try {
        const project = await projects.findOne({
            _id: new ObjectId(projectId)
        });

        if (project === null) {
            return res.status(404).json({
                message: "Project does not exist"
            });
        }

        // the current Project Lead cannot be removed
        if (project.project_lead_id.equals(userId)) {
            return res.status(400).json({
                message: "The Project Lead cannot be removed"
            });
        }

        const result = await projectMemberships.deleteOne({
            project_id: project._id,
            user_id: new ObjectId(userId)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "User is not a member of this project"
            });
        }

        res.status(200).json({
            message: "Member removed successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

app.listen(9000, () => {
    console.log("Server running on port 9000");
});

async function connectDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Could not connect to MongoDB");
        console.error(error);
    }
}

connectDatabase();