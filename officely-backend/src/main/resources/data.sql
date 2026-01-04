INSERT INTO offices
(name, description, address, min_price, max_price, latitude, longitude, workspace_type,
 wifi, access24h, kitchen, parking, wheelchair_accessible, quiet, social, monitor, printer)
VALUES
    ('Desk Hub Centrum', 'Nice desks', 'Warsaw Center', 80, 150, 52.2297, 21.0122, 'DESK',
     true, false, true, false, false, true, false, true, true),

    ('Private Office Mokotów', 'Private rooms', 'Mokotów', 200, 400, 52.1934, 21.0340, 'PRIVATE_OFFICE',
     true, true, true, true, true, false, true, true, false),

    ('Budget Desk Praga', 'Cheap desks', 'Praga', 40, 90, 52.2510, 21.0440, 'DESK',
     false, false, false, false, false, true, false, false, false),
    ('Budget Desk Berlin', 'Cheap desks', 'Berlin', 40, 90, 52.3112,  13.2418, 'DESK',
        false, false, false, false, false, true, false, false, false);

