INSERT INTO department (name)
VALUES  ("Coaching"),
        ("Marketing"),
        ("Medical"),
        ("Sales");

INSERT INTO role ( title, salary, department_id )
VALUES  ("Head Coach", 150000.00, 1),
        ("Assistant Coach", 120000.00, 1),
        ("Marketing Director", 160000.00, 2),
        ("Social Media Manager", 125000.00, 2),
        ("Team Physician", 250000.00, 3),
        ("Athletic Trainer", 190000.00, 3),
        ("Sales Manager", 100000.00, 4),
        ("Ticket Manager", 80000.00, 4);

INSERT INTO employee ( first_name, last_name, role_id, manager_id)
VALUES  ("Buck", "Showalter", 1, null),
        ("Jeremy", "Hefner", 2, 1),
        ("Steve", "Gelbs", 3, null),
        ("Gary", "Cohen", 4, 3),
        ("John", "Doe", 5, null),
        ("Mike", "Jones", 6, 5),
        ("Jane", "Smith", 7, null),
        ("Susan", "Allen", 8, 7);