const request = require("supertest")
const app = require("../src/app")
const User = require("../src/models/user")
const { userOne, userOneId, setupDatabase } = require("./fixtures/db")

beforeEach(setupDatabase)

test("Should not signup user with invalid email", async () => {
    await request(app).post("/users")
        .send({
            name: "mk",
            email: "mk1234gmail.com",
            password: "12343434"
        })
        .expect(400)
})

test("Should signup a new user", async () => {
    const response = await request(app).post("/users").send({
        name: "Andrew",
        email: "andrew@example.com",
        password: "MyPass888!"
    }).expect(201)

    // Assert that db was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response body
    expect(response.body).toMatchObject({
        user: {
            name: "Andrew",
            email: "andrew@example.com"
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe("MyPass888!")
})

test("Should login the user", async () => {
    const response = await request(app).post("/users/login").send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(response.body.user._id)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test("Should not login the user with wrong credentials", async () => {
    await request(app).post("/users/login").send({
        email: "mike@mike.com",
        password: userOne.password
    }).expect(400)
})

test("Should get profile data for user", async () => {
    await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test("Should not get profile data for user", async () => {
    await request(app)
        .get("/users/me")
        .send()
        .expect(401)
})

test("Should delete profile data for user", async () => {
    const response = await request(app)
        .delete("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(response.body._id)
    expect(user).toBeNull()
})

test("Should npt delete profile data for user", async () => {
    await request(app)
        .delete("/users/me")
        .send()
        .expect(401)
})

test("Should upload avatar image", async () => {
    await request(app).post("/user/me/avatar")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .attach("avatar", "tests/fixtures/profile-pic.jpg")
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test("Should update valid user fields", async () => {
    await request(app).patch("/users/me")
        .send({
            "name": "test"
        })
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.name).toBe("test")
})

test("Should not update valid user fields", async () => {
    await request(app).patch("/users/me")
        .send({
            "location": "test"
        })
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .expect(400)
})