//Select DOM elements.
const goal = document.querySelector(".goal");
const total = document.querySelector(".total");
const textarea = document.querySelector("textarea");
const displayArea = document.querySelector(".display-area");

//Add event listener for keydown events.
document.addEventListener("keydown", (event) => {
    //Check if the pressed key is "Enter".
    if (event.key == "Enter") {
        event.preventDefault();

        //If the textarea is not empty, add the item to the display area.
        if (textarea.value != "") {
            addItem();
        }
    }
});

let totalGoalAmount = 0; //Tracks the sum of all rewardInput values for displaying the goal.
let taskRewards = {}; //Object to store to-do list items as keys and their corresponding rewardInput values as values.
let taskKey = ""; //Variable to store the key (to-do-list item) in taskRewards.

let totalEarnedAmount = 0; //Tracks the sum of payments the user has received.
let completedTasks = {}; //Object to store completed to-do list items and their rewardInput values.
let completedTaskKey = ""; //Variable to store the key (completed to-do list item) in completedTasks.

let taskRewardsX; //Variable to store the reward value of the completed task for notification.
let n;

//Function to add item to the display area.
function addItem() {
    //Create new div element for the list container.
    let listContainer = document.createElement("div");
    listContainer.setAttribute("draggable", "true"); //Make the div draggable.
    listContainer.classList.add("draggable", "list-container"); //Add classes to the div.

    //Search for the word "payment" in the textarea value (case-insensitive).
    let matchText = textarea.value.match(/payment:/i);
    if (matchText) {
        n = textarea.value.search(/payment:/i);

        //Set the innerHTML of the list container, slicing the textarea value up to the position of "payment".
        listContainer.innerHTML = `
            <div class="check-box payment"><span class="check">&check;</span></div>
            <p class="item payment">${textarea.value.slice(0, n)}</p>
            <div class="cross payment">&cross;</div>
        `;

        let rewardDetails = textarea.value.slice(n);

        //Extract numbers from the textarea value.
        const pattern = /\d+(\.\d+)?/g;
        let  found = rewardDetails.match(pattern);
        let keyValue = found.toString().split(",").join(""); //Convert the array of numbers to a string.
        taskKey = textarea.value.slice(0, n); //Set the taskKey.
        updateGoal(taskKey, keyValue); //Update the goal with the task and its value. 
    } else {
        //If "payment" is not found, create a simple list item.
        listContainer.innerHTML = `
            <div class="check-box"><span class="check">&check;</span></div>
            <p class="item">${textarea.value}</p>
            <div class="cross">&cross;</div>
        `;
    }

    //Append the new list item to the display area.
    displayArea.appendChild(listContainer);
    textarea.value = ""; //Clear the textarea.
}

//Function to update the goal amount.
function updateGoal(key, value) {
    totalGoalAmount = 0; //Reset total goal amount.
    key = key.split(" ").join(""); //Remove spaces from the list item to use as key.
    taskRewards[key] = value; //Store the rewardInput value for the current list item in taskRewards.

    //Calculate the total goal amount by summing all rewardInput values in taskRewards.
    for (let x in taskRewards) {
        totalGoalAmount += parseFloat(taskRewards[x]);
    }

    goal.textContent = totalGoalAmount.toFixed(2); //Update the displayed goal amount.
}

//Work with the Notification API.
function showNotification() {
    const notification = new Notification("QUIX", {
        body: "You received a payment of " + "$" + taskRewardsX + "\n" + "Completed task: " + completedTaskKey
    });
}

function showCheck() {
    displayArea.addEventListener("click", (event) => {
        let container = event.target.closest(".check-box");
        if (container) {
            if (container.classList.contains("payment")) {
                container.firstElementChild.classList.toggle("show-check");
                if (container.firstElementChild.classList.contains("show-check")) {
                    taskRewardsX = undefined;
                    totalEarnedAmount = 0;
                    completedTaskKey = container.nextElementSibling.innerHTML.slice(0, n).split(" ").join(""); //Get the completed task's key (list item).

                    //Add the completed task's reward to completedTasks if it matches a task in taskRewards.
                    for (let x in taskRewards) {
                        if (completedTaskKey == x) {
                            completedTasks[completedTaskKey] = parseFloat(taskRewards[x]);
                            taskRewardsX = taskRewards[x];
                        }
                    }

                    //Calculate the total earned amount by summing all values in completedTasks.
                    for (let y in completedTasks) {
                        totalEarnedAmount += completedTasks[y];
                    }
                    total.textContent = totalEarnedAmount.toFixed(2); //Update the displayed total earned amount.

                    if (Notification.permission == "granted") {
                        if (taskRewardsX != undefined) {
                            showNotification();
                        }
                    } else if (Notification.permission != "denied") {
                        Notification.requestPermission().then((permission) => {
                            if (permission == "granted") {
                                if (taskRewardsX != undefined) {
                                    showNotification();
                                }
                            }
                        });
                    }
                } else {
                    let keyIdentifier = container.nextElementSibling.innerHTML.slice(0, n).split(" ").join("");

                    //Subtract the completed tasks's reward from totalEarnedAmount and remove it from completedTasks.
                    for (let x in completedTasks) {
                        if (keyIdentifier == x) {
                            let subtractValue = completedTasks[x];
                            totalEarnedAmount -= subtractValue;
                            total.textContent = totalEarnedAmount; //Update the displayed total earned amount.
                            delete completedTasks[x]; //Remove the completed task from completedTasks.
                        }
                    }
                }
            } else {
                container.firstElementChild.classList.toggle("show-check");
            }
        }
    });
}

showCheck();

//Function to handle the removal of list items.
function removeListItem() {
    displayArea.addEventListener("click", (event) => {
        let container = event.target.closest(".cross");
        if (container) {
            if (container.classList.contains("payment")) {
                event.target.parentElement.remove(); //Remove the list item container from the display area.
                let subtractValue = event.target.previousElementSibling.innerHTML.split(" ").join("");

                //Remove the corresponding task reward from totalGoalAmount and taskRewards.
                for (let x in taskRewards) {
                    if (subtractValue == x) {
                        totalGoalAmount -= taskRewards[x];
                        goal.textContent = totalGoalAmount; //Update the displayed goal amount.
                        delete taskRewards[x]; //Remove the task from taskRewards.
                    }
                }

                //Remove the corresponding completed task reward from totalEarnedAmount and completedTasks.
                for (let y in completedTasks) {
                    if (subtractValue == y) {
                        totalEarnedAmount -= completedTasks[y];
                        total.textContent = totalEarnedAmount; //Update the displayed total earned amount.
                        delete completedTasks[y]; //Remove the completed task from completedTasks.
                    }
                }
            } else {
                event.target.parentElement.remove();
            }
        }
    });
}

removeListItem();