drop database `app-chat`;
create database `app-chat`;
use `app-chat`;

DROP TABLE IF EXISTS user;
CREATE TABLE user(
  uid int(11) AUTO_INCREMENT,
  username varchar(255),
  password varchar(255),
  token varchar(255),
  photo varchar(255),
  PRIMARY KEY (uid, username)
);

INSERT INTO user(username, password, token, photo) VALUES
('van', 'van', 'opa92ujealsdbEsd81DGh', '/images/IU.png'),
('Alma.Byrd', '12345', 'q3KEhJlorb2u2hKkrD4E', '/images/1.jpg'),
('Shelly.Davidson', '12345', 'OcjoPzVzqHyO2FWlmYdj', '/images/2.jpg'),
('Muriel.Swanson', '12345', 'PKpvswV9YE8UMGfkpnK4', '/images/3.jpg'),
('Angelo.Fitzgerald', '12345', 'rCOSGiO6y9IgG6qLw9Dx', '/images/4.jpg'),
('Samantha.Dean', '12345', 'TJPbqn2yB7qaH6lt61ct', '/images/5.jpg'),
('Jackie.Garza', '12345', '1ioeakkMjrtdawXOZh7k', '/images/1.jpg'),
('Blanche.Dawson', '12345', 'tYktuHbiMhH1CH4QNOmq', '/images/2.jpg'),
('Andre.Ball', '12345', 'oGQH2rIYboFlHgBDZcOy', '/images/3.jpg'),
('Renee.White', '12345', 'xLYGkPIKwn1l3zgB4SJh', '/images/4.jpg'),
('Floyd.Hopkins', '12345', 'E9BfY1Lb8sSJredv9T3Z', '/images/5.jpg'),
('Sheryl.Zimmerman', '12345', '8ou26QqQuuhMzNn8zZ5I', '/images/1.jpg'),
('Agnes.Stevens', '12345', 'npVDowbNACiI4CIdI6C6', '/images/2.jpg'),
('Tommie.Ballard', '12345', '8NxgVfKZZyvLDWtIK6TX', '/images/3.jpg'),
('Connie.Logan', '12345', 'VhpZY33IMcAC6wh3PbxX', '/images/4.jpg'),
('Chelsea.French', '12345', 'V0DtAm2UdCwrxNe0VLAo', '/images/5.jpg');

DROP TABLE IF EXISTS groups;
CREATE TABLE groups(
  gid int(11) AUTO_INCREMENT,
  nama varchar(255),
  admin int(11),
  FOREIGN KEY (admin) REFERENCES user(uid),
  PRIMARY KEY (gid)
);
INSERT INTO groups(nama, admin) VALUES
('Group A', 1),
('Group B', 2),
('Group C', 3),
('Group D', 4),
('Group E', 5),
('Group F', 6),
('Group G', 7);

DROP TABLE IF EXISTS group_members;
CREATE TABLE group_members(
  gid int(11),
  uid int(11),
  FOREIGN KEY (gid) REFERENCES groups(gid),
  FOREIGN KEY (uid) REFERENCES user(uid)
);
INSERT INTO group_members(gid, uid) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(2, 2),
(2, 5),
(2, 6),
(2, 7),
(3, 1),
(3, 3),
(3, 6),
(3, 6),
(4, 8),
(4, 9),
(5, 10);

DROP TABLE IF EXISTS chat;
CREATE TABLE chat(
  cid int(11) AUTO_INCREMENT,
  content text,
  chat_from int(11),
  chat_to int(11),
  chat_to_group int(11),
  create_time timestamp,
  FOREIGN KEY (chat_from) REFERENCES user(uid),
  FOREIGN KEY (chat_to) REFERENCES user(uid),
  FOREIGN KEY (chat_to_group) REFERENCES groups(gid),
  PRIMARY KEY (cid)
);
INSERT INTO chat(content, chat_from, chat_to, chat_to_group, create_time) VALUES
("Hiii.", 1, 2, NULL, NOW()),
("She only paints with bold colors; she does not like pastels.", 1, 2, NULL, NOW()),
("OMG.", 2, 1, NULL, NOW()),
("Yihaa.", 1, 2, NULL, NOW()),
("OMG.", 2, 1, NULL, NOW()),
("Yuk Gelut...", 2, 1, NULL, NOW()),
("I really want to go to work, but I am too sick to drive.", 1, 1, NULL, NOW()),
("Italy is my favorite country; in fact, I plan to spend two weeks there next year.", 1, 3, NULL, NOW()),
("There were white out conditions in the town; subsequently, the roads were impassable.", 1, 4, NULL, NOW()),
("I would have gotten the promotion, but my attendance wasn’t good enough.", 1, 5, NULL, NOW()),
("The mysterious diary records the voice.", 1, NULL, 1, NOW()),
("If you like tuna and tomato sauce- try combining the two. It’s really not as bad as it sounds.", 2, 1, NULL, NOW()),
("Mary plays the piano.", 1, NULL, 1, NOW()),
("Don't step on the broken glass.", 1, NULL, 3, NOW()),
("He turned in the research paper on Friday; otherwise, he would have not passed the class.", 1, NULL, 3, NOW()),
("This is a Japanese doll.", 2, 4, NULL, NOW()),
("She works two jobs to make ends meet; at least, that was her reason for not having time to join us.", 3, 1, NULL, NOW()),
("There was no ice cream in the freezer, nor did they have money to go to the store.", 3, 2, NULL, NOW()),
("My Mum tries to be cool by saying that she likes all the same things that I do.", 3, 2, NULL, NOW()),
("She was too short to see over the fence.", 3, 4, NULL, NOW()),
("Wow, does that work?", 3, 4, NULL, NOW()),
("If Purple People Eaters are real… where do they find purple people to eat?", 4, 1, NULL, NOW()),
("We have a lot of rain in June.", 4, 1, NULL, NOW()),
("There were white out conditions in the town; subsequently, the roads were impassable.", 4, 1, NULL, NOW()),
("I checked to make sure that he was still alive.", 4, 1, NULL, NOW()),
("The stranger officiates the meal.", 4, 1, NULL, NOW()),
("If you like tuna and tomato sauce- try combining the two. It’s really not as bad as it sounds.", 4, 1, NULL, NOW()),
("The body may perhaps compensates for the loss of a true metaphysics.", 4, 1, NULL, NOW()),
("Don't step on the broken glass.", 4, 1, NULL, NOW()),
("Malls are great places to shop; I can find everything I need under one roof.", 4, 1, NULL, NOW()),
("This is the last random sentence I will be writing and I am going to stop mid-sent", 4, 1, NULL, NOW()),
("The book is in front of the table.", 4, 1, NULL, NOW()),
("I would have gotten the promotion, but my attendance wasn’t good enough.", 5, 1, NULL, NOW()),
("She did not cheat on the test, for it was not the right thing to do.", 5, 1, NULL, NOW()),
("The memory we used to share is no longer coherent.", 5, 1, NULL, NOW()),
("The quick brown fox jumps over the lazy dog.", 5, 1, NULL, NOW()),
("I want to buy a onesie… but know it won’t suit me.", 5, 1, NULL, NOW()),
("They got there early, and they got really good seats.", 5, 1, NULL, NOW()),
("Cats are good pets, for they are clean and are not noisy.", 5, 1, NULL, NOW()),
("Sixty-Four comes asking for bread.", 6, 1, NULL, NOW()),
("The mysterious diary records the voice.", 6, 1, NULL, NOW()),
("He turned in the research paper on Friday; otherwise, he would have not passed the class.", 6, 1, NULL, NOW()),
("I am never at home on Sundays.", 6, 1, NULL, NOW()),
("Sometimes it is better to just walk away from things and go back to them later when you’re in a better frame of mind.", 6, 1, NULL, NOW()),
("Writing a list of random sentences is harder than I initially thought it would be.", 6, 1, NULL, NOW()),
("The shooter says goodbye to his love.", 6, 1, NULL, NOW()),
("She advised him to come back at once.", 6, 1, NULL, NOW()),
("If the Easter Bunny and the Tooth Fairy had babies would they take your teeth and leave chocolate for you?", 6, 1, NULL, NOW()),
("Abstraction is often one floor above you.", 6, 1, NULL, NOW()),
("The old apple revels in its authority.", 6, 1, NULL, NOW()),
("Everyone was busy, so I went to the movie alone.", 6, 1, NULL, NOW()),
("The sky is clear; the stars are twinkling.", 6, 1, NULL, NOW()),
("Italy is my favorite country; in fact, I plan to spend two weeks there next year.", 7, 1, NULL, NOW()),
("Rock music approaches at high velocity.", 7, 1, NULL, NOW()),
("We need to rent a room for our party.", 7, 1, NULL, NOW()),
("Wednesday is hump day, but has anyone asked the camel if he’s happy about it?", 7, 1, NULL, NOW()),
("I am happy to take your donation; any amount will be greatly appreciated.", 7, 1, NULL, NOW()),
("She did her best to help him.", 7, 1, NULL, NOW()),
("We have never been to Asia, nor have we visited Africa.", 7, 1, NULL, NOW()),
("I often see the time 11:11 or 12:34 on clocks.", 7, 1, NULL, NOW()),
("She wrote him a long letter, but he didn't read it.", 8, 1, NULL, NOW()),
("The waves were crashing on the shore; it was a lovely sight.", 8, 1, NULL, NOW()),
("I really want to go to work, but I am too sick to drive.", 8, 1, NULL, NOW()),
("Please wait outside of the house.", 8, 1, NULL, NOW());

DROP TABLE IF EXISTS user_friend;
CREATE TABLE user_friend(
  uid int(11),
  fid int(11),
  create_time timestamp,
  FOREIGN KEY (uid) REFERENCES user(uid),
  FOREIGN KEY (fid) REFERENCES user(uid)
);
INSERT INTO user_friend(uid, fid) VALUES
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(2, 3),
(2, 4),
(3, 4);