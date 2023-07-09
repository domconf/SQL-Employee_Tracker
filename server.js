const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

function askQuestion(toStart) {
    const questions = [
        {
            type: 'input',
            name: 'startUp',
            message: 'Press any key or Enter to continue',
            when: !toStart,
        },
        {
            type: 'list',
            name: 'likeToDo',
            message: `What would you like to do?`,
            choices: [
                'View All Employees',
                'Add Employee',
                'Update Employee Role',
                'View All Roles',
                'Add Role',
                'View All Departments',
                'Add Department',
                'Quit',
            ],
        },
    ];

    inquirer
        .prompt(questions)
        .then((data) => {
            switch (data.likeToDo) {
                case 'View All Employees':
                    displayAll(`SELECT employee.id, employee.first_name, employee.last_name, role.title AS title, department.name AS department, salary, CONCAT(manager.first_name , " ", manager.last_name) as Manager
          FROM employee
          INNER JOIN role ON employee.role_id = role.id
          INNER JOIN department ON role.department_id = department.id
          LEFT JOIN employee manager ON employee.manager_id = manager.id
          ORDER BY id;`);
                    break;

                case 'Add Employee':
                    addEmployee();
                    break;

                case 'Update Employee Role':
                    updateEmployeeRole();
                    break;

                case 'View All Roles':
                    displayAll(`SELECT role.id AS id, role.title AS title, department.name AS department, role.salary AS salary
          FROM role
          INNER JOIN department ON role.department_id = department.id`);
                    break;

                case 'Add Role':
                    addRole();
                    break;

                case 'View All Departments':
                    displayAll(`SELECT department.id AS id, name AS department
          FROM department;`);
                    break;

                case 'Add Department':
                    addDepartment();
                    break;

                default:
                    process.exit();
                    break;
            }
        })
        .catch((err) => console.error(err));
}


function displayAll(userSelect) {
    db.query(userSelect, (err, result) => {
        if (err) {
            console.log(err);
        }
        console.table(result);
        askQuestion();
    });
}

function addDepartment() {
    const question = [
        {
            type: 'input',
            name: 'addDepartment',
            message: `What is the name of the department?`,
        },
    ];

    inquirer.prompt(question).then(({ addDepartment } = data) => {
        const userSelect = `INSERT INTO department(name)             
          Values ('${addDepartment}');
          `;
        db.query(userSelect, (err, result) => {
            if (err) {
                console.log(err);
            }
            console.info(`${addDepartment} has been added to the database.`);
            askQuestion();
        });
    });
}

async function addRole() {
    try {
        const [result] = await db.promise().query(`SELECT * FROM department`);

        const deptName = result.map(({ id, name }) => {
            return { name, value: id };
        });

        const question = [
            {
                type: 'input',
                name: 'title',
                message: `What is the name of the role?`,
            },
            {
                type: 'input',
                name: 'salary',
                message: `What is the salary of the role?`,
            },
            {
                type: 'list',
                name: 'department_id',
                message: `which department does the role belong to?`,
                choices: deptName,
            },
        ];

        const data = await inquirer.prompt(question);
        const userSelect = `INSERT INTO role SET ?`;
        await db.promise().query(userSelect, data);

        console.info(`Added ${data.title} the database`);
        askQuestion();
    } catch (err) {
        console.log(err);
    }
}

async function addEmployee() {
    let roleList, managerList;

    const [roles] = await db.promise().query(`SELECT title, id FROM role`);
    roleList = roles.map(({ title, id }) => {
        return { name: title, value: id };
    });

    const [managers] = await db
        .promise()
        .query(
            `SELECT first_name, last_name, id FROM employee WHERE employee.manager_id IS NULL`
        );

    managerList = managers.map(({ first_name, last_name, id }) => {
        return { name: `${first_name} ${last_name}`, value: id };
    });
    managerList.push({ name: 'None', value: null });

    const question = [
        {
            type: 'input',
            name: 'first_name',
            message: `What is the employee's first name?`,
        },
        {
            type: 'input',
            name: 'last_name',
            message: `What is the employee's last name?`,
        },
        {
            type: 'list',
            name: 'role_id',
            message: `What is the employee's role?`,
            choices: roleList,
        },
        {
            type: 'list',
            name: 'manager_id',
            message: `Who is the employee's manager?`,
            choices: managerList,
        },
    ];

    const data = await inquirer.prompt(question);
    const userSelect = `INSERT INTO employee SET ?`;
    await db.promise().query(userSelect, data);

    console.info(`Added ${data.first_name} ${data.last_name} to the database`);

    askQuestion();
}

async function updateEmployeeRole() {
    const userSelect = `SELECT id, first_name, last_name FROM employee`;

    let employeeList, roleList;

    const [employees] = await db.promise().query(userSelect);
    employeeList = employees.map(({ id, first_name, last_name } = employee) => {
        return { name: `${first_name} ${last_name}`, value: id };
    });

    const [roles] = await db.promise().query(`SELECT title, id FROM role`);
    roleList = roles.map(({ title, id }) => {
        return { name: title, value: id };
    });

    const question = [
        {
            type: 'list',
            name: 'employee_id',
            message: `Which employee's role do you want to update`,
            choices: employeeList,
        },
        {
            type: 'list',
            name: 'role_id',
            message: `Which role do you want to assign to the selected employee?`,
            choices: roleList,
        },
    ];

    inquirer.prompt(question).then(({ employee_id, role_id }) => {
        const userSelect = `UPDATE employee SET role_id = ${role_id} WHERE id = ${employee_id};`;

        db.query(userSelect, (err, result) => {
            if (err) {
                console.log(err);
            }
            console.info(`Updated employee's role`);
            askQuestion();
        });
    });
}

askQuestion(true);
