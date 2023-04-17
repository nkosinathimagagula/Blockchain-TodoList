const { assert } = require("chai")

const TodoList = artifacts.require('./TodoList.sol')

contract('TodoList', (accounts) => {
    // get a copy of the todolist before each task runs
    before(async () => {
        this.todoList = await TodoList.deployed()
    })

    it('deploys successfully', async () => {
        const address = await this.todoList.address

        assert.notEqual(address, 0x0)
        assert.notEqual(address, '')
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    })

    it('lists tasks', async () => {
        const taskCount = await this.todoList.taskCount()
        const task = await this.todoList.tasks(taskCount)

        assert.equal(task.id.toNumber(), taskCount.toNumber())
        assert.equal(task.content, 'This todolist runs on the blockchain.')
        assert.equal(task.completed, false)
        assert.equal(taskCount.toNumber(), 1)
    })

    it('creates tasks', async () => {
        const results = await this.todoList.createTask('A new task.')
        const taskCount = await this.todoList.taskCount()
        const event = results.logs[0].args

        assert.equal(taskCount, 2)
        assert.equal(event.id.toNumber(), 2)
        assert.equal(event.content, 'A new task.')
        assert.equal(event.completed, false)

    })
})
