const request = require("supertest")
const Task = require("../src/models/task")
const app = require("../src/app")
const {
    userOne,
    setupDatabase,
    taskOneId,
    userTwo
} = require("./fixtures/db")

beforeEach(setupDatabase)

test("Should create task for user", async () => {
    const response = await request(app).post("/tasks")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({
            "description": "Test task creation"
        })
        .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toBe(false)
})

test("Should get task related to logged in user", async () => {
    const response = await request(app).get("/tasks")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toBe(2)
})

test("Logged in user should not delete task related to other user", async () => {
    await request(app).delete(`/tasks/${taskOneId}`)
        .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    const task = await Task.findById(taskOneId)
    expect(task).not.toBeNull()
})

test("Logged in user should delete task", async () => {
    await request(app).delete(`/tasks/${taskOneId}`)
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const task = await Task.findById(taskOneId)
    expect(task).toBeNull()
})