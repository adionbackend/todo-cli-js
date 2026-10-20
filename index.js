#!/usr/bin/env node
import chalk from "chalk";
import db from "./db.js";
import inquirer from "inquirer";
import Table from "cli-table3";

// Helper Function for manipulating the todos db

function getTodos() {
    return db.prepare("SELECT * FROM todos").all();
}

function addTodo(task) {
    return db.prepare("INSERT INTO todos (task) VALUES (?)").run(task);
}

function completeTodo(id) {
    return db.prepare("UPDATE todos SET completed = 1 WHERE id = ?").run(id);
}

function deleteTodo(id) {
    return db.prepare("DELETE FROM todos WHERE id = ?").run(id);
}

const displayTodos = () => {
    const todos = getTodos();

    // console.log(todos);

    if (todos.length === 0) {
        console.log(chalk.yellow("\nNo tasks found. You are all caught up!\n"));
        return;
    }

    const table = new Table({
        head: [chalk.cyan("ID"), chalk.cyan("Task"), chalk.cyan("Status")],
        colWidths: [5, 40, 15],
    });

    todos.forEach((todo) => {
        const status = todo.completed
            ? chalk.green("Done")
            : chalk.red("Pending");
        const taskText = todo.completed
            ? chalk.gray.strikethrough(todo.task)
            : todo.task;
        table.push([todo.id, taskText, status]);
    });

    console.log(`\n${table.toString()}\n`);
};

const mainMenu = async () => {
    console.clear();
    console.log(chalk.bgBlue.white.bold(" --- MY TERMINAL TODO APP --- \n"));

    displayTodos();

    const { action } = await inquirer.prompt([
        {
            type: "select",
            name: "action",
            message: "What would you like to do?",
            choices: [
                "Add a Task",
                "Mark Task as Done",
                "Delete a Task",
                "Exit",
            ],
        },
    ]);

    switch (action) {
        case "Add a Task":
            await promptAddTask();
            break;
        case "Mark Task as Done":
            await promptCompleteTask();
            break;
        case "Delete a Task":
            await promptDeleteTask();
            break;
        case "Exit":
            console.log(chalk.green("Goodbye! Have a productive day!"));
            process.exit(0);
    }
};

const promptAddTask = async () => {
    const { task } = await inquirer.prompt([
        {
            type: "input",
            name: "task",
            message: "Enter your new task: ",
            validate: (input) => (input ? true : "Task cannot be empty!"),
        },
    ]);

    addTodo(task);

    console.log(chalk.green("Task added successfully!"));

    setTimeout(mainMenu, 1000);
};

const promptCompleteTask = async () => {
    const todos = getTodos().filter((todo) => todo.completed === 0);

    if (todos.length === 0) {
        console.log(chalk.yellow("No pending tasks to complete."));
        setTimeout(mainMenu, 1000);
        return;
    }

    const { id } = await inquirer.prompt([
        {
            type: "select",
            name: "id",
            message: "Select a task to mark as done: ",
            choices: todos.map((todo) => ({ name: todo.task, value: todo.id })),
        },
    ]);

    completeTodo(id);
    console.log(chalk.green("Task marked as completed!"));
    setTimeout(mainMenu, 1000);
};

const promptDeleteTask = async () => {
    const todos = getTodos();

    if (todos.length === 0) {
        console.log(chalk.yellow("No tasks to delete."));
        setTimeout(mainMenu, 1000);
        return;
    }

    const { id } = await inquirer.prompt([
        {
            type: "select",
            name: "id",
            message: "Select a task to delete: ",
            choices: todos.map((todo) => ({ name: todo.task, value: todo.id })),
        },
    ]);

    deleteTodo(id);
    console.log(chalk.red("Task deleted"));
    setTimeout(mainMenu, 1000);
};

mainMenu();
