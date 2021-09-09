create database charisma_emphasis;

use charisma_emphasis;

create table turker(turk_id varchar(70), name varchar(35), email varchar(35), continuing_code VARCHAR(25), continuing_page INTEGER, utter_allotted VARCHAR(25), primary key(turk_id));

create table study(study_id varchar(10), start_of_study datetime, end_of_study datetime,Primary Key(study_id));

create table completion(study_id varchar(10),turk_id varchar(70), start_time varchar(40), end_time varchar(40),  completion_code varchar(10), primary key(study_id, turk_id), foreign key(study_id) references study(study_id), foreign key(turk_id) references turker(turk_id) on delete cascade);

create table emphasis_data(time_date varchar(30), user_id varchar(70), current_version_number varchar(30), study_id varchar(10), emphasis_dat TEXT NOT NULL, primary key(time_date), foreign key(study_id) references study(study_id), foreign key(user_id) references turker(turk_id) on delete cascade);

create table audio_version(study_id varchar(10), current_version_number varchar(10) primary key, foreign key(study_id) references study(study_id));
