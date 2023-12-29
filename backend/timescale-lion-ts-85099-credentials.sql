/****  GET STARTED WITH YOUR TIMESCALE SERVICE  ****/



SERVICE INFORMATION:

Service name:  lion-ts-85099
Database name: tsdb
Username:      tsdbadmin
Password:      fchgzjg875oqwz5u
Service URL:   postgres://tsdbadmin:fchgzjg875oqwz5u@tsu63xo98h.rlyd5lqw2j.tsdb.cloud.timescale.com:39646/tsdb?sslmode=require
Port:          39646


~/.pg_service.conf
echo "
[lion-ts-85099]
host=tsu63xo98h.rlyd5lqw2j.tsdb.cloud.timescale.com
port=39646
user=tsdbadmin
password=fchgzjg875oqwz5u
dbname=tsdb
" >> ~/.pg_service.conf
psql -d "service=lion-ts-85099"

----------------------------------------------------------------------------

/*
 ╔╗
╔╝║
╚╗║
 ║║         CONNECT TO YOUR SERVICE
╔╝╚╦╗
╚══╩╝

 ​
1. Install psql:
    https://blog.timescale.com/blog/how-to-install-psql-on-mac-ubuntu-debian-windows/

2. From your command line, run:
    psql "postgres://tsdbadmin:fchgzjg875oqwz5u@tsu63xo98h.rlyd5lqw2j.tsdb.cloud.timescale.com:39646/tsdb?sslmode=require"
*/

----------------------------------------------------------------------------

/*
╔═══╗
║╔═╗║
╚╝╔╝║
╔═╝╔╝	    CREATE A HYPERTABLE
║ ╚═╦╗
╚═══╩╝
*/

CREATE TABLE conditions (	-- create a regular table
    time        TIMESTAMPTZ       NOT NULL,
    location    TEXT              NOT NULL,
    temperature DOUBLE PRECISION  NULL
);

SELECT create_hypertable('conditions', 'time');	-- turn it into a hypertable

----------------------------------------------------------------------------

/*
╔═══╗
║╔═╗║
╚╝╔╝║
╔╗╚╗║      INSERT DATA
║╚═╝╠╗
╚═══╩╝
*/

INSERT INTO conditions
  VALUES
    (NOW(), 'office', 70.0),
    (NOW(), 'basement', 66.5),
    (NOW(), 'garage', 77.0);
​
----------------------------------------------------------------------------

/*
FOR MORE DOCUMENTATION AND GUIDES, VISIT	>>>--->	HTTPS://DOCS.TIMESCALE.COM/
*/