App = {
    loading: false,
    contracts: {},
    load: async() => {
        // load app
        await App.loadWeb3();
        await App.loadAccount();
        await App.loadContract();
        await App.render();
        web3.eth.defaultAccount = App.account
    },

    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async() => {
        if (typeof web3 !== 'undefined') {
            // App.web3Provider = web3.currentProvider;
            // web3 = new Web3(web3.currentProvider);
            App.web3Provider = window.ethereum
            web3 = new Web3(window.ethereum)
        } else {
            window.alert("Please connect to Metamask.");
        }

        // Modern dapp browsers
        if (window.ethereum) {
            window.web3 = new Web3(ethereum);
            try {
                // Request account access if needed
                // await ethereum.enable()
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                // Acccounts now exposed
                web3.eth.sendTransaction({/* ... */})
                // window.ethereum.request({ method: 'eth_sendTransaction' });
                } catch (error) {
                // User denied account access...
                }
            }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
            // Acccounts always exposed
            web3.eth.sendTransaction({/* ... */})
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    loadAccount: async() => {
        App.account = web3.eth.accounts[0]
        console.log(App.account)
    },

    loadContract: async() => {
        // JS version of the smart contract
        const todoList = await $.getJSON('TodoList.json')
        App.contracts.TodoList = TruffleContract(todoList)
        App.contracts.TodoList.setProvider(App.web3Provider)
        // console.log(todoList)


        App.todoList = await App.contracts.TodoList.deployed()
    },

    render: async() => {
        // prevent double rendering
        if (App.loading) {
            return
        }

        // update app loading state
        App.setLoading(true)

        // render account
        $('#account').html(App.account)

        // render tasks
        await App.renderTasks()

        // update loading state
        App.setLoading(false) 
    },

    createTask: async () => {
        App.setLoading(true)
        const content = $('#newTask').val()
        await App.todoList.createTask(content)
        window.location.reload()
    },

    setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')

        if (boolean) {
            loader.show()
            content.hide()
        } else {
            loader.hide()
            content.show()
        }
    },

    renderTasks: async() => {
        // load total task count from the blockchain
        const taskCount = await App.todoList.taskCount()
        const $taskTemplate = $('.taskTemplate')

        // render out each task with a new task template
        for ( let i = 1; i <= taskCount; i++) {
            // fetch the task data from the blockchain
            const task = await App.todoList.tasks(i)
            const taskId = task[0].toNumber()
            const taskContent = task[1]
            const taskCompleted = task[2]

            // create the html for the task
            const $newTaskTemplate = $taskTemplate.clone()
            $newTaskTemplate.find('.content').html(taskContent)
            $newTaskTemplate.find('input')
                            .prop('name', taskId)
                            .prop('checked', taskCompleted)
                            // .on('click', App.toggleCompleted)
            
            // put task in the correct list
            if (taskCompleted) {
                $('#completedTaskList').append($newTaskTemplate)
            } else {
                $('#taskList').append($newTaskTemplate)
            }

            // show the task
            $newTaskTemplate.show()
        }
    },
}

$(() => {
    $(window).load(() => {
        App.load();
    });
});
